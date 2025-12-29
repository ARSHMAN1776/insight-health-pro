-- Add lab_technician to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'lab_technician';