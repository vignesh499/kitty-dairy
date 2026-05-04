export const CURSOR_STYLES = [
  { id: 'star',      label: '✦ Star'      },
  { id: 'heart',     label: '♥ Heart'     },
  { id: 'dot',       label: '● Dot'       },
  { id: 'diamond',   label: '◆ Diamond'   },
  { id: 'moon',      label: '🌙 Moon'     },
  { id: 'snowflake', label: '❄ Snowflake' },
  { id: 'flower',    label: '✿ Flower'    },
  { id: 'arrow',     label: '➤ Arrow'     },
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

/**
 * CursorSVG — renders one of the 8 cursor shapes.
 * `ns` = unique namespace prefix so filter/gradient IDs never clash
 *  when the same shape appears in both the live cursor and the Settings preview.
 */
export function CursorSVG({ styleId, color, size = 16, ns = 'cur' }) {
  const fId  = `${ns}-glow-${styleId}`;   // unique filter id
  const gId  = `${ns}-grad-${styleId}`;   // unique gradient id
  const fill = `url(#${gId})`;
  const filt = `url(#${fId})`;

  const defs = (
    <defs>
      <filter id={fId} x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="1.2" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <radialGradient id={gId} cx="50%" cy="35%" r="60%">
        <stop offset="0%"   stopColor="#fff"  stopOpacity="0.9" />
        <stop offset="60%"  stopColor={color} stopOpacity="1"   />
        <stop offset="100%" stopColor={color} stopOpacity="0.75" />
      </radialGradient>
    </defs>
  );

  const svgProps = { width: size, height: size, viewBox: '0 0 16 16', overflow: 'visible' };

  switch (styleId) {
    case 'star':
      return <svg {...svgProps}>{defs}<path d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z" fill={fill} filter={filt} /></svg>;
    case 'heart':
      return <svg {...svgProps}>{defs}<path d="M8 14 C8 14 1 9.5 1 5 C1 2.5 3 1 5 1 C6.5 1 8 2.5 8 2.5 C8 2.5 9.5 1 11 1 C13 1 15 2.5 15 5 C15 9.5 8 14 8 14Z" fill={fill} filter={filt} /></svg>;
    case 'dot':
      return <svg {...svgProps}>{defs}<circle cx="8" cy="8" r="7" fill={fill} filter={filt} /></svg>;
    case 'diamond':
      return <svg {...svgProps}>{defs}<path d="M8 0 L16 8 L8 16 L0 8 Z" fill={fill} filter={filt} /></svg>;
    case 'moon':
      return <svg {...svgProps}>{defs}<path d="M11 2 A7 7 0 1 0 11 14 A5 5 0 1 1 11 2Z" fill={fill} filter={filt} /></svg>;
    case 'snowflake':
      return (
        <svg {...svgProps}>{defs}
          <g fill={fill} filter={filt}>
            <rect x="7" y="0" width="2" height="16" rx="1" />
            <rect x="0" y="7" width="16" height="2" rx="1" />
            <rect x="2.1" y="2.1" width="2" height="11.8" rx="1" transform="rotate(45 8 8)" />
            <rect x="2.1" y="2.1" width="11.8" height="2" rx="1" transform="rotate(45 8 8)" />
          </g>
        </svg>
      );
    case 'flower':
      return (
        <svg {...svgProps}>{defs}
          <g fill={fill} filter={filt}>
            <ellipse cx="8" cy="3.5" rx="2.5" ry="3.5" />
            <ellipse cx="8" cy="12.5" rx="2.5" ry="3.5" />
            <ellipse cx="3.5" cy="8" rx="3.5" ry="2.5" />
            <ellipse cx="12.5" cy="8" rx="3.5" ry="2.5" />
            <circle cx="8" cy="8" r="3" fill="#fff" opacity="0.5" />
          </g>
        </svg>
      );
    case 'arrow':
      return <svg {...svgProps}>{defs}<path d="M2 1 L15 8 L9 9.5 L7 15 Z" fill={fill} filter={filt} /></svg>;
    default:
      return null;
  }
}
