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
  Users
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ScrollReveal, TiltCard } from '@/components/animations';

const departments = [
  { 
    name: 'General Medicine', 
    icon: Stethoscope, 
    description: 'Primary care and internal medicine',
    color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
  },
  { 
    name: 'Cardiology', 
    icon: Heart, 
    description: 'Heart and cardiovascular care',
    color: 'bg-red-500/10 text-red-600 dark:text-red-400'
  },
  { 
    name: 'Neurology', 
    icon: Brain, 
    description: 'Brain and nervous system',
    color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
  },
  { 
    name: 'Orthopedics', 
    icon: Bone, 
    description: 'Bones, joints, and muscles',
    color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
  },
  { 
    name: 'Pediatrics', 
    icon: Baby, 
    description: 'Child and adolescent health',
    color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400'
  },
  { 
    name: 'Ophthalmology', 
    icon: Eye, 
    description: 'Eye care and vision',
    color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
  },
  { 
    name: 'Emergency', 
    icon: Activity, 
    description: '24/7 emergency services',
    color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
  },
  { 
    name: 'Radiology', 
    icon: Microscope, 
    description: 'Imaging and diagnostics',
    color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
  },
  { 
    name: 'Laboratory', 
    icon: Syringe, 
    description: 'Lab tests and analysis',
    color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
  },
  { 
    name: 'Pharmacy', 
    icon: Pill, 
    description: 'Medication management',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400'
  },
  { 
    name: 'Surgery', 
    icon: Scissors, 
    description: 'Surgical procedures',
    color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
  },
  { 
    name: 'Outpatient', 
    icon: Users, 
    description: 'Outpatient services',
    color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15
    }
  }
};

const DepartmentsSection: React.FC = () => {
  return (
    <section id="departments" className="py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <ScrollReveal animation="fade-up" className="text-center mb-16">
          <motion.span 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <Stethoscope className="w-4 h-4" />
            Comprehensive Coverage
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Manage All <span className="text-primary">Departments</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our HMS provides specialized modules for every department, ensuring seamless operations across your entire healthcare facility.
          </p>
        </ScrollReveal>

        {/* Departments Grid */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {departments.map((dept, index) => {
            const Icon = dept.icon;
            return (
              <motion.div key={dept.name} variants={itemVariants}>
                <TiltCard tiltAmount={5}>
                  <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 cursor-pointer overflow-hidden h-full">
                    <CardContent className="p-4 sm:p-6">
                      <motion.div 
                        className={`w-12 h-12 rounded-xl ${dept.color} flex items-center justify-center mb-4`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Icon className="w-6 h-6" />
                      </motion.div>
                      <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                        {dept.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {dept.description}
                      </p>
                    </CardContent>
                  </Card>
                </TiltCard>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <ScrollReveal animation="fade-up" delay={0.3} className="mt-12 text-center">
          <p className="text-muted-foreground">
            Need a custom department?{' '}
            <motion.span 
              className="text-primary font-medium cursor-pointer"
              whileHover={{ scale: 1.05 }}
            >
              Contact us
            </motion.span>{' '}
            for tailored solutions.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default DepartmentsSection;
