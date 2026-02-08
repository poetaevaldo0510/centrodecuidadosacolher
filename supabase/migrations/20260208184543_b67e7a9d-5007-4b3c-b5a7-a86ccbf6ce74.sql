-- Create storage bucket for partner logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-logos', 'partner-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for partner logos bucket
CREATE POLICY "Anyone can view partner logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'partner-logos');

CREATE POLICY "Admins can upload partner logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'partner-logos' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update partner logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'partner-logos' 
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete partner logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'partner-logos' 
  AND public.has_role(auth.uid(), 'admin')
);