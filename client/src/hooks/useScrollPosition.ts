import { useState, useEffect } from 'react';

/**
 * Hook to track window scroll position with passive event listener and requestAnimationFrame throttling.
 * Used for navbar compression and scroll-linked UI triggers.
 */
export function useScrollPosition(): { scrollY: number; scrollX: number } {
  const [position, setPosition] = useState({
    scrollY: typeof window !== 'undefined' ? window.scrollY : 0,
    scrollX: typeof window !== 'undefined' ? window.scrollX : 0,
  });

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setPosition({
            scrollY: window.scrollY,
            scrollX: window.scrollX,
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return position;
}
