-- Add reply/mention support to feed_comments
ALTER TABLE public.feed_comments 
ADD COLUMN parent_id uuid REFERENCES public.feed_comments(id) ON DELETE CASCADE,
ADD COLUMN mentioned_user_id uuid;

-- Create indexes for better performance
CREATE INDEX idx_feed_comments_parent_id ON public.feed_comments(parent_id);
CREATE INDEX idx_feed_comments_mentioned_user_id ON public.feed_comments(mentioned_user_id);