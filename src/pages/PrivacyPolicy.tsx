import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import ScrollAnimationWrapper from "@/components/landing/ScrollAnimationWrapper";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="text-2xl font-semibold mb-3">{title}</h2>
    <div className="text-muted-foreground leading-relaxed space-y-3">{children}</div>
  </section>
);

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative pt-32 pb-12 overflow-hidden">
        <AnimatedBackground />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <ScrollAnimationWrapper>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: June 2026</p>
          </ScrollAnimationWrapper>
        </div>
      </section>

      <article className="container mx-auto px-4 lg:px-8 max-w-3xl py-12">
        <p className="text-muted-foreground mb-10">
          This page describes how this hospital management system, maintained by the app owner,
          collects, uses, and safeguards your personal and health information.
        </p>

        <Section title="1. Information We Collect">
          <p>We collect information you provide directly (name, contact, demographics), clinical information entered by care teams (diagnoses, prescriptions, lab results), and limited technical data (device, browser, IP) needed to operate the service securely.</p>
        </Section>

        <Section title="2. How We Use Information">
          <p>To deliver care, schedule appointments, process payments, maintain medical records, communicate with you, comply with legal obligations, and improve safety and quality.</p>
        </Section>

        <Section title="3. Sharing & Disclosure">
          <p>We do not sell personal information. We share data only with authorized care providers, payment and insurance partners required to fulfill your request, and authorities when legally required.</p>
        </Section>

        <Section title="4. Data Security">
          <p>Access is governed by role-based controls. Sensitive data is encrypted in transit and at rest. All PHI access is recorded in an immutable audit log reviewed by administrators.</p>
        </Section>

        <Section title="5. Your Rights">
          <p>You may request access to, correction of, or deletion of your personal information, subject to legal retention obligations for medical records. Contact us to exercise any of these rights.</p>
        </Section>

        <Section title="6. Data Retention">
          <p>Medical records are retained for the period required by applicable law. Account and operational data are retained only as long as needed to provide the service.</p>
        </Section>

        <Section title="7. Children's Privacy">
          <p>Minors are treated with additional privacy safeguards. A parent or legal guardian must consent before a minor's account is created.</p>
        </Section>

        <Section title="8. Changes to This Policy">
          <p>We may update this policy. Material changes will be communicated through the portal or by email. Continued use indicates acceptance of the updated policy.</p>
        </Section>

        <Section title="9. Contact">
          <p>
            For privacy questions, email{" "}
            <a className="text-primary underline" href="mailto:privacy@healthcare.com">privacy@healthcare.com</a>.
          </p>
        </Section>
      </article>
      <Footer />
    </div>
  );
};
export default PrivacyPolicy;
