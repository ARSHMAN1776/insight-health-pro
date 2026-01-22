import React from 'react';
import { FlaskConical, FileCheck, Clock, Bell, Microscope, BarChart3 } from 'lucide-react';
import FeaturePageLayout from '@/components/features/FeaturePageLayout';
import labImg from '@/assets/features/lab-diagnostics.jpg';

const LabDiagnostics = () => {
  const features = [
    { icon: FlaskConical, title: 'Test Management', description: 'Complete lab test catalog with customizable panels and pricing management.' },
    { icon: FileCheck, title: 'Result Entry', description: 'Structured result entry with normal range validation and abnormal flagging.' },
    { icon: Clock, title: 'TAT Tracking', description: 'Monitor turnaround times and identify bottlenecks in your lab workflow.' },
    { icon: Bell, title: 'Auto Notifications', description: 'Instant alerts to doctors and patients when results are ready.' },
    { icon: Microscope, title: 'Equipment Integration', description: 'Direct integration with lab analyzers for automatic result capture.' },
    { icon: BarChart3, title: 'Analytics Dashboard', description: 'Track test volumes, revenue, and performance metrics in real-time.' },
  ];

  const stats = [
    { value: '30%', label: 'Faster Results' },
    { value: '99.5%', label: 'Accuracy Rate' },
    { value: '500+', label: 'Tests Supported' },
    { value: '2 hrs', label: 'Avg TAT' },
  ];

  const benefits = [
    { text: 'Barcode sample tracking' },
    { text: 'Auto result validation' },
    { text: 'Critical value alerts' },
    { text: 'Quality control logs' },
    { text: 'Report templates' },
    { text: 'Patient portal access' },
  ];

  const testimonial = {
    quote: "The lab integration has eliminated manual data entry errors completely. Our turnaround time improved by 40%, and patient satisfaction scores are at an all-time high.",
    author: "Dr. Priya Sharma",
    role: "Lab Director",
    hospital: "Apollo Diagnostics"
  };

  return (
    <FeaturePageLayout
      badge="Clinical Feature"
      badgeIcon={FlaskConical}
      title="Lab & Diagnostics"
      subtitle="End-to-end laboratory management"
      description="Complete laboratory information system for test ordering, sample tracking, result entry, and reporting. Integrate with lab equipment and deliver results faster."
      heroImage={labImg}
      features={features}
      stats={stats}
      benefits={benefits}
      testimonial={testimonial}
      ctaTitle="Modernize Your Lab Operations"
      ctaDescription="Reduce errors, speed up results, and improve patient care with our comprehensive lab management system. Start your free trial today."
    />
  );
};

export default LabDiagnostics;
