-- Create a function to get commission rate based on total earnings
CREATE OR REPLACE FUNCTION public.get_affiliate_commission_rate(earnings numeric)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Diamante: R$ 2000+ = 8%
  IF earnings >= 2000 THEN
    RETURN 0.08;
  -- Ouro: R$ 500-1999.99 = 7%
  ELSIF earnings >= 500 THEN
    RETURN 0.07;
  -- Prata: R$ 100-499.99 = 6%
  ELSIF earnings >= 100 THEN
    RETURN 0.06;
  -- Bronze: R$ 0-99.99 = 5%
  ELSE
    RETURN 0.05;
  END IF;
END;
$$;

-- Update the process_affiliate_sale function to use dynamic commission rates
CREATE OR REPLACE FUNCTION public.process_affiliate_sale()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_affiliate_link affiliate_links%ROWTYPE;
  v_affiliate_commission NUMERIC;
  v_dynamic_commission_rate NUMERIC;
BEGIN
  -- Check if sale has affiliate link
  IF NEW.affiliate_link_id IS NOT NULL THEN
    -- Get affiliate link details
    SELECT * INTO v_affiliate_link FROM affiliate_links WHERE id = NEW.affiliate_link_id;
    
    IF FOUND THEN
      -- Calculate dynamic commission rate based on affiliate's total earnings
      v_dynamic_commission_rate := get_affiliate_commission_rate(COALESCE(v_affiliate_link.total_earnings, 0));
      
      -- Calculate affiliate commission using the dynamic rate from seller amount
      v_affiliate_commission := NEW.seller_amount * v_dynamic_commission_rate;
      NEW.affiliate_commission := v_affiliate_commission;
      
      -- Update affiliate link stats (including the new commission rate for reference)
      UPDATE affiliate_links SET
        conversions = conversions + 1,
        total_earnings = total_earnings + v_affiliate_commission,
        commission_rate = v_dynamic_commission_rate, -- Update to reflect current rate
        updated_at = now()
      WHERE id = NEW.affiliate_link_id;
      
      -- Create affiliate sale record
      INSERT INTO affiliate_sales (
        affiliate_link_id,
        sale_id,
        affiliate_id,
        seller_id,
        sale_amount,
        affiliate_commission
      ) VALUES (
        NEW.affiliate_link_id,
        NEW.id,
        v_affiliate_link.user_id,
        NEW.seller_id,
        NEW.total_price,
        v_affiliate_commission
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add comment to document the commission tiers
COMMENT ON FUNCTION public.get_affiliate_commission_rate(numeric) IS 'Returns commission rate based on affiliate level: Bronze (0-99.99) = 5%, Prata (100-499.99) = 6%, Ouro (500-1999.99) = 7%, Diamante (2000+) = 8%';