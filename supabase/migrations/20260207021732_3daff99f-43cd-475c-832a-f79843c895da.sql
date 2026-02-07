-- Create partners table for managing dynamic partners
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'apoiador_ouro', 'parceiro_clinico', 'parceiro_comercial', etc
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create partnership inquiries table for contact form submissions
CREATE TABLE public.partnership_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  inquiry_type TEXT NOT NULL, -- 'apoiador', 'parceiro_comercial', 'outro'
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'contacted', 'approved', 'rejected'
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_inquiries ENABLE ROW LEVEL SECURITY;

-- Partners policies - everyone can view active partners
CREATE POLICY "Anyone can view active partners"
  ON public.partners
  FOR SELECT
  USING (is_active = true);

-- Admins can manage partners
CREATE POLICY "Admins can manage partners"
  ON public.partners
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Partnership inquiries policies - authenticated users can submit inquiries
CREATE POLICY "Authenticated users can submit inquiries"
  ON public.partnership_inquiries
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can view and manage all inquiries
CREATE POLICY "Admins can manage inquiries"
  ON public.partnership_inquiries
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Create updated_at trigger for partners
CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for partnership_inquiries
CREATE TRIGGER update_partnership_inquiries_updated_at
  BEFORE UPDATE ON public.partnership_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial partners
INSERT INTO public.partners (name, type, description, display_order) VALUES
  ('Instituto Incluir', 'apoiador_ouro', 'Apoio institucional e recursos para famílias atípicas', 1),
  ('Clínica Desenvolvimento', 'parceiro_clinico', 'Terapias especializadas com desconto para usuários Acolher', 2),
  ('Loja Sensorial Kids', 'parceiro_comercial', 'Produtos sensoriais e materiais adaptativos', 3);