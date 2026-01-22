import React from 'react';
import { Bed, Users, Calendar, AlertTriangle, LayoutGrid, Activity } from 'lucide-react';
import FeaturePageLayout from '@/components/features/FeaturePageLayout';
import bedImg from '@/assets/features/bed-management.jpg';

const BedManagement = () => {
  const features = [
    { icon: Bed, title: 'Real-time Availability', description: 'Live dashboard showing bed status across all wards and departments.' },
    { icon: Users, title: 'Patient Assignment', description: 'Quick patient-to-bed assignment with transfer and discharge workflows.' },
    { icon: Calendar, title: 'Admission Planning', description: 'Schedule admissions in advance and optimize bed utilization.' },
    { icon: AlertTriangle, title: 'Housekeeping Alerts', description: 'Automatic notifications to cleaning staff when beds are vacated.' },
    { icon: LayoutGrid, title: 'Ward Management', description: 'Configure wards, rooms, and bed types with custom attributes.' },
    { icon: Activity, title: 'Occupancy Analytics', description: 'Track occupancy rates, average length of stay, and turnover metrics.' },
  ];

  const stats = [
    { value: '25%', label: 'Higher Occupancy' },
    { value: '2 hrs', label: 'Faster Turnover' },
    { value: '500+', label: 'Beds Managed' },
    { value: 'Real-time', label: 'Status Updates' },
  ];

  const benefits = [
    { text: 'Visual floor plans' },
    { text: 'Bed type categorization' },
    { text: 'Equipment tracking' },
    { text: 'Housekeeping workflow' },
    { text: 'Transfer management' },
    { text: 'Discharge planning' },
  ];

  const testimonial = {
    quote: "We increased our bed utilization from 65% to 89% within three months. The real-time visibility and automated housekeeping alerts made all the difference.",
    author: "Jennifer Walsh",
    role: "Operations Manager",
    hospital: "St. Mary's Hospital"
  };

  return (
    <FeaturePageLayout
      badge="Operations Feature"
      badgeIcon={Bed}
      title="Bed Management"
      subtitle="Maximize bed utilization"
      description="Real-time bed availability tracking, patient assignment, and housekeeping coordination. Optimize occupancy rates and reduce patient wait times for admission."
      heroImage={bedImg}
      features={features}
      stats={stats}
      benefits={benefits}
      testimonial={testimonial}
      ctaTitle="Optimize Your Bed Capacity"
      ctaDescription="Increase occupancy, reduce wait times, and streamline patient flow with intelligent bed management. Start your free trial today."
    />
  );
};

export default BedManagement;
