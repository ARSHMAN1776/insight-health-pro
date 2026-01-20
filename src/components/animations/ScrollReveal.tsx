import React, { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';

type AnimationType = 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'blur-in' | 'slide-up';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  staggerChildren?: number;
  once?: boolean;
}

const getVariants = (animation: AnimationType): Variants => {
  const variants: Record<AnimationType, Variants> = {
    'fade-up': {
      hidden: { opacity: 0, y: 60 },
      visible: { opacity: 1, y: 0 }
    },
    'fade-down': {
      hidden: { opacity: 0, y: -60 },
      visible: { opacity: 1, y: 0 }
    },
    'fade-left': {
      hidden: { opacity: 0, x: -60 },
      visible: { opacity: 1, x: 0 }
    },
    'fade-right': {
      hidden: { opacity: 0, x: 60 },
      visible: { opacity: 1, x: 0 }
    },
    'scale': {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 }
    },
    'blur-in': {
      hidden: { opacity: 0, filter: 'blur(10px)' },
      visible: { opacity: 1, filter: 'blur(0px)' }
    },
    'slide-up': {
      hidden: { opacity: 0, y: 100 },
      visible: { opacity: 1, y: 0 }
    }
  };
  return variants[animation];
};

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  duration = 0.6,
  staggerChildren = 0,
  once = true
}) => {
  const variants = getVariants(animation);

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-100px" }}
      variants={{
        hidden: variants.hidden,
        visible: {
          ...variants.visible,
          transition: {
            duration,
            delay,
            ease: [0.25, 0.4, 0.25, 1],
            staggerChildren: staggerChildren > 0 ? staggerChildren : undefined
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
