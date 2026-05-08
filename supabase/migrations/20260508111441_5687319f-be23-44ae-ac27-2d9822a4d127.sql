
-- Allow NULL on nurse columns so orphans can be cleared
ALTER TABLE public.shift_handovers ALTER COLUMN incoming_nurse_id DROP NOT NULL;
ALTER TABLE public.shift_handovers ALTER COLUMN outgoing_nurse_id DROP NOT NULL;

-- 1) Cleanup orphans
UPDATE public.shift_handovers SET incoming_nurse_id = NULL
 WHERE incoming_nurse_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.nurses n WHERE n.id = shift_handovers.incoming_nurse_id);
UPDATE public.shift_handovers SET outgoing_nurse_id = NULL
 WHERE outgoing_nurse_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.nurses n WHERE n.id = shift_handovers.outgoing_nurse_id);

-- 2) Foreign keys
ALTER TABLE public.phi_audit_log ADD CONSTRAINT phi_audit_log_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE SET NULL;
ALTER TABLE public.ipd_admissions ADD CONSTRAINT ipd_admissions_attending_nurse_id_fkey FOREIGN KEY (attending_nurse_id) REFERENCES public.nurses(id) ON DELETE SET NULL;
ALTER TABLE public.shift_handovers ADD CONSTRAINT shift_handovers_incoming_nurse_id_fkey FOREIGN KEY (incoming_nurse_id) REFERENCES public.nurses(id) ON DELETE SET NULL;
ALTER TABLE public.shift_handovers ADD CONSTRAINT shift_handovers_outgoing_nurse_id_fkey FOREIGN KEY (outgoing_nurse_id) REFERENCES public.nurses(id) ON DELETE SET NULL;
ALTER TABLE public.ward_rounds ADD CONSTRAINT ward_rounds_nurse_id_fkey FOREIGN KEY (nurse_id) REFERENCES public.nurses(id) ON DELETE SET NULL;

-- 3) Indexes on FK columns missing one
CREATE INDEX IF NOT EXISTS idx_api_keys_created_by ON public.api_keys(created_by);
CREATE INDEX IF NOT EXISTS idx_appointment_waitlist_department_id ON public.appointment_waitlist(department_id);
CREATE INDEX IF NOT EXISTS idx_daily_queues_department_id ON public.daily_queues(department_id);
CREATE INDEX IF NOT EXISTS idx_hospital_settings_updated_by ON public.hospital_settings(updated_by);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_appointment_id ON public.insurance_claims(appointment_id);
CREATE INDEX IF NOT EXISTS idx_inventory_supplier_id ON public.inventory(supplier_id);
CREATE INDEX IF NOT EXISTS idx_ipd_admissions_department_id ON public.ipd_admissions(department_id);
CREATE INDEX IF NOT EXISTS idx_ipd_admissions_room_assignment_id ON public.ipd_admissions(room_assignment_id);
CREATE INDEX IF NOT EXISTS idx_ipd_admissions_attending_nurse_id ON public.ipd_admissions(attending_nurse_id);
CREATE INDEX IF NOT EXISTS idx_lab_tests_doctor_id ON public.lab_tests(doctor_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_invited_by ON public.organization_members(invited_by);
CREATE INDEX IF NOT EXISTS idx_organization_subscriptions_plan_id ON public.organization_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON public.organizations(created_by);
CREATE INDEX IF NOT EXISTS idx_patient_registration_queue_patient_id ON public.patient_registration_queue(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_registration_queue_reviewed_by ON public.patient_registration_queue(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_pharmacy_bills_prescription_id ON public.pharmacy_bills(prescription_id);
CREATE INDEX IF NOT EXISTS idx_phi_audit_log_patient_id ON public.phi_audit_log(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescription_templates_doctor_id ON public.prescription_templates(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON public.prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_inventory_item_id ON public.purchase_order_items(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_approved_by ON public.purchase_orders(approved_by);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_created_by ON public.purchase_orders(created_by);
CREATE INDEX IF NOT EXISTS idx_queue_entries_appointment_id ON public.queue_entries(appointment_id);
CREATE INDEX IF NOT EXISTS idx_referrals_appointment_id ON public.referrals(appointment_id);
CREATE INDEX IF NOT EXISTS idx_referrals_receiving_department_id ON public.referrals(receiving_department_id);
CREATE INDEX IF NOT EXISTS idx_scheduling_recommendations_doctor_id ON public.scheduling_recommendations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_shift_handover_patients_patient_id ON public.shift_handover_patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_shift_handovers_incoming_nurse_id ON public.shift_handovers(incoming_nurse_id);
CREATE INDEX IF NOT EXISTS idx_shift_handovers_outgoing_nurse_id ON public.shift_handovers(outgoing_nurse_id);
CREATE INDEX IF NOT EXISTS idx_ward_rounds_doctor_id ON public.ward_rounds(doctor_id);
CREATE INDEX IF NOT EXISTS idx_ward_rounds_nurse_id ON public.ward_rounds(nurse_id);
