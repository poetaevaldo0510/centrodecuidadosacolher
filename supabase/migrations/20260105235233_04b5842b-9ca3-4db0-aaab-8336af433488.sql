-- Add category column to marketplace_items
ALTER TABLE public.marketplace_items 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'outros';

-- Create search_history table for storing user search queries
CREATE TABLE public.search_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on search_history
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Policies for search_history
CREATE POLICY "Users can view their own search history"
ON public.search_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own search history"
ON public.search_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search history"
ON public.search_history
FOR DELETE
USING (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- Add view count to marketplace_items
ALTER TABLE public.marketplace_items 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create index for category
CREATE INDEX IF NOT EXISTS idx_marketplace_items_category ON public.marketplace_items(category);

-- Create index for user search history
CREATE INDEX IF NOT EXISTS idx_search_history_user_created ON public.search_history(user_id, created_at DESC);

-- Create index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read, created_at DESC);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;