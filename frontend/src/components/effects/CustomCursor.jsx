import { useEffect, useRef, useState } from 'react';
import { CursorSVG, CURSOR_COLORS, loadCursorPrefs } from './cursorConfig';

export default function CustomCursor() {
  const cursorRef = useRef(null);
  const posRef    = useRef({ x: -100, y: -100 });
  const rafRef    = useRef(null);
  const [ready, setReady]  = useState(false);
  const [prefs, setPrefs]  = useState(loadCursorPrefs);

  // Live-update when user changes cursor in Settings
  useEffect(() => {
    const handler = (e) => setPrefs(e.detail);
    window.addEventListener('kitty-cursor-change', handler);
    return () => window.removeEventListener('kitty-cursor-change', handler);
  }, []);

  useEffect(() => {
    // Touch devices don't need a custom cursor
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const el = cursorRef.current;
    if (!el) return;

    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      // Show cursor on first move
      if (!ready) setReady(true);
    };

    window.addEventListener('mousemove', onMove, { passive: true });

    // RAF loop — always runs, just moves the element
    const tick = () => {
      el.style.transform = `translate(${posRef.current.x - 10}px, ${posRef.current.y - 10}px)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Skip rendering entirely on touch devices (SSR-safe check)
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  const color = CURSOR_COLORS.find(c => c.id === prefs.colorId)?.hex ?? '#f472b6';

  return (
    <div
      ref={cursorRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 99999,           // above everything including modals
        opacity: ready ? 1 : 0, // invisible until first mouse move
        willChange: 'transform',
        // No transition on transform — we want instant tracking
      }}
    >
      {/* ns="live" keeps these SVG IDs separate from the Settings preview */}
      <CursorSVG styleId={prefs.style} color={color} size={22} ns="live" />
    </div>
  );
}
