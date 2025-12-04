-- Create comments table for social feed
CREATE TABLE public.feed_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.social_feed(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  anonymous_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for comments
CREATE POLICY "Everyone can view comments" ON public.feed_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.feed_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.feed_comments FOR DELETE USING (auth.uid() = user_id);

-- Create rewards store table
CREATE TABLE public.rewards_store (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  points_cost INTEGER NOT NULL,
  reward_type TEXT NOT NULL DEFAULT 'badge', -- 'badge', 'feature', 'theme'
  badge_id UUID REFERENCES public.badges(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.rewards_store ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view active rewards" ON public.rewards_store FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage rewards" ON public.rewards_store FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create purchase history table
CREATE TABLE public.reward_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_id UUID NOT NULL REFERENCES public.rewards_store(id),
  points_spent INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.reward_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their purchases" ON public.reward_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can make purchases" ON public.reward_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add trigger to update comments count
CREATE OR REPLACE FUNCTION public.update_feed_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.social_feed SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.social_feed SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_comment_change
AFTER INSERT OR DELETE ON public.feed_comments
FOR EACH ROW EXECUTE FUNCTION public.update_feed_comments_count();

-- Insert some default rewards
INSERT INTO public.rewards_store (name, description, icon, points_cost, reward_type) VALUES
('Badge Estrela Dourada', 'Badge exclusivo para membros dedicados', '⭐', 500, 'badge'),
('Badge Super Herói', 'Reconhecimento por consistência excepcional', '🦸', 1000, 'badge'),
('Tema Escuro Premium', 'Desbloqueie cores exclusivas', '🎨', 750, 'theme'),
('Badge Diamante', 'O mais raro de todos os badges', '💎', 2000, 'badge');