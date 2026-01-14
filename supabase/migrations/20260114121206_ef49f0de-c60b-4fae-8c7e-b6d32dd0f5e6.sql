
-- Create professionals table for sub-registration (nurses, caregivers, etc.)
CREATE TABLE public.professionals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_type TEXT NOT NULL CHECK (professional_type IN ('enfermeira', 'cuidador', 'terapeuta', 'outro')),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  license_number TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create marketplace sales table to track sales with commission
CREATE TABLE public.marketplace_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.marketplace_items(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT,
  buyer_phone TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL, -- 10% commission
  seller_amount NUMERIC NOT NULL, -- Amount after commission
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  payment_method TEXT,
  notes TEXT,
  external_sale BOOLEAN DEFAULT false,
  share_link_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add share_link column to marketplace_items
ALTER TABLE public.marketplace_items 
ADD COLUMN IF NOT EXISTS share_link TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS total_sales INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_revenue NUMERIC DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_sales ENABLE ROW LEVEL SECURITY;

-- Professionals policies
CREATE POLICY "Users can view their own professionals" 
ON public.professionals FOR SELECT 
USING (auth.uid() = parent_user_id OR auth.uid() = user_id);

CREATE POLICY "Users can add professionals" 
ON public.professionals FOR INSERT 
WITH CHECK (auth.uid() = parent_user_id);

CREATE POLICY "Users can update their own professionals" 
ON public.professionals FOR UPDATE 
USING (auth.uid() = parent_user_id);

CREATE POLICY "Users can delete their own professionals" 
ON public.professionals FOR DELETE 
USING (auth.uid() = parent_user_id);

-- Marketplace sales policies
CREATE POLICY "Sellers can view their own sales" 
ON public.marketplace_sales FOR SELECT 
USING (auth.uid() = seller_id);

CREATE POLICY "Anyone can create sales" 
ON public.marketplace_sales FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Sellers can update their own sales" 
ON public.marketplace_sales FOR UPDATE 
USING (auth.uid() = seller_id);

CREATE POLICY "Admins can view all sales" 
ON public.marketplace_sales FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to generate unique share link
CREATE OR REPLACE FUNCTION generate_share_link()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.share_link IS NULL THEN
    NEW.share_link := encode(gen_random_bytes(8), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate share link
CREATE TRIGGER trigger_generate_share_link
BEFORE INSERT ON public.marketplace_items
FOR EACH ROW EXECUTE FUNCTION generate_share_link();

-- Update existing items with share links
UPDATE public.marketplace_items 
SET share_link = encode(gen_random_bytes(8), 'hex') 
WHERE share_link IS NULL;

-- Function to calculate commission on sale
CREATE OR REPLACE FUNCTION calculate_sale_commission()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_price := NEW.unit_price * NEW.quantity;
  NEW.platform_fee := NEW.total_price * 0.10; -- 10% commission
  NEW.seller_amount := NEW.total_price - NEW.platform_fee;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate commission
CREATE TRIGGER trigger_calculate_commission
BEFORE INSERT OR UPDATE ON public.marketplace_sales
FOR EACH ROW EXECUTE FUNCTION calculate_sale_commission();
