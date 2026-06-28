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

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative pt-32 pb-12 overflow-hidden">
        <AnimatedBackground />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <ScrollAnimationWrapper>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: June 2026</p>
          </ScrollAnimationWrapper>
        </div>
      </section>

      <article className="container mx-auto px-4 lg:px-8 max-w-3xl py-12">
        <p className="text-muted-foreground mb-10">
          Please read these Terms carefully before using the platform. By accessing the service you agree to be bound by them.
        </p>

        <Section title="1. Acceptance of Terms">
          <p>By creating an account or using the service, you confirm that you are at least 18 years old (or have guardian consent) and agree to these Terms.</p>
        </Section>

        <Section title="2. Medical Disclaimer">
          <p>The platform supports communication with licensed care providers and does not replace in-person emergency care. In case of emergency, dial your local emergency number.</p>
        </Section>

        <Section title="3. User Accounts">
          <p>You are responsible for safeguarding your credentials and for all activity under your account. Notify us immediately of unauthorized use.</p>
        </Section>

        <Section title="4. Acceptable Use">
          <p>You agree not to misuse the service, attempt to access data you are not authorized to view, or interfere with security features and audit controls.</p>
        </Section>

        <Section title="5. Payments & Billing">
          <p>Charges are presented before confirmation. Refunds, where applicable, follow the billing policy displayed at checkout.</p>
        </Section>

        <Section title="6. Intellectual Property">
          <p>All software, designs, and content are owned by the operator or its licensors. You receive a limited, non-exclusive license to use the service for its intended purpose.</p>
        </Section>

        <Section title="7. Limitation of Liability">
          <p>To the maximum extent permitted by law, the operator is not liable for indirect or consequential damages arising from use of the platform.</p>
        </Section>

        <Section title="8. Termination">
          <p>We may suspend or terminate access for violation of these Terms. You may close your account at any time, subject to retention obligations for medical records.</p>
        </Section>

        <Section title="9. Governing Law">
          <p>These Terms are governed by the laws of the jurisdiction where the operating hospital is registered.</p>
        </Section>

        <Section title="10. Contact">
          <p>
            Questions about these Terms? Email{" "}
            <a className="text-primary underline" href="mailto:legal@healthcare.com">legal@healthcare.com</a>.
          </p>
        </Section>
      </article>
      <Footer />
    </div>
  );
};
export default TermsOfService;
