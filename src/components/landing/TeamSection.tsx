import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Linkedin, Mail } from 'lucide-react';

const teamMembers = [
  {
    id: 1,
    name: 'Dr. Amanda Williams',
    role: 'Chief Medical Officer',
    specialty: 'Internal Medicine',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&q=80',
    experience: '20+ years experience',
  },
  {
    id: 2,
    name: 'Dr. Robert Martinez',
    role: 'Head of Cardiology',
    specialty: 'Interventional Cardiology',
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&q=80',
    experience: '15+ years experience',
  },
  {
    id: 3,
    name: 'Dr. Lisa Chen',
    role: 'Head of Pediatrics',
    specialty: 'Pediatric Care',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&q=80',
    experience: '12+ years experience',
  },
  {
    id: 4,
    name: 'Dr. James Wilson',
    role: 'Head of Surgery',
    specialty: 'General Surgery',
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&q=80',
    experience: '18+ years experience',
  },
];

const TeamSection = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block bg-medical-green/10 text-medical-green px-4 py-2 rounded-full text-sm font-medium mb-4">
            Our Team
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Meet Our Expert Physicians
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Dedicated healthcare professionals committed to providing exceptional patient care
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <Card 
              key={member.id} 
              className="group overflow-hidden border-2 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:-translate-y-2"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                    <button className="w-10 h-10 rounded-full bg-card/90 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-card/90 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                      <Mail className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6 text-center">
                <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                <p className="text-primary font-medium mb-2">{member.role}</p>
                <p className="text-sm text-muted-foreground mb-2">{member.specialty}</p>
                <span className="inline-block bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                  {member.experience}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
