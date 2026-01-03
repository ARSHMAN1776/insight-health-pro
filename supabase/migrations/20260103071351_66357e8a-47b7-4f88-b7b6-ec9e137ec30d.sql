-- Fix search_path for generate_claim_number function
CREATE OR REPLACE FUNCTION public.generate_claim_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.claim_number IS NULL THEN
        NEW.claim_number := 'CLM-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
    END IF;
    RETURN NEW;
END;
$$;