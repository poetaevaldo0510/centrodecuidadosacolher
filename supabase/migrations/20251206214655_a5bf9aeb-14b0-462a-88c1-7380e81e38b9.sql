-- Create blocked_users table for repeat offenders
CREATE TABLE public.blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  blocked_by UUID NOT NULL,
  reason TEXT NOT NULL,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_permanent BOOLEAN DEFAULT false,
  report_count INTEGER DEFAULT 1
);

-- Enable RLS
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage blocked users"
ON public.blocked_users
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Moderators can view blocked users"
ON public.blocked_users
FOR SELECT
USING (has_role(auth.uid(), 'moderator'::app_role));

-- Add index for performance
CREATE INDEX idx_blocked_users_user_id ON public.blocked_users(user_id);
CREATE INDEX idx_blocked_users_expires ON public.blocked_users(expires_at) WHERE expires_at IS NOT NULL;

-- Create function to check if user is blocked
CREATE OR REPLACE FUNCTION public.is_user_blocked(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.blocked_users
    WHERE user_id = _user_id
    AND (is_permanent = true OR expires_at > now())
  )
$$;

-- Add reported_user_id column to content_reports if not exists
ALTER TABLE public.content_reports ADD COLUMN IF NOT EXISTS reported_user_id UUID;