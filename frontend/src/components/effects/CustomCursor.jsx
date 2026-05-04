import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const pos     = useRef({ x: -200, y: -200 });
  const ring    = useRef({ x: -200, y: -200 });
  const [visible, setVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Only on non-touch (pointer: fine = mouse)
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot   = dotRef.current;
    const ringEl = ringRef.current;
    if (!dot || !ringEl) return;

    let animId;

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      setVisible(true);
    };
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    const setHover = (v) => () => setIsHovering(v);
    const interactable = 'button, a, input, select, textarea, [role="button"], label';

    const attachHover = () => {
      document.querySelectorAll(interactable).forEach(el => {
        el.addEventListener('mouseenter', setHover(true));
        el.addEventListener('mouseleave', setHover(false));
      });
    };
    attachHover();

    const obs = new MutationObserver(attachHover);
    obs.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      dot.style.transform = `translate(${pos.current.x - 6}px, ${pos.current.y - 6}px)`;

      ring.current.x = lerp(ring.current.x, pos.current.x, 0.1);
      ring.current.y = lerp(ring.current.y, pos.current.y, 0.1);
      ringEl.style.transform = `translate(${ring.current.x - 20}px, ${ring.current.y - 20}px)`;

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      obs.disconnect();
    };
  }, []);

  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null;

  return (
    <>
      {/* ✦ Star dot — 4-pointed sparkle shape */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 12, height: 12,
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.15s, transform 0.05s',
          willChange: 'transform',
        }}
      >
        {/* SVG 4-pointed star */}
        <svg viewBox="0 0 12 12" width="12" height="12" style={{ overflow: 'visible' }}>
          <defs>
            <radialGradient id="starGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" />
              <stop offset="50%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#a855f7" />
            </radialGradient>
          </defs>
          {/* 4-pointed star: two overlapping rotated rectangles */}
          <path
            d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z"
            fill="url(#starGrad)"
            filter="url(#glow)"
          />
          <defs>
            <filter id="glow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>

      {/* Trailing circle ring — lags behind */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: isHovering ? 48 : 40,
          height: isHovering ? 48 : 40,
          borderRadius: '50%',
          border: `1.5px solid ${isHovering ? 'rgba(168,85,247,0.7)' : 'rgba(244,114,182,0.55)'}`,
          background: isHovering ? 'rgba(168,85,247,0.06)' : 'transparent',
          pointerEvents: 'none',
          zIndex: 9998,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.15s, width 0.3s ease, height 0.3s ease, border-color 0.3s, background 0.3s',
          willChange: 'transform',
        }}
      />
    </>
  );
}
