/**
 * Cursor shape SVG renderers — no ring, just the shape itself.
 * Each returns a sized SVG element.
 */

export const CURSOR_STYLES = [
  { id: 'star',      label: '✦ Star',      emoji: '✦' },
  { id: 'heart',     label: '♥ Heart',     emoji: '♥' },
  { id: 'dot',       label: '● Dot',       emoji: '●' },
  { id: 'diamond',   label: '◆ Diamond',   emoji: '◆' },
  { id: 'moon',      label: '🌙 Moon',     emoji: '🌙' },
  { id: 'snowflake', label: '❄ Snowflake', emoji: '❄' },
  { id: 'flower',    label: '✿ Flower',    emoji: '✿' },
  { id: 'arrow',     label: '➤ Arrow',     emoji: '➤' },
];

export const CURSOR_COLORS = [
  { id: 'pink',     label: 'Pink',     hex: '#f472b6' },
  { id: 'purple',   label: 'Purple',   hex: '#a855f7' },
  { id: 'lavender', label: 'Lavender', hex: '#c084fc' },
  { id: 'blue',     label: 'Blue',     hex: '#60a5fa' },
  { id: 'cyan',     label: 'Cyan',     hex: '#22d3ee' },
  { id: 'rose',     label: 'Rose',     hex: '#fb7185' },
  { id: 'gold',     label: 'Gold',     hex: '#fbbf24' },
  { id: 'mint',     label: 'Mint',     hex: '#34d399' },
  { id: 'white',    label: 'White',    hex: '#f8fafc' },
  { id: 'coral',    label: 'Coral',    hex: '#fb923c' },
];

export const CURSOR_PREF_KEY = 'kitty_cursor_prefs';

export function loadCursorPrefs() {
  try {
    const raw = localStorage.getItem(CURSOR_PREF_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return { style: 'star', colorId: 'pink' };
}

export function saveCursorPrefs(prefs) {
  localStorage.setItem(CURSOR_PREF_KEY, JSON.stringify(prefs));
  window.dispatchEvent(new CustomEvent('kitty-cursor-change', { detail: prefs }));
}

/** Returns the SVG JSX for a given style id and hex color */
export function CursorSVG({ styleId, color, size = 16 }) {
  const half = size / 2;
  const glow = (
    <defs>
      <filter id={`cg-${styleId}`} x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="1.2" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <radialGradient id={`cgrad-${styleId}`} cx="50%" cy="35%" r="60%">
        <stop offset="0%"   stopColor="#fff"  stopOpacity="0.9" />
        <stop offset="60%"  stopColor={color} stopOpacity="1"   />
        <stop offset="100%" stopColor={color} stopOpacity="0.7" />
      </radialGradient>
    </defs>
  );

  const fill   = `url(#cgrad-${styleId})`;
  const filter = `url(#cg-${styleId})`;

  switch (styleId) {
    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" overflow="visible">
          {glow}
          <path
            d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z"
            fill={fill} filter={filter}
          />
        </svg>
      );
    case 'heart':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" overflow="visible">
          {glow}
          <path
            d="M8 14 C8 14 1 9.5 1 5 C1 2.5 3 1 5 1 C6.5 1 8 2.5 8 2.5 C8 2.5 9.5 1 11 1 C13 1 15 2.5 15 5 C15 9.5 8 14 8 14Z"
            fill={fill} filter={filter}
          />
        </svg>
      );
    case 'dot':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" overflow="visible">
          {glow}
          <circle cx="8" cy="8" r="6" fill={fill} filter={filter} />
        </svg>
      );
    case 'diamond':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" overflow="visible">
          {glow}
          <path d="M8 0 L16 8 L8 16 L0 8 Z" fill={fill} filter={filter} />
        </svg>
      );
    case 'moon':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" overflow="visible">
          {glow}
          <path
            d="M11 2 A7 7 0 1 0 11 14 A5 5 0 1 1 11 2Z"
            fill={fill} filter={filter}
          />
        </svg>
      );
    case 'snowflake':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" overflow="visible">
          {glow}
          <g fill={fill} filter={filter}>
            <rect x="7" y="0" width="2" height="16" rx="1" />
            <rect x="0" y="7" width="16" height="2" rx="1" />
            <rect x="2.1" y="2.1" width="2" height="11.8" rx="1" transform="rotate(45 8 8)" />
            <rect x="2.1" y="2.1" width="11.8" height="2" rx="1" transform="rotate(45 8 8)" />
          </g>
        </svg>
      );
    case 'flower':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" overflow="visible">
          {glow}
          <g fill={fill} filter={filter}>
            <ellipse cx="8" cy="3.5" rx="2.5" ry="3.5" />
            <ellipse cx="8" cy="12.5" rx="2.5" ry="3.5" />
            <ellipse cx="3.5" cy="8" rx="3.5" ry="2.5" />
            <ellipse cx="12.5" cy="8" rx="3.5" ry="2.5" />
            <circle cx="8" cy="8" r="3" fill="#fff" opacity="0.6" />
          </g>
        </svg>
      );
    case 'arrow':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" overflow="visible">
          {glow}
          <path
            d="M2 2 L14 8 L8 9 L6 14 Z"
            fill={fill} filter={filter}
          />
        </svg>
      );
    default:
      return null;
  }
}
