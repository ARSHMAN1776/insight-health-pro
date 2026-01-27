import { Shield, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  const lastUpdated = "January 27, 2026";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">HealthCare HMS</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/security">
              <Button variant="ghost">Security</Button>
            </Link>
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: {lastUpdated}</p>
          </div>
        </div>

        <Card>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none pt-6 space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-muted-foreground">
                HealthCare HMS ("we," "our," or "us") is committed to protecting your privacy and ensuring 
                the security of your personal health information. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our hospital management system.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
              <h3 className="text-lg font-medium mt-4 mb-2">Personal Information</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Name, date of birth, gender, and contact information</li>
                <li>Government-issued identification numbers</li>
                <li>Insurance information and billing details</li>
                <li>Emergency contact information</li>
              </ul>

              <h3 className="text-lg font-medium mt-4 mb-2">Protected Health Information (PHI)</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Medical history and health conditions</li>
                <li>Diagnoses, treatments, and medications</li>
                <li>Laboratory results and diagnostic imaging</li>
                <li>Clinical notes and care plans</li>
                <li>Appointment and visit records</li>
              </ul>

              <h3 className="text-lg font-medium mt-4 mb-2">Technical Information</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>IP address and device information</li>
                <li>Browser type and operating system</li>
                <li>Usage patterns and access logs</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-3">We use your information to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Provide and coordinate healthcare services</li>
                <li>Process appointments and manage patient care</li>
                <li>Handle billing and insurance claims</li>
                <li>Communicate important health information</li>
                <li>Improve our services and user experience</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Ensure the security and integrity of our systems</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Data Protection & Security</h2>
              <p className="text-muted-foreground mb-3">
                We implement comprehensive security measures to protect your information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><strong>Encryption:</strong> All data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
                <li><strong>Access Control:</strong> Role-based access ensures only authorized personnel can view your data</li>
                <li><strong>Audit Logging:</strong> All access to PHI is logged and monitored</li>
                <li><strong>Data Isolation:</strong> Multi-tenant architecture ensures complete separation between organizations</li>
                <li><strong>Regular Audits:</strong> We conduct regular security assessments and penetration testing</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold mb-3">5. HIPAA Compliance</h2>
              <p className="text-muted-foreground">
                HealthCare HMS is designed to be compliant with the Health Insurance Portability and 
                Accountability Act (HIPAA). We implement administrative, physical, and technical safeguards 
                to protect the confidentiality, integrity, and availability of electronic Protected Health 
                Information (ePHI). We enter into Business Associate Agreements (BAAs) with covered entities 
                as required.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Information Sharing</h2>
              <p className="text-muted-foreground mb-3">We may share your information with:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Healthcare providers involved in your care</li>
                <li>Insurance companies for claims processing</li>
                <li>Laboratories and diagnostic facilities</li>
                <li>Legal authorities when required by law</li>
                <li>Third-party service providers under strict contractual obligations</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                We never sell your personal information or PHI to third parties.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
              <p className="text-muted-foreground mb-3">You have the right to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Access your medical records and personal information</li>
                <li>Request corrections to inaccurate information</li>
                <li>Request restrictions on certain uses of your information</li>
                <li>Receive an accounting of disclosures</li>
                <li>Request confidential communications</li>
                <li>File a complaint if you believe your rights have been violated</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain medical records and PHI in accordance with applicable laws and regulations. 
                Typically, medical records are retained for a minimum of 7 years from the date of last 
                treatment, or longer as required by state law. Technical logs are retained for security 
                monitoring purposes and deleted after 90 days unless needed for ongoing investigations.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold mb-3">9. International Data Transfers</h2>
              <p className="text-muted-foreground">
                Your information may be stored and processed in data centers located in various countries. 
                We ensure appropriate safeguards are in place for any international transfers, including 
                Standard Contractual Clauses and other legally recognized transfer mechanisms.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Children's Privacy</h2>
              <p className="text-muted-foreground">
                Our services may be used by healthcare providers to manage the health information of minors. 
                Such information is protected under applicable privacy laws. Parents and guardians have 
                rights to access and manage their children's health information as permitted by law.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy periodically. We will notify you of material changes 
                by posting the new policy on our website and updating the "Last Updated" date. Your 
                continued use of our services after such modifications constitutes acceptance of the 
                updated policy.
              </p>
            </section>

            <Separator />

            <section>
              <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                If you have questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-medium">HealthCare HMS Privacy Office</p>
                <p className="text-muted-foreground">Email: privacy@healthcarehms.com</p>
                <p className="text-muted-foreground">Phone: 1-800-HMS-CARE</p>
              </div>
            </section>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            For more information about our security practices, visit our Security page.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/security">
              <Button variant="outline">Security Information</Button>
            </Link>
            <Link to="/contact">
              <Button>Contact Us</Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} HealthCare HMS. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link to="/about" className="hover:text-foreground">About</Link>
            <Link to="/contact" className="hover:text-foreground">Contact</Link>
            <Link to="/security" className="hover:text-foreground">Security</Link>
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/status" className="hover:text-foreground">Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PrivacyPolicy;
