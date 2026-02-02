-- Create a trigger function to notify affiliates when they receive commission
CREATE OR REPLACE FUNCTION public.notify_affiliate_commission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Create notification for the affiliate about their commission
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    NEW.affiliate_id,
    'affiliate_commission',
    'Você recebeu uma comissão! 💰',
    'Parabéns! Você ganhou R$ ' || ROUND(NEW.affiliate_commission::numeric, 2) || ' de comissão por uma venda através do seu link de afiliado.',
    jsonb_build_object(
      'sale_id', NEW.sale_id,
      'sale_amount', NEW.sale_amount,
      'commission', NEW.affiliate_commission,
      'affiliate_link_id', NEW.affiliate_link_id
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to call the notification function after affiliate sale is inserted
DROP TRIGGER IF EXISTS trigger_notify_affiliate_commission ON public.affiliate_sales;
CREATE TRIGGER trigger_notify_affiliate_commission
  AFTER INSERT ON public.affiliate_sales
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_affiliate_commission();