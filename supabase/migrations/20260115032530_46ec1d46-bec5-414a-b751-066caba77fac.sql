
-- Fix function search_path for generate_share_link
CREATE OR REPLACE FUNCTION generate_share_link()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.share_link IS NULL THEN
    NEW.share_link := encode(gen_random_bytes(8), 'hex');
  END IF;
  RETURN NEW;
END;
$$;

-- Fix function search_path for calculate_sale_commission
CREATE OR REPLACE FUNCTION calculate_sale_commission()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.total_price := NEW.unit_price * NEW.quantity;
  NEW.platform_fee := NEW.total_price * 0.10;
  NEW.seller_amount := NEW.total_price - NEW.platform_fee;
  RETURN NEW;
END;
$$;

-- Update sales policy to be more restrictive - require product exists
DROP POLICY IF EXISTS "Anyone can create sales" ON public.marketplace_sales;

CREATE POLICY "Anyone can create sales for existing products" 
ON public.marketplace_sales FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.marketplace_items 
    WHERE id = product_id
  )
);
