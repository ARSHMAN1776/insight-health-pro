-- Create Operation Theatres table
CREATE TABLE public.operation_theatres (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ot_name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'available',
    floor INTEGER,
    equipment TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT valid_ot_status CHECK (status IN ('available', 'in_use', 'maintenance'))
);

-- Create Surgeries table
CREATE TABLE public.surgeries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    ot_id UUID NOT NULL REFERENCES public.operation_theatres(id) ON DELETE CASCADE,
    surgery_type VARCHAR(200) NOT NULL,
    surgery_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    priority VARCHAR(20) DEFAULT 'normal',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT valid_surgery_status CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    CONSTRAINT valid_surgery_priority CHECK (priority IN ('normal', 'urgent', 'emergency'))
);

-- Create Surgery Team table
CREATE TABLE public.surgery_team (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    surgery_id UUID NOT NULL REFERENCES public.surgeries(id) ON DELETE CASCADE,
    staff_name VARCHAR(200) NOT NULL,
    role VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT valid_team_role CHECK (role IN ('surgeon', 'nurse', 'anesthetist', 'assistant'))
);

-- Create Post Operation table
CREATE TABLE public.post_operation (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    surgery_id UUID NOT NULL REFERENCES public.surgeries(id) ON DELETE CASCADE,
    recovery_notes TEXT,
    complications TEXT,
    discharge_status VARCHAR(50) NOT NULL DEFAULT 'stable',
    vital_signs JSONB,
    medication_notes TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT valid_discharge_status CHECK (discharge_status IN ('stable', 'critical', 'discharged', 'monitoring'))
);

-- Enable RLS on all tables
ALTER TABLE public.operation_theatres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgeries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgery_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_operation ENABLE ROW LEVEL SECURITY;

-- RLS Policies for operation_theatres
CREATE POLICY "Public select operation_theatres" ON public.operation_theatres
FOR SELECT USING (true);

CREATE POLICY "Public insert operation_theatres" ON public.operation_theatres
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update operation_theatres" ON public.operation_theatres
FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public delete operation_theatres" ON public.operation_theatres
FOR DELETE USING (true);

-- RLS Policies for surgeries
CREATE POLICY "Public select surgeries" ON public.surgeries
FOR SELECT USING (true);

CREATE POLICY "Public insert surgeries" ON public.surgeries
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update surgeries" ON public.surgeries
FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public delete surgeries" ON public.surgeries
FOR DELETE USING (true);

-- RLS Policies for surgery_team
CREATE POLICY "Public select surgery_team" ON public.surgery_team
FOR SELECT USING (true);

CREATE POLICY "Public insert surgery_team" ON public.surgery_team
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update surgery_team" ON public.surgery_team
FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public delete surgery_team" ON public.surgery_team
FOR DELETE USING (true);

-- RLS Policies for post_operation
CREATE POLICY "Public select post_operation" ON public.post_operation
FOR SELECT USING (true);

CREATE POLICY "Public insert post_operation" ON public.post_operation
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update post_operation" ON public.post_operation
FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Public delete post_operation" ON public.post_operation
FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_surgeries_patient ON public.surgeries(patient_id);
CREATE INDEX idx_surgeries_doctor ON public.surgeries(doctor_id);
CREATE INDEX idx_surgeries_ot ON public.surgeries(ot_id);
CREATE INDEX idx_surgeries_date ON public.surgeries(surgery_date);
CREATE INDEX idx_surgeries_status ON public.surgeries(status);
CREATE INDEX idx_surgery_team_surgery ON public.surgery_team(surgery_id);
CREATE INDEX idx_post_operation_surgery ON public.post_operation(surgery_id);

-- Create triggers for updated_at
CREATE TRIGGER update_operation_theatres_updated_at
    BEFORE UPDATE ON public.operation_theatres
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_surgeries_updated_at
    BEFORE UPDATE ON public.surgeries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_post_operation_updated_at
    BEFORE UPDATE ON public.post_operation
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();