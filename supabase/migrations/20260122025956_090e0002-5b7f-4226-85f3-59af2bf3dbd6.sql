-- Create professional_reviews table for rating and feedback
CREATE TABLE public.professional_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(professional_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.professional_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view reviews for their professionals" 
ON public.professional_reviews 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.professionals 
    WHERE professionals.id = professional_reviews.professional_id 
    AND professionals.parent_user_id = auth.uid()
  )
);

CREATE POLICY "Users can create reviews for professionals they hired" 
ON public.professional_reviews 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.professionals 
    WHERE professionals.id = professional_reviews.professional_id 
    AND professionals.parent_user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own reviews" 
ON public.professional_reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
ON public.professional_reviews 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_professional_reviews_updated_at
BEFORE UPDATE ON public.professional_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();