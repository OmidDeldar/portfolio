import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  pulse: number;
}

/**
 * The living network behind the page: drifting nodes that link up when they
 * get close, with the cursor pushing them around. Rendered on a single
 * canvas at device pixel ratio, capped by node count so it stays cheap.
 */
export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let nodes: Node[] = [];
    let raf = 0;

    const pointer = { x: -9999, y: -9999, active: false };

    /** Read the live accent colour so the `theme` command restyles the canvas too. */
    const accent = () =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim() ||
      '168, 85, 247';

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Density scales with area, but never past 110 nodes.
      const count = Math.min(110, Math.floor((width * height) / 15000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.6 + 0.7,
        pulse: Math.random() * Math.PI * 2,
      }));
    };

    const LINK_DISTANCE = 148;

    const frame = () => {
      const rgb = accent();
      ctx.clearRect(0, 0, width, height);

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.02;

        // Cursor repulsion — nodes swim away from the pointer.
        if (pointer.active) {
          const dx = node.x - pointer.x;
          const dy = node.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130 && dist > 0.1) {
            const push = (130 - dist) / 130;
            node.x += (dx / dist) * push * 2.4;
            node.y += (dy / dist) * push * 2.4;
          }
        }

        // Wrap around the edges rather than bouncing — no visible walls.
        if (node.x < -20) node.x = width + 20;
        if (node.x > width + 20) node.x = -20;
        if (node.y < -20) node.y = height + 20;
        if (node.y > height + 20) node.y = -20;
      }

      // Links first, so nodes render on top of them.
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist > LINK_DISTANCE) continue;

          const alpha = (1 - dist / LINK_DISTANCE) * 0.36;
          ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const node of nodes) {
        const glow = 0.55 + Math.sin(node.pulse) * 0.3;
        ctx.fillStyle = `rgba(${rgb}, ${glow})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // A soft halo that follows the cursor.
      if (pointer.active) {
        const halo = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          170,
        );
        halo.addColorStop(0, `rgba(${rgb}, 0.1)`);
        halo.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.fillStyle = halo;
        ctx.fillRect(pointer.x - 170, pointer.y - 170, 340, 340);
      }

      raf = requestAnimationFrame(frame);
    };

    const onPointerMove = (e: PointerEvent) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    };

    resize();

    if (reduced) {
      // Draw one static frame and stop — respect the preference, keep the look.
      const rgb = accent();
      ctx.clearRect(0, 0, width, height);
      for (const node of nodes) {
        ctx.fillStyle = `rgba(${rgb}, 0.5)`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      raf = requestAnimationFrame(frame);
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      document.addEventListener('pointerleave', onPointerLeave);
    }

    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="bg-canvas" aria-hidden="true" />
      <div className="grid-floor" aria-hidden="true" />
      <div className="bg-fx" aria-hidden="true" />
    </>
  );
}
