import React from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Clock, Settings } from 'lucide-react';
import FeaturePageLayout from '@/components/features/FeaturePageLayout';
import notificationsImg from '@/assets/features/notifications.jpg';

const Notifications = () => {
  const features = [
    { icon: Bell, title: 'Multi-Channel Alerts', description: 'Send notifications via SMS, email, WhatsApp, and push notifications.' },
    { icon: Mail, title: 'Email Templates', description: 'Customizable email templates for appointments, results, and reminders.' },
    { icon: MessageSquare, title: 'SMS Integration', description: 'Reliable SMS delivery with carrier-grade infrastructure and delivery reports.' },
    { icon: Smartphone, title: 'Push Notifications', description: 'Instant mobile alerts for critical updates and time-sensitive information.' },
    { icon: Clock, title: 'Scheduled Sending', description: 'Schedule notifications in advance with timezone-aware delivery.' },
    { icon: Settings, title: 'Preference Management', description: 'Let patients choose their preferred notification channels and frequency.' },
  ];

  const stats = [
    { value: '98%', label: 'Delivery Rate' },
    { value: '60%', label: 'Less No-Shows' },
    { value: '1M+', label: 'Messages Sent' },
    { value: '<5 sec', label: 'Delivery Time' },
  ];

  const benefits = [
    { text: 'Appointment reminders' },
    { text: 'Lab result alerts' },
    { text: 'Payment notifications' },
    { text: 'Follow-up reminders' },
    { text: 'Prescription refills' },
    { text: 'Custom templates' },
  ];

  const testimonial = {
    quote: "The automated notification system reduced our appointment no-shows by 60%. Patients love getting timely reminders, and our staff no longer spends hours making reminder calls.",
    author: "Lisa Anderson",
    role: "Patient Experience Manager",
    hospital: "Sunrise Medical Center"
  };

  return (
    <FeaturePageLayout
      badge="Communication Feature"
      badgeIcon={Bell}
      title="Notifications"
      subtitle="Keep everyone informed"
      description="Automated multi-channel notification system for appointment reminders, lab results, and important updates. Reduce no-shows and improve patient engagement."
      heroImage={notificationsImg}
      features={features}
      stats={stats}
      benefits={benefits}
      testimonial={testimonial}
      ctaTitle="Automate Patient Communication"
      ctaDescription="Reduce no-shows, improve engagement, and save staff time with intelligent automated notifications. Start your free trial today."
    />
  );
};

export default Notifications;
