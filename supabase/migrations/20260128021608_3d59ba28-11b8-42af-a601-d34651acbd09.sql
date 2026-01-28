-- Create community_recommendations table for therapists and professionals recommendations
CREATE TABLE public.community_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  description TEXT,
  city TEXT,
  state TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  instagram TEXT,
  is_online BOOLEAN DEFAULT false,
  rating_avg NUMERIC DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews for community recommendations
CREATE TABLE public.recommendation_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recommendation_id UUID NOT NULL REFERENCES public.community_recommendations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint on recommendation_id + user_id
ALTER TABLE public.recommendation_reviews ADD CONSTRAINT unique_user_recommendation_review UNIQUE (recommendation_id, user_id);

-- Enable RLS
ALTER TABLE public.community_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_reviews ENABLE ROW LEVEL SECURITY;

-- Policies for community_recommendations
CREATE POLICY "Anyone authenticated can view recommendations"
ON public.community_recommendations
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create recommendations"
ON public.community_recommendations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations"
ON public.community_recommendations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recommendations"
ON public.community_recommendations
FOR DELETE
USING (auth.uid() = user_id);

-- Policies for recommendation_reviews
CREATE POLICY "Anyone authenticated can view reviews"
ON public.recommendation_reviews
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create reviews"
ON public.recommendation_reviews
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON public.recommendation_reviews
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON public.recommendation_reviews
FOR DELETE
USING (auth.uid() = user_id);

-- Function to update rating averages
CREATE OR REPLACE FUNCTION public.update_recommendation_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.community_recommendations
    SET 
      rating_avg = (SELECT COALESCE(AVG(rating), 0) FROM public.recommendation_reviews WHERE recommendation_id = NEW.recommendation_id),
      rating_count = (SELECT COUNT(*) FROM public.recommendation_reviews WHERE recommendation_id = NEW.recommendation_id),
      updated_at = now()
    WHERE id = NEW.recommendation_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_recommendations
    SET 
      rating_avg = (SELECT COALESCE(AVG(rating), 0) FROM public.recommendation_reviews WHERE recommendation_id = OLD.recommendation_id),
      rating_count = (SELECT COUNT(*) FROM public.recommendation_reviews WHERE recommendation_id = OLD.recommendation_id),
      updated_at = now()
    WHERE id = OLD.recommendation_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update ratings
CREATE TRIGGER update_recommendation_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.recommendation_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_recommendation_rating();

-- Enable realtime for recommendations
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_recommendations;