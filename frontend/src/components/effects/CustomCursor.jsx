import { useEffect, useRef, useState } from 'react';
import { CursorSVG, CURSOR_COLORS, loadCursorPrefs, CURSOR_PREF_KEY } from './cursorConfig';

export default function CustomCursor() {
  const wrapRef = useRef(null);
  // prefs is the ONLY React state — controls which SVG to render
  const [prefs, setPrefs] = useState(loadCursorPrefs);

  // ── Effect 1: Listen for preference changes (Settings → Cursor) ──
  useEffect(() => {
    // Custom event fired by Settings page immediately on change
    const onCustom = (e) => setPrefs({ ...e.detail });

    // Storage event fires when another tab or when localStorage is updated
    // This is a reliable fallback across re-mounts
    const onStorage = (e) => {
      if (e.key === CURSOR_PREF_KEY) {
        try { setPrefs(JSON.parse(e.newValue)); } catch (_) {}
      }
    };

    window.addEventListener('kitty-cursor-change', onCustom);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('kitty-cursor-change', onCustom);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // ── Effect 2: Mouse tracking — fully DOM-based, no React state ──
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const el = wrapRef.current;
    if (!el) return;

    // Local variables — never touch React state here
    let x = -100, y = -100;
    let shown = false;
    let rafId;

    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
      // Show on first move — direct DOM manipulation, no setState
      if (!shown) {
        el.style.opacity = '1';
        shown = true;
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });

    // Continuous RAF loop — direct style update, no React involvement
    const tick = () => {
      el.style.transform = `translate(${x - 10}px, ${y - 10}px)`;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
    };
  }, []); // Runs once, manages its own state via closures

  // Don't render on touch/mobile
  if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  const color = CURSOR_COLORS.find(c => c.id === prefs.colorId)?.hex ?? '#f472b6';

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 99999,
        opacity: 0,           // starts hidden, shown via direct DOM on first mousemove
        willChange: 'transform',
      }}
    >
      <CursorSVG styleId={prefs.style} color={color} size={22} ns="live" />
    </div>
  );
}
