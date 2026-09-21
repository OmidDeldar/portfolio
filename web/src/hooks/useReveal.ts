import { useEffect, useRef } from 'react';

/**
 * Adds `is-in` to the element the first time it scrolls into view, which
 * triggers the CSS reveal transition. One observer per element, disconnected
 * as soon as it fires — no scroll listeners, no layout thrash.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(delay = 0) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.setProperty('--reveal-delay', `${delay}ms`);

    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-in');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-in');
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return ref;
}
