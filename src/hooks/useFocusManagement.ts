import { useEffect, useRef, useCallback } from 'react';

/**
 * Focus Management Hook - WCAG 2.1 AA Compliance
 * Manages focus for dialogs, modals, and dynamic content
 */

/**
 * Trap focus within a container element
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Save currently focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstElement?.focus();

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

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      // Restore previous focus when trap is deactivated
      previousFocusRef.current?.focus();
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Return focus to a specific element when component unmounts
 */
export function useReturnFocus() {
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    returnFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    returnFocusRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      returnFocusRef.current?.focus();
    };
  }, []);

  return { saveFocus, restoreFocus };
}

/**
 * Focus an element on mount
 */
export function useAutoFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    // Small delay to ensure element is rendered
    const timer = setTimeout(() => {
      ref.current?.focus();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return ref;
}

/**
 * Roving tabindex for keyboard navigation in lists/grids
 */
export function useRovingTabIndex<T extends HTMLElement>(
  items: T[],
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    loop?: boolean;
  } = {}
) {
  const { orientation = 'vertical', loop = true } = options;
  const currentIndex = useRef(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isVertical = orientation === 'vertical' || orientation === 'both';
      const isHorizontal = orientation === 'horizontal' || orientation === 'both';

      let newIndex = currentIndex.current;

      if ((e.key === 'ArrowDown' && isVertical) || (e.key === 'ArrowRight' && isHorizontal)) {
        e.preventDefault();
        newIndex = currentIndex.current + 1;
        if (newIndex >= items.length) {
          newIndex = loop ? 0 : items.length - 1;
        }
      } else if ((e.key === 'ArrowUp' && isVertical) || (e.key === 'ArrowLeft' && isHorizontal)) {
        e.preventDefault();
        newIndex = currentIndex.current - 1;
        if (newIndex < 0) {
          newIndex = loop ? items.length - 1 : 0;
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        newIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        newIndex = items.length - 1;
      }

      if (newIndex !== currentIndex.current) {
        currentIndex.current = newIndex;
        items[newIndex]?.focus();
      }
    },
    [items, orientation, loop]
  );

  return { handleKeyDown, currentIndex: currentIndex.current };
}
