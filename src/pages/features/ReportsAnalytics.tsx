import React from 'react';
import { BarChart3, TrendingUp, FileSpreadsheet, PieChart, Download, Calendar } from 'lucide-react';
import FeaturePageLayout from '@/components/features/FeaturePageLayout';
import reportsImg from '@/assets/features/reports-analytics.jpg';

const ReportsAnalytics = () => {
  const features = [
    { icon: BarChart3, title: 'Interactive Dashboards', description: 'Real-time dashboards with drill-down capabilities and custom visualizations.' },
    { icon: TrendingUp, title: 'Trend Analysis', description: 'Identify patterns in patient visits, revenue, and operational metrics over time.' },
    { icon: FileSpreadsheet, title: 'Custom Reports', description: 'Build custom reports with drag-and-drop report builder and scheduling.' },
    { icon: PieChart, title: 'Department Analytics', description: 'Compare performance across departments with benchmarking tools.' },
    { icon: Download, title: 'Export Options', description: 'Export reports in PDF, Excel, or CSV formats for external analysis.' },
    { icon: Calendar, title: 'Scheduled Reports', description: 'Automate report generation and delivery to stakeholders.' },
  ];

  const stats = [
    { value: '50+', label: 'Report Templates' },
    { value: 'Real-time', label: 'Data Updates' },
    { value: '360°', label: 'Visibility' },
    { value: '100%', label: 'Customizable' },
  ];

  const benefits = [
    { text: 'Revenue analytics' },
    { text: 'Patient demographics' },
    { text: 'Appointment trends' },
    { text: 'Staff performance' },
    { text: 'Inventory reports' },
    { text: 'Compliance reports' },
  ];

  const testimonial = {
    quote: "The analytics platform gave us insights we never had before. We identified a 30% revenue leakage in our billing process and fixed it within weeks. ROI was immediate.",
    author: "Michael Roberts",
    role: "CEO",
    hospital: "HealthFirst Network"
  };

  return (
    <FeaturePageLayout
      badge="Analytics Feature"
      badgeIcon={BarChart3}
      title="Reports & Analytics"
      subtitle="Data-driven decision making"
      description="Comprehensive reporting and analytics platform with interactive dashboards, custom report builder, and automated insights. Make informed decisions with real-time data."
      heroImage={reportsImg}
      features={features}
      stats={stats}
      benefits={benefits}
      testimonial={testimonial}
      ctaTitle="Unlock Your Data's Potential"
      ctaDescription="Transform raw data into actionable insights. Make better decisions, identify opportunities, and drive growth with powerful analytics."
    />
  );
};

export default ReportsAnalytics;
