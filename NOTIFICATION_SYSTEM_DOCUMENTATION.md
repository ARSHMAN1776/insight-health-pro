# Hospital Management System - Notification & Reminder System Documentation

## Overview

A comprehensive, real-time notification and reminder system implemented across all user portals (Doctor, Patient, Nurse, Receptionist, Pharmacist, Administrator).

## ✅ Implementation Status

### Database Schema ✓
- **notifications** table: Stores all in-app notifications with type, priority, read status
- **reminders** table: Manages scheduled reminders with recurring options
- **RLS Policies**: Secure row-level security for user data isolation
- **Real-time subscriptions**: Enabled for instant notification delivery
- **Indexes**: Optimized for query performance

### Frontend Components ✓
- **NotificationCenter**: Full-featured notification panel with tabs
- **useNotifications Hook**: Centralized notification management
- **Real-time Updates**: Automatic UI updates via Supabase subscriptions
- **Toast Integration**: Instant alerts for high-priority notifications

### Features Implemented ✓

#### 1. **In-App Notifications**
- ✓ Real-time notification delivery
- ✓ Unread count badge in header
- ✓ Mark as read/unread
- ✓ Delete notifications
- ✓ Mark all as read
- ✓ Priority-based styling (low, normal, high, urgent)
- ✓ Type-based categorization (appointment, medication, lab_result, system, critical, general)
- ✓ Action URLs for clickable notifications
- ✓ Metadata support for custom data

#### 2. **Reminders System**
- ✓ Create reminders for appointments, medications, lab tests, follow-ups
- ✓ Scheduled reminder delivery
- ✓ Recurring reminders support
- ✓ Link reminders to related records
- ✓ Dismiss reminders
- ✓ Status tracking (pending, sent, dismissed, expired)

#### 3. **Real-time Features**
- ✓ Instant notification delivery via Supabase real-time
- ✓ Automatic unread count updates
- ✓ Toast notifications for urgent alerts
- ✓ Live UI updates without page refresh

#### 4. **User-Specific Configuration**
- ✓ Notification preferences in Settings
- ✓ Email alert toggle
- ✓ SMS alert toggle
- ✓ Push notification toggle
- ✓ Category-specific preferences
- ✓ Role-based notification settings

## Architecture

### Database Structure

#### notifications Table
```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL
title TEXT NOT NULL
message TEXT NOT NULL
type TEXT (appointment|medication|lab_result|system|critical|general|payment|reminder|alert)
priority TEXT (low|normal|high|urgent)
read BOOLEAN DEFAULT false
action_url TEXT
metadata JSONB
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE
expires_at TIMESTAMP WITH TIME ZONE
sent_via_email BOOLEAN
sent_via_sms BOOLEAN
sent_via_push BOOLEAN
```

#### reminders Table
```sql
id UUID PRIMARY KEY
user_id UUID NOT NULL
title TEXT NOT NULL
description TEXT
reminder_type TEXT (appointment|medication|lab_test|follow_up|payment|general)
reminder_time TIMESTAMP WITH TIME ZONE
recurring BOOLEAN
recurring_pattern TEXT
status TEXT (pending|sent|completed|cancelled)
related_id UUID
related_table TEXT
created_at TIMESTAMP WITH TIME ZONE
updated_at TIMESTAMP WITH TIME ZONE
```

### Security

- **Row Level Security (RLS)**: All tables protected with user-specific policies
- **Admin Override**: Administrators can manage all notifications
- **Secure Functions**: Use SECURITY DEFINER for privilege escalation
- **Real-time Authentication**: Channel subscriptions filtered by user_id

## Usage Guide

### For Users

#### Accessing Notifications
1. Click the bell icon (🔔) in the header
2. View unread count badge
3. Switch between "Notifications" and "Reminders" tabs

#### Managing Notifications
- **Mark as read**: Click checkmark icon
- **Delete**: Click trash icon
- **Mark all read**: Click "Mark all read" button
- **View action**: Click notification to navigate to related item

#### Creating Reminders
Use the `createReminder` function:
```typescript
const { createReminder } = useNotifications();

await createReminder({
  title: 'Take Medication',
  description: 'Blood pressure medication - 10mg',
  reminder_type: 'medication',
  reminder_time: new Date('2025-12-26T08:00:00Z').toISOString(),
  recurring: false,
});
```

### For Developers

#### Using the Hook
```typescript
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const {
    notifications,
    reminders,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    createReminder,
    dismissReminder,
    refreshNotifications,
    refreshReminders,
  } = useNotifications();
  
  // Use notifications in your component
}
```

#### Creating Notifications Programmatically
```typescript
await createNotification({
  title: 'Appointment Confirmed',
  message: 'Your appointment with Dr. Smith is confirmed for tomorrow at 2 PM',
  type: 'appointment',
  priority: 'normal',
  action_url: '/appointments',
  metadata: { appointmentId: '123' },
});
```

#### Real-time Subscription
The hook automatically subscribes to real-time updates. No additional setup required!

## Role-Specific Notifications

### Doctor Portal
- **Appointment reminders**: Patient check-in alerts
- **Lab result notifications**: Critical lab results ready
- **Surgery notifications**: Scheduled surgery reminders
- **System alerts**: Schedule changes, emergency calls
- **Medication alerts**: Prescription refill requests

