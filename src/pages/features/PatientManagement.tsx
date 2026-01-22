import React from 'react';
import { Users, UserPlus, FileText, Shield, Search, Bell } from 'lucide-react';
import FeaturePageLayout from '@/components/features/FeaturePageLayout';
import patientManagementImg from '@/assets/features/patient-management.jpg';

const PatientManagement = () => {
  const features = [
    { icon: UserPlus, title: 'Easy Registration', description: 'Quick patient onboarding with comprehensive data capture and digital forms that reduce wait times by 70%.' },
    { icon: FileText, title: 'Complete Records', description: 'Maintain detailed medical history, visit records, and treatment plans all in one centralized location.' },
    { icon: Shield, title: 'Data Security', description: 'HIPAA-compliant storage with role-based access control, encryption, and complete audit trails.' },
    { icon: Search, title: 'Smart Search', description: 'Find patients instantly with advanced search filters, fuzzy matching, and QR code scanning.' },
    { icon: Bell, title: 'Automated Alerts', description: 'Smart reminders for follow-ups, medication refills, and upcoming appointments.' },
    { icon: Users, title: 'Family Linking', description: 'Link family members for comprehensive care coordination and shared medical history.' },
  ];

  const stats = [
    { value: '70%', label: 'Faster Registration' },
    { value: '99.9%', label: 'Data Accuracy' },
    { value: '50K+', label: 'Patients Managed' },
    { value: '24/7', label: 'Access Available' },
  ];

  const benefits = [
    { text: 'Digital patient registration' },
    { text: 'Complete medical history' },
    { text: 'Family member linking' },
    { text: 'Insurance verification' },
    { text: 'Emergency contacts' },
    { text: 'Allergy tracking' },
  ];

  const testimonial = {
    quote: "The patient management system has transformed how we handle registrations. What used to take 15 minutes now takes less than 3. Our patients love the streamlined experience.",
    author: "Dr. Sarah Mitchell",
    role: "Chief Medical Officer",
    hospital: "Metro General Hospital"
  };

  return (
    <FeaturePageLayout
      badge="Core Feature"
      badgeIcon={Users}
      title="Patient Management"
      subtitle="Complete patient lifecycle management"
      description="Comprehensive patient registry and records management system. Streamline patient data, medical history, and care coordination in one secure, HIPAA-compliant platform designed for modern healthcare."
      heroImage={patientManagementImg}
      features={features}
      stats={stats}
      benefits={benefits}
      testimonial={testimonial}
      ctaTitle="Ready to Transform Patient Care?"
      ctaDescription="Join thousands of healthcare providers who trust our platform for seamless patient management. Start your free trial today."
    />
  );
};

export default PatientManagement;
