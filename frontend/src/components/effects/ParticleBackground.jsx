import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * AnimatedMeshGradient
 * ─────────────────────────────────────────────────────────────────────
 * Renders 6 large soft colour blobs on a canvas that slowly drift and
 * blend together, creating a living "mesh gradient" background.
 * Each blob follows a smooth sinusoidal orbit so the motion is organic
 * and never feels mechanical.
 *
 * Works on top of the page's existing CSS background — it adds depth
 * without replacing the glassmorphism / particle effects that layer above it.
 */

export default function ParticleBackground() {
  const canvasRef = useRef(null);
  const { user }  = useAuth();
  const isDark    = user?.preferences?.theme === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let animId;
    let t = 0;

    // ── Blob palette ─────────────────────────────────────────────────
    // Light theme: pastel pink / lavender / peach / lilac
    // Dark  theme: deep rose / violet / indigo / plum
    const BLOBS_LIGHT = [
      { r: 255, g: 182, b: 218 },  // rose pink
      { r: 200, g: 162, b: 255 },  // soft purple
      { r: 255, g: 213, b: 178 },  // peach
      { r: 178, g: 220, b: 255 },  // sky blue
      { r: 230, g: 180, b: 255 },  // lilac
      { r: 255, g: 230, b: 178 },  // warm cream
    ];
    const BLOBS_DARK = [
      { r: 180, g:  60, b: 120 },  // deep rose
      { r: 100, g:  40, b: 180 },  // violet
      { r:  60, g:  20, b: 140 },  // indigo
      { r: 140, g:  40, b: 180 },  // plum
      { r: 200, g:  60, b: 100 },  // magenta
      { r:  80, g:  60, b: 200 },  // cobalt
    ];
    const palette = isDark ? BLOBS_DARK : BLOBS_LIGHT;

    // ── Each blob has its own orbit parameters ────────────────────────
    const blobs = palette.map((col, i) => ({
      col,
      // base position (spread across canvas)
      cx: W * (0.15 + (i % 3) * 0.35),
      cy: H * (0.2  + Math.floor(i / 3) * 0.55),
      // orbit radii — big so they sweep a lot of screen
      rx: W * (0.22 + 0.08 * (i % 2)),
      ry: H * (0.18 + 0.07 * (i % 3)),
      // individual speed & phase so no two blobs sync
      speed: 0.00025 + i * 0.000055,
      phase: (Math.PI * 2 * i) / palette.length,
      // blob size — huge, so they overlap and blend
      radius: Math.min(W, H) * (0.38 + 0.08 * (i % 3)),
    }));

    // ── Resize handler ────────────────────────────────────────────────
    const onResize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      blobs.forEach((b, i) => {
        b.cx     = W * (0.15 + (i % 3) * 0.35);
        b.cy     = H * (0.2  + Math.floor(i / 3) * 0.55);
        b.rx     = W * (0.22 + 0.08 * (i % 2));
        b.ry     = H * (0.18 + 0.07 * (i % 3));
        b.radius = Math.min(W, H) * (0.38 + 0.08 * (i % 3));
      });
    };
    window.addEventListener('resize', onResize);

    // ── Render loop ───────────────────────────────────────────────────
    const loop = () => {
      t += 1;
      ctx.clearRect(0, 0, W, H);

      // Draw each blob as a large radial gradient ellipse
      blobs.forEach(b => {
        const angle = t * b.speed + b.phase;
        const x = b.cx + Math.cos(angle)           * b.rx;
        const y = b.cy + Math.sin(angle * 0.73)    * b.ry; // slightly different Y period → figure-8 feel

        const { r, g, bl: blue = b.col.b } = { ...b.col, bl: b.col.b };

        const grad = ctx.createRadialGradient(x, y, 0, x, y, b.radius);
        if (isDark) {
          grad.addColorStop(0,   `rgba(${r},${g},${blue}, 0.55)`);
          grad.addColorStop(0.45,`rgba(${r},${g},${blue}, 0.18)`);
          grad.addColorStop(1,   `rgba(${r},${g},${blue}, 0)`);
        } else {
          grad.addColorStop(0,   `rgba(${r},${g},${blue}, 0.52)`);
          grad.addColorStop(0.45,`rgba(${r},${g},${blue}, 0.16)`);
          grad.addColorStop(1,   `rgba(${r},${g},${blue}, 0)`);
        }

        ctx.beginPath();
        ctx.ellipse(x, y, b.radius, b.radius * 0.85, angle * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      animId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 0,
        opacity: isDark ? 0.85 : 0.72,
        // Smooth blur blends the hard blob edges into a true "mesh" feel
        filter: 'blur(48px)',
        // hardware-accelerate the canvas
        willChange: 'transform',
      }}
    />
  );
}
