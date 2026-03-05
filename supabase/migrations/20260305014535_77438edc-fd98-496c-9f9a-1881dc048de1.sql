
CREATE POLICY "Professionals can update their own invitation status"
ON public.professionals
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (
  invitation_token IS NOT NULL 
  AND auth.uid() = user_id
);
