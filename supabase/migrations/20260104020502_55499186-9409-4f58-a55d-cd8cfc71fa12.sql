-- Create suppliers table
CREATE TABLE public.suppliers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    payment_terms VARCHAR(100),
    lead_time_days INTEGER DEFAULT 7,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for suppliers
CREATE POLICY "Staff can view suppliers"
ON public.suppliers FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'pharmacist'));

CREATE POLICY "Admins can manage suppliers"
ON public.suppliers FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Pharmacists can insert suppliers"
ON public.suppliers FOR INSERT
WITH CHECK (has_role(auth.uid(), 'pharmacist'));

CREATE POLICY "Pharmacists can update suppliers"
ON public.suppliers FOR UPDATE
USING (has_role(auth.uid(), 'pharmacist'))
WITH CHECK (has_role(auth.uid(), 'pharmacist'));

-- Trigger for updated_at
CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create purchase_orders table
CREATE TABLE public.purchase_orders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    po_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'approved', 'received', 'cancelled')),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery DATE,
    actual_delivery DATE,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on purchase_orders
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for purchase_orders
CREATE POLICY "Staff can view purchase orders"
ON public.purchase_orders FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'pharmacist'));

CREATE POLICY "Admins can manage purchase orders"
ON public.purchase_orders FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Pharmacists can create purchase orders"
ON public.purchase_orders FOR INSERT
WITH CHECK (has_role(auth.uid(), 'pharmacist'));

CREATE POLICY "Pharmacists can update own purchase orders"
ON public.purchase_orders FOR UPDATE
USING (has_role(auth.uid(), 'pharmacist') AND (status = 'draft' OR created_by = auth.uid()))
WITH CHECK (has_role(auth.uid(), 'pharmacist'));

-- Trigger for updated_at
CREATE TRIGGER update_purchase_orders_updated_at
BEFORE UPDATE ON public.purchase_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create purchase_order_items table
CREATE TABLE public.purchase_order_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES public.inventory(id) ON DELETE SET NULL,
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(12, 2) NOT NULL,
    received_quantity INTEGER DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'received', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on purchase_order_items
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for purchase_order_items
CREATE POLICY "Staff can view purchase order items"
ON public.purchase_order_items FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'pharmacist'));

CREATE POLICY "Admins can manage purchase order items"
ON public.purchase_order_items FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Pharmacists can manage purchase order items"
ON public.purchase_order_items FOR ALL
USING (has_role(auth.uid(), 'pharmacist'))
WITH CHECK (has_role(auth.uid(), 'pharmacist'));

-- Add supplier_id to inventory table
ALTER TABLE public.inventory 
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL;

-- Add reorder_point to inventory table
ALTER TABLE public.inventory 
ADD COLUMN IF NOT EXISTS reorder_point INTEGER DEFAULT 10;

-- Create indexes
CREATE INDEX idx_suppliers_status ON public.suppliers(status);
CREATE INDEX idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX idx_purchase_orders_supplier ON public.purchase_orders(supplier_id);
CREATE INDEX idx_purchase_order_items_po ON public.purchase_order_items(purchase_order_id);

-- Function to generate PO number
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.po_number IS NULL OR NEW.po_number = '' THEN
        NEW.po_number := 'PO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to auto-generate PO number
CREATE TRIGGER trigger_generate_po_number
BEFORE INSERT ON public.purchase_orders
FOR EACH ROW
EXECUTE FUNCTION generate_po_number();