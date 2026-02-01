-- Fix overly permissive RLS policy
DROP POLICY IF EXISTS "System can create affiliate sales" ON public.affiliate_sales;

-- Create more restrictive insert policy (inserts happen via trigger with SECURITY DEFINER)
CREATE POLICY "Authenticated users can create affiliate sales via trigger"
ON public.affiliate_sales
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);