-- Create affiliate links table
CREATE TABLE public.affiliate_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  affiliate_code TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  commission_rate NUMERIC DEFAULT 0.05, -- 5% affiliate commission
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create affiliate sales tracking table
CREATE TABLE public.affiliate_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_link_id UUID NOT NULL REFERENCES public.affiliate_links(id) ON DELETE CASCADE,
  sale_id UUID NOT NULL REFERENCES public.marketplace_sales(id) ON DELETE CASCADE,
  affiliate_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  sale_amount NUMERIC NOT NULL,
  affiliate_commission NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add affiliate tracking to marketplace_sales
ALTER TABLE public.marketplace_sales 
ADD COLUMN IF NOT EXISTS affiliate_link_id UUID REFERENCES public.affiliate_links(id),
ADD COLUMN IF NOT EXISTS affiliate_commission NUMERIC DEFAULT 0;

-- Enable RLS
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_sales ENABLE ROW LEVEL SECURITY;

-- RLS for affiliate_links
CREATE POLICY "Users can view all active affiliate links"
ON public.affiliate_links
FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can create affiliate links"
ON public.affiliate_links
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own affiliate links"
ON public.affiliate_links
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own affiliate links"
ON public.affiliate_links
FOR DELETE
USING (auth.uid() = user_id);

-- RLS for affiliate_sales
CREATE POLICY "Affiliates can view their own sales"
ON public.affiliate_sales
FOR SELECT
USING (auth.uid() = affiliate_id);

CREATE POLICY "Sellers can view affiliate sales of their products"
ON public.affiliate_sales
FOR SELECT
USING (auth.uid() = seller_id);

CREATE POLICY "System can create affiliate sales"
ON public.affiliate_sales
FOR INSERT
WITH CHECK (true);

-- Function to calculate affiliate commission on sale
CREATE OR REPLACE FUNCTION public.process_affiliate_sale()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_affiliate_link affiliate_links%ROWTYPE;
  v_affiliate_commission NUMERIC;
BEGIN
  -- Check if sale has affiliate link
  IF NEW.affiliate_link_id IS NOT NULL THEN
    -- Get affiliate link details
    SELECT * INTO v_affiliate_link FROM affiliate_links WHERE id = NEW.affiliate_link_id;
    
    IF FOUND THEN
      -- Calculate 5% affiliate commission from seller amount
      v_affiliate_commission := NEW.seller_amount * v_affiliate_link.commission_rate;
      NEW.affiliate_commission := v_affiliate_commission;
      
      -- Update affiliate link stats
      UPDATE affiliate_links SET
        conversions = conversions + 1,
        total_earnings = total_earnings + v_affiliate_commission,
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

-- Create trigger for affiliate sales
CREATE TRIGGER trigger_process_affiliate_sale
AFTER INSERT ON public.marketplace_sales
FOR EACH ROW
EXECUTE FUNCTION public.process_affiliate_sale();

-- Enable realtime for affiliate tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.affiliate_links;
ALTER PUBLICATION supabase_realtime ADD TABLE public.affiliate_sales;