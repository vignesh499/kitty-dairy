import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef   = useRef(null);
  const ringRef  = useRef(null);
  const pos      = useRef({ x: -100, y: -100 });
  const ring     = useRef({ x: -100, y: -100 });
  const hovering = useRef(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only activate on non-touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot  = dotRef.current;
    const ringEl = ringRef.current;
    if (!dot || !ringEl) return;

    let animId;

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);

    const onHoverIn = () => {
      hovering.current = true;
      ringEl.style.width  = '44px';
      ringEl.style.height = '44px';
      ringEl.style.borderColor = 'rgba(168,85,247,0.7)';
      ringEl.style.backgroundColor = 'rgba(168,85,247,0.08)';
    };
    const onHoverOut = () => {
      hovering.current = false;
      ringEl.style.width  = '32px';
      ringEl.style.height = '32px';
      ringEl.style.borderColor = 'rgba(244,114,182,0.6)';
      ringEl.style.backgroundColor = 'transparent';
    };

    // Track interactive elements
    const interactiveSelector = 'button, a, input, select, textarea, [role="button"], label[for]';
    const addListeners = () => {
      document.querySelectorAll(interactiveSelector).forEach(el => {
        el.addEventListener('mouseenter', onHoverIn);
        el.addEventListener('mouseleave', onHoverOut);
      });
    };
    addListeners();

    // Re-scan on DOM changes
    const observer = new MutationObserver(addListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('mousemove',  onMove);
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mouseleave', onLeave);

    const lerp = (a, b, t) => a + (b - a) * t;

    const animate = () => {
      // Dot snaps instantly
      dot.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`;

      // Ring lags behind with easing
      ring.current.x = lerp(ring.current.x, pos.current.x, 0.12);
      ring.current.y = lerp(ring.current.y, pos.current.y, 0.12);
      ringEl.style.transform = `translate(${ring.current.x - 16}px, ${ring.current.y - 16}px)`;

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove',  onMove);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseleave', onLeave);
      observer.disconnect();
    };
  }, []);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null;

  return (
    <>
      {/* Tiny solid dot — snaps to cursor */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 8, height: 8,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f472b6, #a855f7)',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.2s',
          boxShadow: '0 0 8px 2px rgba(244,114,182,0.6)',
          willChange: 'transform',
        }}
      />
      {/* Lagging ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 32, height: 32,
          borderRadius: '50%',
          border: '1.5px solid rgba(244,114,182,0.6)',
          pointerEvents: 'none',
          zIndex: 9998,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.2s, width 0.25s ease, height 0.25s ease, border-color 0.25s ease, background-color 0.25s ease',
          willChange: 'transform',
        }}
      />
    </>
  );
}
