
ALTER TABLE public.professionals
ADD COLUMN invitation_status text DEFAULT 'pending',
ADD COLUMN invitation_token text,
ADD COLUMN invited_at timestamptz;
