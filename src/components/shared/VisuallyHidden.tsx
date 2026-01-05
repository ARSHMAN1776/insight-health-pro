/**
 * Visually Hidden Component - WCAG 2.1 AA Compliance
 * Hides content visually but keeps it accessible to screen readers
 */
interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
}

export function VisuallyHidden({ children, as: Component = 'span' }: VisuallyHiddenProps) {
  return (
    <Component className="sr-only">
      {children}
    </Component>
  );
}

/**
 * Live Region Component - Announces dynamic content to screen readers
 */
interface LiveRegionProps {
  children: React.ReactNode;
  priority?: 'polite' | 'assertive';
  atomic?: boolean;
}

export function LiveRegion({ 
  children, 
  priority = 'polite',
  atomic = true 
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic={atomic}
      className="sr-only"
    >
      {children}
    </div>
  );
}
