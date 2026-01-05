# Disaster Recovery Playbook

## MediFlow Hospital Management System

**Version**: 1.0
**Last Updated**: January 2025
**Classification**: Internal - IT Operations

---

## Table of Contents
1. [Overview](#overview)
2. [Emergency Contacts](#emergency-contacts)
3. [Incident Classification](#incident-classification)
4. [Recovery Procedures](#recovery-procedures)
5. [Backup Information](#backup-information)
6. [Post-Incident Procedures](#post-incident-procedures)

---

## Overview

This playbook provides step-by-step procedures for recovering the MediFlow Hospital Management System in case of various disaster scenarios. All IT staff should be familiar with these procedures.

### Recovery Time Objectives (RTO)
| Priority | System Component | RTO |
|----------|-----------------|-----|
| Critical | Authentication & User Access | 1 hour |
| Critical | Patient Database | 2 hours |
| High | Appointment System | 4 hours |
| High | Prescription System | 4 hours |
| Medium | Reporting System | 8 hours |
| Low | Analytics & Dashboards | 24 hours |

### Recovery Point Objectives (RPO)
| Data Type | RPO | Backup Frequency |
|-----------|-----|------------------|
| Patient Records | 1 hour | Continuous (Point-in-Time) |
| Transactions | 5 minutes | Real-time replication |
| Configuration | 24 hours | Daily |
| Audit Logs | 0 (no data loss) | Real-time |

---

## Emergency Contacts

### Internal Contacts
| Role | Name | Phone | Email |
|------|------|-------|-------|
| IT Director | [Name] | [Phone] | [Email] |
| Database Admin | [Name] | [Phone] | [Email] |
| Security Officer | [Name] | [Phone] | [Email] |
| On-Call Engineer | Rotation | [Phone] | [Email] |

### External Contacts
| Service | Support Channel | Account ID |
|---------|----------------|------------|
| Supabase Support | support@supabase.io | [Project ID] |
| Resend (Email) | support@resend.com | [Account ID] |
| DNS Provider | [Support URL] | [Account ID] |

---

## Incident Classification

### Level 1: Critical (System Down)
- Complete system outage
- Database corruption
- Security breach with data exposure
- **Response Time**: Immediate
- **Escalation**: IT Director + Security Officer

### Level 2: High (Major Degradation)
- Authentication failures
- Partial database unavailability
- Performance degradation >50%
- **Response Time**: 15 minutes
- **Escalation**: On-Call Engineer

### Level 3: Medium (Limited Impact)
- Single module failure
- Slow response times
- Non-critical feature outage
- **Response Time**: 1 hour
- **Escalation**: On-Call Engineer

### Level 4: Low (Minimal Impact)
- Cosmetic issues
- Documentation gaps
- Minor feature bugs
- **Response Time**: Next business day

---

## Recovery Procedures

### Scenario 1: Database Connection Failure

**Symptoms**: Application shows "Unable to connect to database" errors

**Immediate Steps**:
1. Check Supabase status: https://status.supabase.com
2. Verify database is not paused (free tier auto-pause)
3. Check network connectivity to Supabase endpoints

**Resolution Steps**:
```bash
# Check database status via Supabase CLI
supabase db status

# If paused, resume via dashboard
# Dashboard > Settings > General > Resume Project

# Verify connection
curl -I https://fdllddffiihycbtgawbr.supabase.co/rest/v1/
```

**Verification**: 
- Login to application
- Confirm data loads correctly

---

### Scenario 2: Data Corruption/Loss

**Symptoms**: Missing or incorrect data, integrity constraint violations

**Immediate Steps**:
1. Identify scope of corruption (which tables affected)
2. Stop any ongoing write operations if possible
3. Document the state before recovery

**Resolution Steps**:
1. Access Supabase Dashboard
2. Navigate to Settings > Database > Backups
3. Select appropriate backup point (before corruption)
4. Initiate Point-in-Time Recovery (PITR)

**For Pro/Enterprise Plans**:
```sql
-- View available recovery points
-- Contact Supabase support with desired recovery timestamp

-- After restoration, verify data integrity
SELECT COUNT(*) FROM patients WHERE deleted_at IS NULL;
SELECT COUNT(*) FROM appointments WHERE deleted_at IS NULL;
SELECT COUNT(*) FROM medical_records WHERE deleted_at IS NULL;
```

**Post-Recovery**:
1. Verify all tables have correct data
2. Check audit logs for gap period
3. Notify affected users if appointments were lost
4. Document incident in post-mortem

---

### Scenario 3: Security Breach

**Symptoms**: Unauthorized access detected, suspicious activity in audit logs

**Immediate Steps (First 15 Minutes)**:
1. **PRESERVE EVIDENCE** - Take screenshots of audit logs
2. Rotate all API keys immediately:
   - Supabase Dashboard > Settings > API > Regenerate keys
3. Force logout all users:
   ```sql
   -- Clear all sessions (run in SQL Editor)
   DELETE FROM auth.sessions;
   ```

**Investigation Steps**:
1. Review PHI audit log for unauthorized access:
   ```sql
   SELECT * FROM phi_audit_log 
   WHERE created_at > NOW() - INTERVAL '24 hours'
   ORDER BY created_at DESC;
   ```

2. Check authentication logs:
   ```sql
   -- Via Analytics Query
   SELECT * FROM auth_logs 
   ORDER BY timestamp DESC 
   LIMIT 100;
   ```

3. Identify affected patients:
   ```sql
   SELECT DISTINCT patient_id, p.first_name, p.last_name
   FROM phi_audit_log pal
   JOIN patients p ON pal.patient_id = p.id
   WHERE pal.performed_by = '[SUSPICIOUS_USER_ID]';
   ```

**Containment**:
1. Disable compromised user accounts
2. Reset passwords for affected accounts
3. Review and update RLS policies if needed

**HIPAA Requirements**:
- Document breach discovery date and time
- Identify all affected individuals
- Notify HHS if >500 records affected
- Notify affected patients within 60 days

---

### Scenario 4: Edge Function Failures

**Symptoms**: Emails not sending, scheduled tasks not running

**Diagnostic Steps**:
1. Check Edge Function logs:
   - Supabase Dashboard > Edge Functions > [Function Name] > Logs

2. Verify secrets are configured:
   - Dashboard > Settings > Edge Functions > Secrets
   - Ensure RESEND_API_KEY is set

**Resolution**:
```bash
# Redeploy edge functions
supabase functions deploy send-contact-email
supabase functions deploy send-appointment-reminders
supabase functions deploy send-lab-results-notification
```

**Verification**:
- Test contact form submission
- Check email delivery in Resend dashboard

---

### Scenario 5: Complete System Failure

**Symptoms**: All services down, website unreachable

**Immediate Assessment**:
1. Check Supabase status page
2. Check domain DNS resolution
3. Check CDN/hosting status

**Recovery Order**:
1. Database/Backend (Supabase) - Wait for or contact support
2. Frontend (Verify deployment)
3. Edge Functions (Redeploy if needed)
4. Verify integrations (Email, etc.)

**Communication**:
1. Post status on hospital website (static page)
2. Notify staff via alternative channels
3. Activate paper-based backup procedures

---

## Backup Information

### Automated Backups (Supabase)
- **Frequency**: Daily
- **Retention**: 7 days (Free), 30 days (Pro)
- **Type**: Full database snapshot
- **Location**: Supabase infrastructure

### Point-in-Time Recovery (Pro Plans)
- **Granularity**: 1-second precision
- **Window**: Within backup retention period
- **Initiation**: Supabase Dashboard or Support

### Manual Backup Procedure
For additional safety, run monthly manual exports:

```sql
-- Export patients (run in SQL Editor, copy results)
SELECT * FROM patients WHERE deleted_at IS NULL;

-- Export medical records
SELECT * FROM medical_records WHERE deleted_at IS NULL;

-- Export appointments
SELECT * FROM appointments WHERE deleted_at IS NULL;

-- Export prescriptions  
SELECT * FROM prescriptions WHERE deleted_at IS NULL;
```

### Storage Backup
Lab reports bucket contents can be backed up via:
- Supabase Dashboard > Storage > lab-reports
- Download files manually or via API script

---

## Post-Incident Procedures

### Incident Report Template
Complete within 24 hours of resolution:

```
INCIDENT REPORT
===============
Date/Time Detected: 
Date/Time Resolved:
Duration:
Severity Level:
Affected Systems:
Affected Users (estimate):
Root Cause:
Resolution Steps:
Data Loss (if any):
Preventive Measures:
Reported By:
Approved By:
```

### Post-Mortem Meeting
Schedule within 48 hours:
1. Timeline reconstruction
2. Root cause analysis
3. What went well
4. What could be improved
5. Action items with owners and deadlines

### HIPAA Breach Notification Timeline
- Day 1-3: Complete investigation
- Day 3-7: Prepare breach notification letters
- Day 7-14: Submit to HHS (if >500 affected)
- Day 30-60: Notify affected individuals
- Day 60: Submit to media (if >500 in single state)

---

## Appendix: Quick Reference Commands

### Supabase CLI
```bash
# Login
supabase login

# Link project
supabase link --project-ref fdllddffiihycbtgawbr

# Check status
supabase status

# Deploy functions
supabase functions deploy [function-name]

# View logs
supabase functions logs [function-name]
```

### Emergency SQL Queries
```sql
-- Count active patients
SELECT COUNT(*) FROM patients WHERE status = 'active';

-- Check recent audit activity
SELECT COUNT(*) as access_count, performer_name, action
FROM phi_audit_log
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY performer_name, action;

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

---

**Document Control**
- Review annually or after major incidents
- Distribute to all IT staff
- Store securely (access controlled)
- Test procedures quarterly
