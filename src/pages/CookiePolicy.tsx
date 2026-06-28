import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import ScrollAnimationWrapper from "@/components/landing/ScrollAnimationWrapper";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-10">
    <h2 className="text-2xl font-semibold mb-3">{title}</h2>
    <div className="text-muted-foreground leading-relaxed space-y-3">{children}</div>
  </section>
);

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative pt-32 pb-12 overflow-hidden">
        <AnimatedBackground />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <ScrollAnimationWrapper>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Cookie Policy</h1>
            <p className="text-muted-foreground">Last updated: June 2026</p>
          </ScrollAnimationWrapper>
        </div>
      </section>

      <article className="container mx-auto px-4 lg:px-8 max-w-3xl py-12">
        <Section title="What are cookies?">
          <p>Cookies are small text files stored on your device to help websites remember information about your visit, like your preferred language and login session.</p>
        </Section>

        <Section title="How we use cookies">
          <p>We use cookies that are strictly necessary to keep you signed in and secure, plus a small set of analytics cookies to understand aggregate usage and improve the product.</p>
        </Section>

        <Section title="Types of cookies we set">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cookie</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>sb-access-token</TableCell>
                  <TableCell>Authentication session</TableCell>
                  <TableCell>Session</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>sb-refresh-token</TableCell>
                  <TableCell>Refresh login securely</TableCell>
                  <TableCell>30 days</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>theme</TableCell>
                  <TableCell>Remember light/dark preference</TableCell>
                  <TableCell>1 year</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>lang</TableCell>
                  <TableCell>Preferred language</TableCell>
                  <TableCell>1 year</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Section>

        <Section title="Managing cookies">
          <p>You can control or delete cookies through your browser settings. Disabling essential cookies will prevent you from staying signed in.</p>
        </Section>

        <Section title="Contact">
          <p>
            Questions? Email{" "}
            <a className="text-primary underline" href="mailto:privacy@healthcare.com">privacy@healthcare.com</a>.
          </p>
        </Section>
      </article>
      <Footer />
    </div>
  );
};
export default CookiePolicy;
