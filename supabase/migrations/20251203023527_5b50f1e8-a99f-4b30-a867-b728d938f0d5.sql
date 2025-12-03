-- Fix function search path for update_feed_likes_count
CREATE OR REPLACE FUNCTION update_feed_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.social_feed 
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.social_feed 
    SET likes_count = likes_count - 1
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add policy for users to insert their own levels (for new users)
CREATE POLICY "Users can insert their own level"
ON public.user_levels FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add policy for users to insert their own badges
CREATE POLICY "Users can earn badges"
ON public.user_badges FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add policy for users to insert activity logs
CREATE POLICY "Users can create their own activity logs"
ON public.activity_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add policy for users to insert challenge progress
CREATE POLICY "Users can create their own progress"
ON public.user_challenge_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);