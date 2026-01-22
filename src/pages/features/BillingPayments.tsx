import React from 'react';
import { CreditCard, Receipt, FileText, TrendingUp, Shield, Zap } from 'lucide-react';
import FeaturePageLayout from '@/components/features/FeaturePageLayout';
import billingImg from '@/assets/features/billing-payments.jpg';

const BillingPayments = () => {
  const features = [
    { icon: CreditCard, title: 'Multiple Payment Options', description: 'Accept cards, UPI, net banking, and cash with automatic reconciliation.' },
    { icon: Receipt, title: 'Automated Invoicing', description: 'Generate itemized bills automatically from appointments and procedures.' },
    { icon: FileText, title: 'Insurance Claims', description: 'Streamlined insurance claim submission with real-time status tracking.' },
    { icon: TrendingUp, title: 'Revenue Analytics', description: 'Comprehensive dashboards showing revenue trends, outstanding payments, and forecasts.' },
    { icon: Shield, title: 'Secure Transactions', description: 'PCI-DSS compliant payment processing with encrypted data handling.' },
    { icon: Zap, title: 'Instant Receipts', description: 'Digital receipts sent via SMS, email, or WhatsApp instantly after payment.' },
  ];

  const stats = [
    { value: '40%', label: 'Faster Collections' },
    { value: '95%', label: 'Claim Approval' },
    { value: '$2M+', label: 'Daily Processed' },
    { value: '0%', label: 'Data Breaches' },
  ];

  const benefits = [
    { text: 'Multi-gateway support' },
    { text: 'Insurance integration' },
    { text: 'Payment plans' },
    { text: 'Auto reconciliation' },
    { text: 'GST compliant' },
    { text: 'Refund management' },
  ];

  const testimonial = {
    quote: "Our collection cycle reduced from 45 days to just 12 days. The automated insurance claim processing alone saved us 20 hours per week in administrative work.",
    author: "Robert Kumar",
    role: "Finance Director",
    hospital: "Unity Healthcare"
  };

  return (
    <FeaturePageLayout
      badge="Essential Feature"
      badgeIcon={CreditCard}
      title="Billing & Payments"
      subtitle="Streamlined revenue cycle management"
      description="Complete billing and payment solution with insurance claim management, multiple payment gateways, and real-time revenue analytics. Maximize collections and minimize administrative overhead."
      heroImage={billingImg}
      features={features}
      stats={stats}
      benefits={benefits}
      testimonial={testimonial}
      ctaTitle="Optimize Your Revenue Cycle"
      ctaDescription="Reduce payment delays, automate insurance claims, and gain complete visibility into your hospital's finances. Start your free trial today."
    />
  );
};

export default BillingPayments;
