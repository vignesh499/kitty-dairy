import { useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

const PARTICLE_COUNT = 28;

function randomBetween(a, b) { return a + Math.random() * (b - a); }

export default function ParticleBackground() {
  const canvasRef = useRef(null);
  const { user } = useAuth();
  const isDark = user?.preferences?.theme === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width  = canvas.width  = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let mouse  = { x: width / 2, y: height / 2 };
    let animId;

    // Color palette matches theme
    const colors = isDark
      ? ['rgba(216,180,254,', 'rgba(244,114,182,', 'rgba(192,132,252,', 'rgba(249,168,212,']
      : ['rgba(244,114,182,', 'rgba(192,132,252,', 'rgba(249,168,212,', 'rgba(216,180,254,'];

    class Particle {
      constructor() { this.reset(true); }

      reset(initial = false) {
        this.x     = randomBetween(0, width);
        this.y     = initial ? randomBetween(0, height) : height + 20;
        this.size  = randomBetween(2, 5);
        this.speed = randomBetween(0.3, 0.9);
        this.drift = randomBetween(-0.3, 0.3);
        this.alpha = randomBetween(0.25, 0.65);
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.pulse = randomBetween(0, Math.PI * 2); // phase offset for glow pulse
      }

      update() {
        this.pulse += 0.02;
        const glow  = Math.sin(this.pulse) * 0.15; // ±15% glow pulse

        // Gentle mouse repulsion on desktop
        const dx  = this.x - mouse.x;
        const dy  = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          this.x += (dx / dist) * 0.6;
          this.y += (dy / dist) * 0.6;
        }

        this.x += this.drift;
        this.y -= this.speed;

        if (this.y < -20) this.reset();
      }

      draw() {
        const a = Math.max(0, Math.min(1, this.alpha + Math.sin(this.pulse) * 0.15));
        // Glow
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size * 3
        );
        gradient.addColorStop(0,   `${this.color}${a})`);
        gradient.addColorStop(0.5, `${this.color}${a * 0.4})`);
        gradient.addColorStop(1,   `${this.color}0)`);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color}${a})`;
        ctx.fill();
      }
    }

    const particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());

    const onMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onResize    = () => {
      width  = canvas.width  = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize',    onResize);

    const loop = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => { p.update(); p.draw(); });
      animId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize',    onResize);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: isDark ? 0.7 : 0.5 }}
    />
  );
}
