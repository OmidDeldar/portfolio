import { useEffect, useRef } from 'react';
import './matrix.css';

const GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEFomiddeldar</>{}[]#$%&';

/**
 * Full-screen glyph rain, triggered by the `matrix` terminal command.
 * Runs for `duration` ms, then fades itself out and calls `onEnd`.
 */
export function MatrixRain({ onEnd, duration = 7000 }: { onEnd: () => void; duration?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let columns = 0;
    let drops: number[] = [];
    const fontSize = 16;

    const accent = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#a855f7';

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.ceil(canvas.width / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * -60);
    };

    resize();

    let last = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      // Throttle to ~24fps — the classic effect looks better slightly choppy.
      if (now - last < 42) return;
      last = now;

      ctx.fillStyle = 'rgba(5, 3, 8, 0.09)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Leading glyph is bright white, the tail takes the theme colour.
        ctx.fillStyle = Math.random() > 0.975 ? '#ffffff' : accent();
        ctx.fillText(glyph, x, y);

        if (y > canvas.height && Math.random() > 0.973) drops[i] = 0;
        drops[i]++;
      }
    };

    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', resize);

    const fade = setTimeout(() => wrapRef.current?.classList.add('is-fading'), duration - 700);
    const stop = setTimeout(onEnd, duration);
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEnd();
    };
    window.addEventListener('keydown', escape);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fade);
      clearTimeout(stop);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', escape);
    };
  }, [onEnd, duration]);

  return (
    <div className="matrix" ref={wrapRef} aria-hidden="true">
      <canvas ref={canvasRef} />
      <p className="matrix-hint">esc to exit</p>
    </div>
  );
}
