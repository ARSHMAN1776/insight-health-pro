import { Shield, Lock, Eye, Database, FileCheck, Users, Server, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Security = () => {
  const securityFeatures = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.",
      status: "Active"
    },
    {
      icon: Database,
      title: "Row-Level Security (RLS)",
      description: "Every database query is filtered through 265+ security policies ensuring strict data isolation between organizations.",
      status: "Active"
    },
    {
      icon: Users,
      title: "Multi-Tenant Isolation",
      description: "Complete data separation between healthcare organizations. No cross-tenant data access is possible.",
      status: "Active"
    },
    {
      icon: Eye,
      title: "PHI Audit Logging",
      description: "All access to Protected Health Information is logged with user, timestamp, and action details for compliance auditing.",
      status: "Active"
    },
    {
      icon: Shield,
      title: "Role-Based Access Control",
      description: "Granular permissions system with 7 distinct roles: Admin, Doctor, Nurse, Receptionist, Lab Technician, Pharmacist, and Patient.",
      status: "Active"
    },
    {
      icon: Server,
      title: "Secure Infrastructure",
      description: "Hosted on enterprise-grade cloud infrastructure with automatic failover, backups, and DDoS protection.",
      status: "Active"
    }
  ];

  const complianceItems = [
    { name: "HIPAA", status: "Compliance-Ready", description: "Technical safeguards implemented" },
    { name: "GDPR", status: "Compliant", description: "Data protection and privacy controls" },
    { name: "SOC 2 Type II", status: "In Progress", description: "Security audit underway" },
    { name: "ISO 27001", status: "Planned", description: "Information security management" }
  ];

  const securityPractices = [
    "JWT-based authentication with secure token lifecycle",
    "Automatic session expiration and refresh token rotation",
    "Rate limiting on all API endpoints",
    "Input validation and SQL injection prevention",
    "Regular security patches and dependency updates",
    "Penetration testing and vulnerability assessments",
    "Incident response plan and procedures",
    "Employee security training and background checks"
  ];

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
            <Link to="/status">
              <Button variant="ghost">System Status</Button>
            </Link>
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            Security & Compliance
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Enterprise-Grade Security
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your patients' data is protected by industry-leading security measures. 
            We implement defense-in-depth strategies to ensure complete data protection.
          </p>
        </div>
      </section>

      {/* Security Features Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Security Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {feature.status}
                    </Badge>
                  </div>
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Compliance Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Compliance & Certifications</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            We continuously work towards and maintain compliance with healthcare industry standards and regulations.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {complianceItems.map((item, index) => (
              <Card key={index}>
                <CardHeader className="text-center">
                  <FileCheck className="h-10 w-10 mx-auto text-primary mb-2" />
                  <CardTitle>{item.name}</CardTitle>
                  <Badge 
                    variant={item.status === "Compliant" || item.status === "Compliance-Ready" ? "default" : "secondary"}
                    className="mt-2"
                  >
                    {item.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Security Practices</h2>
            <Card>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {securityPractices.map((practice, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{practice}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Data Protection Statement */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="h-16 w-16 mx-auto text-primary mb-6" />
            <h2 className="text-3xl font-bold mb-4">Your Data, Protected</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We take the security of your healthcare data seriously. Our platform is built from the ground up 
              with security as a core principle, not an afterthought. Every line of code, every database query, 
              and every API call is designed with patient privacy in mind.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg">Contact Security Team</Button>
              </Link>
              <Link to="/status">
                <Button size="lg" variant="outline">View System Status</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} HealthCare HMS. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link to="/about" className="hover:text-foreground">About</Link>
            <Link to="/contact" className="hover:text-foreground">Contact</Link>
            <Link to="/security" className="hover:text-foreground">Security</Link>
            <Link to="/status" className="hover:text-foreground">Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Security;
