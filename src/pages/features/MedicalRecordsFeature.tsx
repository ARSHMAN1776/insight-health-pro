import React from 'react';
import { FileText, Lock, Search, Share2, History, Cloud } from 'lucide-react';
import FeaturePageLayout from '@/components/features/FeaturePageLayout';
import medicalRecordsImg from '@/assets/features/medical-records.jpg';

const MedicalRecordsFeature = () => {
  const features = [
    { icon: FileText, title: 'Electronic Health Records', description: 'Digitize all patient medical data with structured templates and customizable forms.' },
    { icon: Lock, title: 'Secure Access', description: 'Role-based permissions, end-to-end encryption, and comprehensive audit trails for compliance.' },
    { icon: Search, title: 'Quick Retrieval', description: 'Find any record in seconds with smart search, filters, and AI-powered suggestions.' },
    { icon: Share2, title: 'Easy Sharing', description: 'Share records between departments securely with granular access controls.' },
    { icon: History, title: 'Version History', description: 'Track all changes with complete audit log and ability to view historical versions.' },
    { icon: Cloud, title: 'Cloud Backup', description: 'Automatic backups with geo-redundant storage and instant disaster recovery.' },
  ];

  const stats = [
    { value: '100%', label: 'Paperless' },
    { value: '5 sec', label: 'Record Retrieval' },
    { value: '99.99%', label: 'Uptime SLA' },
    { value: 'HIPAA', label: 'Compliant' },
  ];

  const benefits = [
    { text: 'Structured EHR templates' },
    { text: 'Digital prescriptions' },
    { text: 'Lab result integration' },
    { text: 'Document scanning' },
    { text: 'E-signatures' },
    { text: 'FHIR export support' },
  ];

  const testimonial = {
    quote: "Going paperless with this EHR system saved us over $50,000 annually in storage and administrative costs. The quick record retrieval has significantly improved our care quality.",
    author: "Maria Thompson",
    role: "Hospital Administrator",
    hospital: "Regional Health System"
  };

  return (
    <FeaturePageLayout
      badge="Core Feature"
      badgeIcon={FileText}
      title="Medical Records"
      subtitle="Complete EHR solution"
      description="Comprehensive Electronic Health Records (EHR) system. Secure, accessible, and fully compliant with healthcare regulations. Go paperless and improve care quality."
      heroImage={medicalRecordsImg}
      features={features}
      stats={stats}
      benefits={benefits}
      testimonial={testimonial}
      ctaTitle="Go Paperless Today"
      ctaDescription="Transition to digital records and improve patient care quality. Join thousands of healthcare providers who've already made the switch."
    />
  );
};

export default MedicalRecordsFeature;
