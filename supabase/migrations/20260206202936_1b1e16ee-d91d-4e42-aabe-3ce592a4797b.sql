-- Fix the function search path for get_affiliate_commission_rate
CREATE OR REPLACE FUNCTION public.get_affiliate_commission_rate(earnings numeric)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
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