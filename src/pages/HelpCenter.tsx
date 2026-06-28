import { useState } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import AnimatedBackground from "@/components/landing/AnimatedBackground";
import ScrollAnimationWrapper from "@/components/landing/ScrollAnimationWrapper";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen, CreditCard, Calendar, Shield, MessageCircle, FileText } from "lucide-react";

const categories = [
  { icon: Calendar, title: "Appointments", desc: "Booking, rescheduling, cancellations." },
  { icon: CreditCard, title: "Billing & Payments", desc: "Invoices, insurance, refunds." },
  { icon: FileText, title: "Medical Records", desc: "Access reports, prescriptions, history." },
  { icon: Shield, title: "Account & Privacy", desc: "Login help, data security, consent." },
  { icon: BookOpen, title: "Getting Started", desc: "New patient guide and onboarding." },
  { icon: MessageCircle, title: "Contacting Staff", desc: "Reach doctors, nurses, and support." },
];

const faqs = [
  { q: "How do I book an appointment?", a: "Log in to your patient portal, select a department and doctor, then pick an available time slot. You'll get a confirmation by email and SMS." },
  { q: "How do I access my lab reports?", a: "Lab reports are published to your portal under Medical Records as soon as they're verified. You can also scan the QR code on a printed copy to verify authenticity." },
  { q: "What payment methods do you accept?", a: "We accept major credit/debit cards, UPI, net banking, cash, and most insurance partners. Visit Billing for the latest list." },
  { q: "How do I request a prescription refill?", a: "Open Prescriptions in your portal and tap Request Refill on the relevant prescription. Your doctor will review and approve." },
  { q: "Is my data secure?", a: "Yes. All data is encrypted in transit and at rest. Access is governed by role-based controls and full audit logs." },
  { q: "Can I cancel or reschedule?", a: "Yes, free of charge up to 2 hours before your appointment. Late cancellations may incur a small fee." },
];

const HelpCenter = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const filtered = faqs.filter(f =>
    f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="relative pt-32 pb-16 overflow-hidden">
        <AnimatedBackground />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <ScrollAnimationWrapper>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">How can we help?</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Search our knowledge base or browse by topic.
            </p>
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles, e.g. 'reschedule appointment'"
                className="pl-12 h-14 text-base"
              />
            </div>
          </ScrollAnimationWrapper>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {categories.map((c) => (
              <Card key={c.title} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <c.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{c.title}</h3>
                    <p className="text-sm text-muted-foreground">{c.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {filtered.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent>{f.a}</AccordionContent>
                </AccordionItem>
              ))}
              {filtered.length === 0 && (
                <p className="text-muted-foreground py-8 text-center">No articles found.</p>
              )}
            </Accordion>

            <Card className="mt-12 bg-primary text-primary-foreground">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
                <p className="mb-6 opacity-90">Our support team responds within 24 hours.</p>
                <Button variant="secondary" size="lg" onClick={() => navigate('/contact')}>
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};
export default HelpCenter;
