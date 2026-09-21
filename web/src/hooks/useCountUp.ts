import { useEffect, useRef, useState } from 'react';

/**
 * Counts from 0 to `target` once the element enters the viewport.
 * Uses an eased rAF loop rather than a timer so it stays smooth and
 * always lands exactly on the target value.
 */
export function useCountUp(target: number, decimals = 0, duration = 1600) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const run = () => {
      if (started.current) return;
      started.current = true;

      if (prefersReduced) {
        setValue(target);
        return;
      }

      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        // easeOutExpo — fast out of the gate, gentle landing
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        setValue(Number((target * eased).toFixed(decimals)));
        if (t < 1) requestAnimationFrame(tick);
        else setValue(target);
      };
      requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) {
      run();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          run();
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, decimals, duration]);

  return { ref, value };
}
