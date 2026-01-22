import React from 'react';
import { 
  Stethoscope, 
  Heart, 
  Brain, 
  Bone, 
  Baby, 
  Eye,
  Activity,
  Syringe,
  Microscope,
  Pill,
  Scissors,
  Users,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/animations';
import { useNavigate } from 'react-router-dom';

const departments = [
  { 
    name: 'General Medicine', 
    icon: Stethoscope, 
    description: 'Primary care & internal medicine',
    gradient: 'from-blue-500 to-cyan-500',
    patients: '2,400+',
  },
  { 
    name: 'Cardiology', 
    icon: Heart, 
    description: 'Heart & cardiovascular care',
    gradient: 'from-red-500 to-rose-500',
    patients: '1,800+',
  },
  { 
    name: 'Neurology', 
    icon: Brain, 
    description: 'Brain & nervous system',
    gradient: 'from-purple-500 to-violet-500',
    patients: '1,200+',
  },
  { 
    name: 'Orthopedics', 
    icon: Bone, 
    description: 'Bones, joints & muscles',
    gradient: 'from-orange-500 to-amber-500',
    patients: '1,600+',
  },
  { 
    name: 'Pediatrics', 
    icon: Baby, 
    description: 'Child & adolescent health',
    gradient: 'from-pink-500 to-rose-400',
    patients: '2,100+',
  },
  { 
    name: 'Ophthalmology', 
    icon: Eye, 
    description: 'Eye care & vision',
    gradient: 'from-cyan-500 to-teal-500',
    patients: '900+',
  },
  { 
    name: 'Emergency', 
    icon: Activity, 
    description: '24/7 emergency services',
    gradient: 'from-rose-600 to-red-600',
    patients: '5,000+',
  },
  { 
    name: 'Radiology', 
    icon: Microscope, 
    description: 'Imaging & diagnostics',
    gradient: 'from-indigo-500 to-purple-500',
    patients: '3,200+',
  },
  { 
    name: 'Laboratory', 
    icon: Syringe, 
    description: 'Lab tests & analysis',
    gradient: 'from-emerald-500 to-teal-500',
    patients: '4,500+',
  },
  { 
    name: 'Pharmacy', 
    icon: Pill, 
    description: 'Medication management',
    gradient: 'from-green-500 to-emerald-500',
    patients: '6,000+',
  },
  { 
    name: 'Surgery', 
    icon: Scissors, 
    description: 'Surgical procedures',
    gradient: 'from-amber-500 to-yellow-500',
    patients: '800+',
  },
  { 
    name: 'Outpatient', 
    icon: Users, 
    description: 'Outpatient services',
    gradient: 'from-teal-500 to-cyan-500',
    patients: '7,000+',
  },
];

const DepartmentsSection = () => {
  const navigate = useNavigate();

  return (
    <section id="departments" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/30" />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <ScrollReveal animation="fade-up" className="text-center mb-16">
          <motion.div 
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary/15 to-primary/5 text-primary text-sm font-semibold mb-6 border border-primary/10"
            whileHover={{ scale: 1.02 }}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Comprehensive Coverage</span>
          </motion.div>
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6">
            Manage Every
            <span className="block text-primary mt-2">Department Seamlessly</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Specialized modules for every department, ensuring seamless operations across your entire healthcare facility.
          </p>
        </ScrollReveal>

        {/* Departments Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {departments.map((dept, index) => {
            const Icon = dept.icon;
            return (
              <ScrollReveal
                key={dept.name}
                animation="fade-up"
                delay={index * 0.03}
              >
                <motion.div 
                  className="group relative cursor-pointer"
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className="relative h-full overflow-hidden rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
                    {/* Gradient Background on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${dept.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />
                    
                    <div className="p-5 lg:p-6">
                      {/* Icon */}
                      <motion.div 
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${dept.gradient} flex items-center justify-center mb-4 shadow-lg`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                      </motion.div>
                      
                      {/* Content */}
                      <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {dept.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {dept.description}
                      </p>
                      
                      {/* Stats */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary">{dept.patients} patients</span>
                        <motion.div 
                          className="w-6 h-6 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          whileHover={{ scale: 1.1 }}
                        >
                          <ArrowRight className="w-3 h-3 text-primary" />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <ScrollReveal animation="fade-up" delay={0.4} className="mt-16 text-center">
          <motion.button
            onClick={() => navigate('/contact')}
            className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            whileHover={{ x: 5 }}
          >
            Need a custom department? Contact us
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default DepartmentsSection;
