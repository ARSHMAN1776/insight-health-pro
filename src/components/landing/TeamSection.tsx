import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Linkedin, Twitter } from 'lucide-react';

const teamMembers = [
  {
    id: 1,
    name: 'Dr. Sarah Mitchell',
    role: 'Chief Medical Officer',
    specialty: 'Internal Medicine',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&q=80',
    education: 'Harvard Medical School',
    bio: 'Leading our medical team with 20 years of clinical excellence.',
  },
  {
    id: 2,
    name: 'Dr. David Park',
    role: 'Head of Cardiology',
    specialty: 'Cardiovascular Surgery',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&q=80',
    education: 'Johns Hopkins University',
    bio: 'Pioneer in minimally invasive heart procedures.',
  },
  {
    id: 3,
    name: 'Dr. Maria Santos',
    role: 'Head of Pediatrics',
    specialty: 'Child Healthcare',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&q=80',
    education: 'Stanford University',
    bio: 'Dedicated to making healthcare comfortable for children.',
  },
  {
    id: 4,
    name: 'Dr. Michael Thompson',
    role: 'Chief of Surgery',
    specialty: 'General & Trauma Surgery',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&q=80',
    education: 'Yale School of Medicine',
    bio: 'Expert surgeon with strength in complex procedures.',
  },
];

const TeamSection = () => {
  return (
    <section className="py-24 bg-muted/20 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Our Doctors
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
            Meet the <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Experts</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our team of board-certified physicians brings decades of combined experience to deliver exceptional patient care.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <Card 
              key={member.id} 
              className="group overflow-hidden border-0 bg-card shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="relative overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-80 object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                
                {/* Social links on hover */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                  <a href="#" className="w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-card transition-colors shadow-lg">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href="#" className="w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-card transition-colors shadow-lg">
                    <Twitter className="w-4 h-4" />
                  </a>
                </div>
              </div>
              
              <CardContent className="p-6 -mt-8 relative">
                <div className="bg-card rounded-xl p-4 shadow-sm border border-border/50">
                  <h3 className="text-lg font-bold text-foreground">{member.name}</h3>
                  <p className="text-primary font-medium text-sm mb-1">{member.role}</p>
                  <p className="text-xs text-muted-foreground mb-3">{member.education}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
