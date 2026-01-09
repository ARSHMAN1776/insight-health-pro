-- Create pharmacy_bills table
CREATE TABLE public.pharmacy_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_number VARCHAR NOT NULL UNIQUE,
  patient_id UUID REFERENCES public.patients(id),
  patient_name VARCHAR,
  prescription_id UUID REFERENCES public.prescriptions(id),
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  tax_percent NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR DEFAULT 'cash',
  payment_status VARCHAR DEFAULT 'paid',
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create pharmacy_bill_items table
CREATE TABLE public.pharmacy_bill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID REFERENCES public.pharmacy_bills(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES public.inventory(id),
  item_name VARCHAR NOT NULL,
  batch_number VARCHAR,
  expiry_date DATE,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pharmacy_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_bill_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pharmacy_bills
CREATE POLICY "Staff can view pharmacy bills"
  ON public.pharmacy_bills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'pharmacist', 'receptionist')
    )
  );

CREATE POLICY "Staff can create pharmacy bills"
  ON public.pharmacy_bills FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'pharmacist')
    )
  );

CREATE POLICY "Staff can update pharmacy bills"
  ON public.pharmacy_bills FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'pharmacist')
    )
  );

-- RLS Policies for pharmacy_bill_items
CREATE POLICY "Staff can view pharmacy bill items"
  ON public.pharmacy_bill_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'pharmacist', 'receptionist')
    )
  );

CREATE POLICY "Staff can create pharmacy bill items"
  ON public.pharmacy_bill_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'pharmacist')
    )
  );

-- Trigger to generate bill number
CREATE OR REPLACE FUNCTION public.generate_bill_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.bill_number IS NULL OR NEW.bill_number = '' THEN
        NEW.bill_number := 'PB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER generate_pharmacy_bill_number
BEFORE INSERT ON public.pharmacy_bills
FOR EACH ROW
EXECUTE FUNCTION public.generate_bill_number();

-- Trigger for updated_at
CREATE TRIGGER update_pharmacy_bills_updated_at
BEFORE UPDATE ON public.pharmacy_bills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_pharmacy_bills_patient_id ON public.pharmacy_bills(patient_id);
CREATE INDEX idx_pharmacy_bills_created_at ON public.pharmacy_bills(created_at);
CREATE INDEX idx_pharmacy_bill_items_bill_id ON public.pharmacy_bill_items(bill_id);
CREATE INDEX idx_pharmacy_bill_items_inventory_id ON public.pharmacy_bill_items(inventory_id);