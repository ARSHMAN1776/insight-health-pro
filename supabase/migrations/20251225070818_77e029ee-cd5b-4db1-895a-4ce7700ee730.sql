-- Create blood stock transactions table for audit logging
CREATE TABLE public.blood_stock_transactions (
  transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blood_group_id UUID NOT NULL REFERENCES public.blood_groups(group_id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('addition', 'issue', 'adjustment', 'expired', 'donation')),
  units INTEGER NOT NULL,
  previous_balance INTEGER NOT NULL,
  new_balance INTEGER NOT NULL,
  source VARCHAR(100), -- e.g., 'Donor: John Doe', 'External: Red Cross', 'Patient: Jane Smith'
  reference_id UUID, -- Optional link to donor, patient, or blood_issues
  notes TEXT,
  performed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_stock_transactions_blood_group ON public.blood_stock_transactions(blood_group_id);
CREATE INDEX idx_stock_transactions_created_at ON public.blood_stock_transactions(created_at DESC);
CREATE INDEX idx_stock_transactions_type ON public.blood_stock_transactions(transaction_type);

-- Enable RLS
ALTER TABLE public.blood_stock_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for stock transactions
CREATE POLICY "Authenticated users can view stock transactions"
ON public.blood_stock_transactions FOR SELECT
USING (true);

CREATE POLICY "Staff can insert stock transactions"
ON public.blood_stock_transactions FOR INSERT
WITH CHECK (true);

-- Initialize blood stock for all blood groups if not exists
INSERT INTO public.blood_stock (blood_group_id, total_units)
SELECT group_id, 0
FROM public.blood_groups
WHERE NOT EXISTS (
  SELECT 1 FROM public.blood_stock WHERE blood_stock.blood_group_id = blood_groups.group_id
);

-- Enable realtime for blood_stock table
ALTER PUBLICATION supabase_realtime ADD TABLE public.blood_stock;

-- Set replica identity for realtime updates
ALTER TABLE public.blood_stock REPLICA IDENTITY FULL;