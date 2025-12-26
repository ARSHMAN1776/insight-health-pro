import React, { useEffect, useRef, useState, ReactNode } from 'react';

interface ScrollAnimationWrapperProps {
  children: ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-left' | 'fade-right' | 'scale' | 'fade-down';
  delay?: number;
  threshold?: number;
}

const ScrollAnimationWrapper: React.FC<ScrollAnimationWrapperProps> = ({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  threshold = 0.1
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay, threshold]);

  const getAnimationClass = () => {
    const baseClass = isVisible ? 'visible' : '';
    switch (animation) {
      case 'fade-up':
        return `scroll-animate ${baseClass}`;
      case 'fade-left':
        return `scroll-animate-left ${baseClass}`;
      case 'fade-right':
        return `scroll-animate-right ${baseClass}`;
      case 'fade-down':
        return `scroll-animate ${baseClass}`;
      case 'scale':
        return `scroll-animate-scale ${baseClass}`;
      default:
        return `scroll-animate ${baseClass}`;
    }
  };

  return (
    <div 
      ref={ref} 
      className={`${getAnimationClass()} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default ScrollAnimationWrapper;
