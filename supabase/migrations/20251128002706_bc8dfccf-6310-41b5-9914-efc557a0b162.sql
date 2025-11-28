-- Create resources library table
CREATE TABLE public.resources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  content text,
  type text NOT NULL CHECK (type IN ('article', 'video', 'tip')),
  category text NOT NULL,
  url text,
  thumbnail_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for resources
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Resources are viewable by everyone
CREATE POLICY "Resources are viewable by everyone"
ON public.resources
FOR SELECT
USING (true);

-- Create progress photos table
CREATE TABLE public.progress_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_name text,
  photo_url text NOT NULL,
  caption text,
  milestone_type text,
  date_taken timestamp with time zone NOT NULL DEFAULT now(),
  is_before boolean DEFAULT false,
  comparison_pair_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for progress photos
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

-- Users can view their own photos
CREATE POLICY "Users can view their own photos"
ON public.progress_photos
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own photos
CREATE POLICY "Users can create their own photos"
ON public.progress_photos
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own photos
CREATE POLICY "Users can update their own photos"
ON public.progress_photos
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own photos
CREATE POLICY "Users can delete their own photos"
ON public.progress_photos
FOR DELETE
USING (auth.uid() = user_id);

-- Create calendar events table
CREATE TABLE public.calendar_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  event_type text NOT NULL CHECK (event_type IN ('appointment', 'medication', 'therapy', 'other')),
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone,
  location text,
  remind_before_minutes integer DEFAULT 30,
  completed boolean DEFAULT false,
  recurrence text CHECK (recurrence IN ('none', 'daily', 'weekly', 'monthly')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for calendar events
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own events
CREATE POLICY "Users can view their own events"
ON public.calendar_events
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own events
CREATE POLICY "Users can create their own events"
ON public.calendar_events
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own events
CREATE POLICY "Users can update their own events"
ON public.calendar_events
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own events
CREATE POLICY "Users can delete their own events"
ON public.calendar_events
FOR DELETE
USING (auth.uid() = user_id);

-- Add triggers for updated_at columns
CREATE TRIGGER update_resources_updated_at
BEFORE UPDATE ON public.resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_progress_photos_updated_at
BEFORE UPDATE ON public.progress_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at
BEFORE UPDATE ON public.calendar_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for progress photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos', 'progress-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for progress photos
CREATE POLICY "Users can view progress photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'progress-photos');

CREATE POLICY "Users can upload their own progress photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'progress-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own progress photos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'progress-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own progress photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'progress-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add some sample resources
INSERT INTO public.resources (title, description, content, type, category, url) VALUES
('Understanding Autism Spectrum Disorder', 'Learn about the basics of autism and how it affects children', 'Comprehensive guide about autism spectrum disorder, its symptoms, diagnosis, and management strategies...', 'article', 'Education', NULL),
('Speech Therapy Techniques at Home', 'Simple exercises you can do with your child', 'Video demonstrating effective speech therapy techniques that parents can practice at home...', 'video', 'Therapy', 'https://www.youtube.com/watch?v=example1'),
('Managing Sensory Overload', 'Tips for handling sensory challenges', 'Quick tips: Create a quiet space, use noise-canceling headphones, maintain predictable routines...', 'tip', 'Daily Life', NULL),
('Inclusive Education Guide', 'How to advocate for your child in school', 'A complete guide on working with schools to ensure your child receives appropriate accommodations...', 'article', 'Education', NULL),
('Occupational Therapy Basics', 'Introduction to OT for special needs children', 'Video explaining the role of occupational therapy and common exercises used with children...', 'video', 'Therapy', 'https://www.youtube.com/watch?v=example2');