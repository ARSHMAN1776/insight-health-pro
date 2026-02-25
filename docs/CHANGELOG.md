# Changelog

All notable changes to Insight Health Pro will be documented in this file.

## [4.0.0] - 2026-02-25

### Added
- 20+ integrated healthcare management modules
- 6 role-based dashboards (Admin, Doctor, Nurse, Pharmacist, Receptionist, Lab Technician)
- AI Clinical Copilot with diagnosis suggestions
- Real-time queue management with token system
- Blood bank with inventory, donors, and transfusion tracking
- Operation theatre scheduling with consent forms
- IPD management with ward rounds and discharge summaries
- Insurance claims with ICD-10 and CPT coding
- Doctor-patient secure messaging
- Prescription refill request workflow
- Drug interaction checker
- Lab report generation with QR verification
- Patient portal with self-service features
- Smart scheduling with AI optimization
- Multi-language support (English, Spanish, French, Arabic, Hindi, Urdu)
- Dark/Light theme toggle
- PWA support for mobile installation
- HIPAA-compliant audit logging
- Comprehensive documentation suite
- Demo data seeder for instant testing

### Security
- Row Level Security (RLS) on all database tables
- Relationship-based access control for clinical data
- JWT authentication for all edge functions
- No hardcoded credentials — environment variable configuration
- XSS protection with sanitized rendering
- PHI audit trail logging
