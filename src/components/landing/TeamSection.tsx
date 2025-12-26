import React from 'react';
import { Linkedin, Twitter, Mail } from 'lucide-react';
import ScrollAnimationWrapper from './ScrollAnimationWrapper';

const teamMembers = [
  {
    name: 'Dr. Richard Hayes',
    role: 'Chief Executive Officer',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&q=80',
    bio: '20+ years in healthcare technology',
    gradient: 'from-primary to-primary/70',
  },
  {
    name: 'Dr. Amanda Foster',
    role: 'Chief Medical Officer',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&q=80',
    bio: 'Board-certified physician',
    gradient: 'from-info to-info/70',
  },
  {
    name: 'David Kim',
    role: 'Chief Technology Officer',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&q=80',
    bio: 'Former Google engineer',
    gradient: 'from-success to-success/70',
  },
  {
    name: 'Sarah Martinez',
    role: 'VP of Customer Success',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&q=80',
    bio: '15 years healthcare ops',
    gradient: 'from-warning to-warning/70',
  },
];

const TeamSection = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-dots opacity-20"></div>
      <div className="absolute bottom-0 left-1/4 w-1/2 h-80 bg-gradient-to-t from-primary/5 to-transparent blur-3xl"></div>
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <ScrollAnimationWrapper className="text-center mb-16">
          <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-full text-sm font-semibold mb-6">
            Our Team
          </span>
          <h2 className="text-4xl lg:text-6xl font-bold text-foreground mb-4">
            Meet the Minds Behind
            <span className="text-gradient-mesh block mt-2">The Innovation</span>
          </h2>
        </ScrollAnimationWrapper>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <ScrollAnimationWrapper 
              key={index} 
              delay={index * 100}
              className="group"
            >
              <div className="relative">
                <div className="bg-card border border-border/50 rounded-3xl overflow-hidden hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                  {/* Image Container */}
                  <div className="relative h-72 overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Social Icons */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                      <button className="w-10 h-10 rounded-xl bg-card/90 backdrop-blur-xl flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-lg">
                        <Linkedin className="w-5 h-5" />
                      </button>
                      <button className="w-10 h-10 rounded-xl bg-card/90 backdrop-blur-xl flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-lg">
                        <Twitter className="w-5 h-5" />
                      </button>
                      <button className="w-10 h-10 rounded-xl bg-card/90 backdrop-blur-xl flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-lg">
                        <Mail className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 text-center">
                    <div className={`inline-block w-12 h-1 rounded-full bg-gradient-to-r ${member.gradient} mb-4`}></div>
                    <h3 className="text-xl font-bold text-foreground mb-1">{member.name}</h3>
                    <div className="text-primary font-medium text-sm mb-2">{member.role}</div>
                    <p className="text-muted-foreground text-sm">{member.bio}</p>
                  </div>
                </div>
              </div>
            </ScrollAnimationWrapper>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;