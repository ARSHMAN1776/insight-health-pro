-- Allow receptionists to delete payments
CREATE POLICY "Receptionists can delete payments"
ON public.payments
FOR DELETE
USING (has_role(auth.uid(), 'receptionist'::app_role));