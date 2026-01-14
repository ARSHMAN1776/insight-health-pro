import { Shield, Award, Lock, CheckCircle } from "lucide-react";

const TrustBadges = () => {
  const certifications = [
    { icon: Shield, label: "HIPAA Compliant" },
    { icon: Award, label: "JCI Accredited" },
    { icon: Lock, label: "SOC 2 Certified" },
    { icon: CheckCircle, label: "ISO 27001" },
  ];

  return (
    <section className="py-8 bg-muted/50 border-y border-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16">
          {certifications.map((cert) => (
            <div key={cert.label} className="flex items-center gap-2 text-muted-foreground">
              <cert.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{cert.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