### Patient Portal
- **Appointment reminders**: Upcoming appointments (24h before)
- **Medication reminders**: Time to take medication
- **Lab result notifications**: Results available for viewing
- **Follow-up reminders**: Post-treatment check-ups
- **Payment reminders**: Outstanding balance alerts

### Nurse Portal
- **Patient alerts**: Vital sign abnormalities
- **Medication reminders**: Med distribution schedule
- **Blood bank alerts**: Critical stock, transfusion needed
- **Surgery notifications**: Pre-op and post-op alerts
- **Shift notifications**: Shift changes, handoff notes
- **Critical alerts**: Emergency situations

### Pharmacist Portal
- **Low stock alerts**: Inventory running low
- **Expiry notifications**: Items nearing expiration
- **Prescription notifications**: New prescriptions to fill
- **Verification alerts**: Prescription verification required
- **Reorder reminders**: Stock reorder notifications

### Receptionist Portal
- **Appointment notifications**: New bookings, cancellations
- **Patient arrival alerts**: Check-in notifications
- **Payment reminders**: Outstanding balance alerts
- **Surgery scheduling**: Operation theatre availability
- **Scheduling conflicts**: Double-booking warnings

### Administrator Portal
- **System notifications**: System maintenance, updates
- **Staff alerts**: Staff scheduling, new registrations
- **Blood bank alerts**: Critical stock levels
- **Security alerts**: Unauthorized access attempts
- **Report notifications**: Daily/weekly reports ready
- **Department updates**: Department status changes

## Integration with System Modules

### Appointment System
- Automatic notifications when:
  - Appointment created/confirmed
  - 24 hours before appointment
  - Appointment canceled or rescheduled
  - Doctor running late

### Medication System
- Reminders for:
  - Medication administration times
  - Prescription refills
  - Drug interaction warnings
  - Dosage changes

### Lab System
- Notifications for:
  - Lab results ready
  - Critical results (urgent priority)
  - Missing lab orders
  - Pending specimen collection

### Blood Bank System
- Alerts for:
  - Critical stock levels (< 5 units)
  - Blood issue completed
  - Donor eligibility changes
  - Transfusion records

### Operation Department
- Notifications for:
  - Surgery scheduled
  - Pre-operative reminders
  - Post-operative care updates
  - Theatre availability changes
  - Surgery team assignments

## Performance Considerations

- **Pagination**: Notifications limited to 50 most recent
- **Indexes**: Optimized queries on user_id, read status, created_at
- **Real-time**: Efficient channel subscriptions with user filtering
- **Caching**: Local state management reduces database calls

## Future Enhancements

### Planned Features
- [ ] Email integration (SMTP/SendGrid)
- [ ] SMS integration (Twilio)
- [ ] Push notifications (Web Push API)
- [ ] Notification templates
- [ ] Bulk notification sending
- [ ] Notification analytics
- [ ] User notification history export
- [ ] Notification scheduling
- [ ] Rich notifications with images/attachments

### Recommended Improvements
- [ ] Add notification preferences UI per category
- [ ] Implement "Do Not Disturb" mode
- [ ] Add notification sounds
- [ ] Create notification digest emails
- [ ] Add notification search/filter
- [ ] Implement notification grouping

## Troubleshooting

### Notifications Not Appearing
1. Check user is authenticated
2. Verify RLS policies allow access
3. Check browser console for errors
4. Verify real-time subscription is active

### Real-time Not Working
1. Check Supabase real-time is enabled
2. Verify table is added to publication
3. Check network tab for WebSocket connection
4. Ensure REPLICA IDENTITY is set to FULL

### Performance Issues
1. Check notification count (consider archiving old ones)
2. Verify indexes are created
3. Monitor database query performance
4. Check for unnecessary re-renders

## API Reference

### useNotifications Hook

```typescript
interface UseNotificationsReturn {
  notifications: Notification[];          // Array of user notifications
  reminders: Reminder[];                  // Array of user reminders
  loading: boolean;                       // Loading state
  unreadCount: number;                    // Count of unread notifications
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  createNotification: (notification: Partial<Notification>) => Promise<Notification>;
  createReminder: (reminder: Partial<Reminder>) => Promise<Reminder>;
  dismissReminder: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshReminders: () => Promise<void>;
}
```

## Support

For issues or questions:
1. Check console logs for errors
2. Review Supabase logs in dashboard
3. Check RLS policies are correct
4. Verify user permissions

## Changelog

### Version 2.0.0 (December 2025)
- ✓ Added Blood Bank notification integration
- ✓ Added Operation Department notifications
- ✓ Added Staff Management notifications
- ✓ Enhanced role-based notification categories
- ✓ Improved notification UI/UX
- ✓ Added Surgery team notifications
- ✓ Department update notifications

### Version 1.0.0 (November 2025)
- ✓ Initial notification system implementation
- ✓ Database schema with RLS
- ✓ Real-time subscriptions
- ✓ NotificationCenter component
- ✓ useNotifications hook
- ✓ Integration with Header
- ✓ Settings integration
- ✓ Role-based testing documentation
