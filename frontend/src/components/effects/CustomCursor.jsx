import { useEffect, useRef, useState } from 'react';
import { CursorSVG, CURSOR_COLORS, loadCursorPrefs, CURSOR_PREF_KEY } from './cursorConfig';

export default function CustomCursor() {
  const containerRef = useRef(null);
  const pos          = useRef({ x: -200, y: -200 });
  const [visible,    setVisible]    = useState(false);
  const [prefs,      setPrefs]      = useState(loadCursorPrefs);

  // Listen for live preference changes from Settings
  useEffect(() => {
    const handler = (e) => setPrefs(e.detail);
    window.addEventListener('kitty-cursor-change', handler);
    return () => window.removeEventListener('kitty-cursor-change', handler);
  }, []);

  useEffect(() => {
    // Only on mouse-driven devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const el = containerRef.current;
    if (!el) return;

    let animId;

    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      setVisible(true);
    };
    const onLeave  = () => setVisible(false);
    const onEnter  = () => setVisible(true);

    window.addEventListener('mousemove',        onMove);
    document.addEventListener('mouseleave',     onLeave);
    document.addEventListener('mouseenter',     onEnter);

    const animate = () => {
      el.style.transform = `translate(${pos.current.x - 8}px, ${pos.current.y - 8}px)`;
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove',    onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
    };
  }, []);

  // Don't render on touch devices
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) return null;

  const color = CURSOR_COLORS.find(c => c.id === prefs.colorId)?.hex ?? '#f472b6';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.15s',
        willChange: 'transform',
      }}
    >
      <CursorSVG styleId={prefs.style} color={color} size={20} />
    </div>
  );
}
