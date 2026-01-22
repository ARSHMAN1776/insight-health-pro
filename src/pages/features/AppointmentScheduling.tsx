import React from 'react';
import { Calendar, Clock, Users, Bell, Repeat, Smartphone } from 'lucide-react';
import FeaturePageLayout from '@/components/features/FeaturePageLayout';
import appointmentImg from '@/assets/features/appointment-scheduling.jpg';

const AppointmentScheduling = () => {
  const features = [
    { icon: Calendar, title: 'Smart Scheduling', description: 'Intelligent slot management with automatic conflict detection and optimal time suggestions.' },
    { icon: Clock, title: 'Queue Management', description: 'Real-time queue tracking with accurate wait time estimates and token-based systems.' },
    { icon: Users, title: 'Multi-Doctor Support', description: 'Manage schedules across departments, specialties, and multiple locations seamlessly.' },
    { icon: Bell, title: 'Auto Reminders', description: 'Automated SMS, email, and WhatsApp appointment reminders to reduce no-shows by 60%.' },
    { icon: Repeat, title: 'Recurring Appointments', description: 'Set up follow-ups, regular check-ups, and treatment schedules with ease.' },
    { icon: Smartphone, title: 'Patient Self-Booking', description: 'Online appointment booking portal with real-time availability and instant confirmation.' },
  ];

  const stats = [
    { value: '60%', label: 'Fewer No-Shows' },
    { value: '45%', label: 'Time Saved' },
    { value: '10K+', label: 'Daily Bookings' },
    { value: '4.9★', label: 'Patient Rating' },
  ];

  const benefits = [
    { text: 'Online self-booking' },
    { text: 'Real-time availability' },
    { text: 'SMS/Email reminders' },
    { text: 'Waitlist management' },
    { text: 'Multi-location support' },
    { text: 'Calendar sync' },
  ];

  const testimonial = {
    quote: "Our no-show rate dropped from 25% to under 10% within the first month. The automated reminders and easy rescheduling options have been game-changers for our practice.",
    author: "Dr. James Chen",
    role: "Practice Manager",
    hospital: "City Medical Center"
  };

  return (
    <FeaturePageLayout
      badge="Core Feature"
      badgeIcon={Calendar}
      title="Appointment Scheduling"
      subtitle="Smart scheduling with zero conflicts"
      description="Intelligent appointment scheduling with integrated queue management. Reduce wait times, optimize doctor schedules, and improve patient satisfaction with our AI-powered booking system."
      heroImage={appointmentImg}
      features={features}
      stats={stats}
      benefits={benefits}
      testimonial={testimonial}
      ctaTitle="Ready to Optimize Scheduling?"
      ctaDescription="Reduce no-shows, maximize appointment efficiency, and delight your patients with seamless scheduling. Start your free trial today."
    />
  );
};

export default AppointmentScheduling;
