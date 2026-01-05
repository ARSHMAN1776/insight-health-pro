/**
 * Accessibility Utilities - WCAG 2.1 AA Compliance
 * Helpers for keyboard navigation, focus management, and screen reader support
 */

/**
 * Trap focus within a container element (for modals/dialogs)
 */
export function trapFocus(container: HTMLElement) {
  const focusableElements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  }
  
  container.addEventListener('keydown', handleKeyDown);
  firstElement?.focus();
  
  return () => container.removeEventListener('keydown', handleKeyDown);
}

/**
 * Announce message to screen readers via live region
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement is made
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Generate unique IDs for aria-labelledby/aria-describedby
 */
let idCounter = 0;
export function generateA11yId(prefix: string = 'a11y'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Check if an element is visible and focusable
 */
export function isElementFocusable(element: HTMLElement): boolean {
  if (element.hidden || element.getAttribute('aria-hidden') === 'true') {
    return false;
  }
  
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }
  
  const tabIndex = element.getAttribute('tabindex');
  if (tabIndex && parseInt(tabIndex) < 0) {
    return false;
  }
  
  return true;
}

/**
 * Format text for screen readers (e.g., numbers, dates)
 */
export function formatForScreenReader(value: string | number, type: 'currency' | 'date' | 'phone' | 'number'): string {
  switch (type) {
    case 'currency':
      return `${value} dollars`;
    case 'date':
      return new Date(value as string).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'phone':
      return String(value).replace(/(\d{3})(\d{3})(\d{4})/, '$1, $2, $3');
    case 'number':
      return new Intl.NumberFormat('en-US').format(Number(value));
    default:
      return String(value);
  }
}

/**
 * Get appropriate aria-label for common actions
 */
export function getActionLabel(action: string, target?: string): string {
  const labels: Record<string, string> = {
    edit: `Edit ${target || 'item'}`,
    delete: `Delete ${target || 'item'}`,
    view: `View ${target || 'item'} details`,
    close: 'Close dialog',
    save: 'Save changes',
    cancel: 'Cancel and close',
    submit: 'Submit form',
    search: 'Search',
    filter: 'Filter results',
    sort: `Sort by ${target || 'column'}`,
    expand: `Expand ${target || 'section'}`,
    collapse: `Collapse ${target || 'section'}`,
  };
  
  return labels[action] || action;
}

/**
 * Color contrast checker - WCAG AA requires 4.5:1 for normal text
 */
export function checkColorContrast(foreground: string, background: string): {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
} {
  function getLuminance(hex: string): number {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = rgb & 0xff;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }
  
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    passesAA: ratio >= 4.5,
    passesAAA: ratio >= 7,
  };
}
