import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { authAPI, entriesAPI } from '../../api';
import toast from 'react-hot-toast';
import { Palette, Type, Lock, Download, ChevronDown, Check, MousePointer2 } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { useDiary } from '../../context/DiaryContext';
import { applyUserTheme } from '../../components/layout/AppLayout';
import { CURSOR_STYLES, CURSOR_COLORS, CursorSVG, loadCursorPrefs, saveCursorPrefs } from '../../components/effects/cursorConfig';

/* ─────────────────────────────────────────────────────────────
   Static data
───────────────────────────────────────────────────────────── */
const THEMES = [
  { id: 'pastel',  label: 'Pastel 🌸',  bg: 'linear-gradient(135deg,#fce4ec,#f3e5f5,#e8eaf6)', text: '#7e22ce' },
  { id: 'dark',    label: 'Dark 🌙',    bg: 'linear-gradient(135deg,#1e1b2e,#2d1b3e,#1a1a2e)', text: '#e8d5ff' },
  { id: 'floral',  label: 'Floral 🌺',  bg: 'linear-gradient(135deg,#fce4ec,#fff8e1,#f1f8e9)', text: '#7e22ce' },
  { id: 'cute',    label: 'Cute 💕',    bg: 'linear-gradient(135deg,#ffe4e6,#fce7f3,#f5d0fe)', text: '#7e22ce' },
  { id: 'minimal', label: 'Minimal ✨', bg: 'linear-gradient(135deg,#fafafa,#f5f5f5)',          text: '#7e22ce' },
];

const FONTS = [
  { label: 'Nunito',           value: 'Nunito, sans-serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'Dancing Script',   value: '"Dancing Script", cursive' },
  { label: 'Lato',             value: 'Lato, sans-serif' },
  { label: 'Poppins',          value: 'Poppins, sans-serif' },
  { label: 'Merriweather',     value: 'Merriweather, serif' },
  { label: 'Pacifico',         value: 'Pacifico, cursive' },
  { label: 'Quicksand',        value: 'Quicksand, sans-serif' },
  { label: 'Caveat',           value: 'Caveat, cursive' },
  { label: 'Indie Flower',     value: '"Indie Flower", cursive' },
];

const GRADIENTS = [
  { label: 'Sakura Dream',  value: 'linear-gradient(135deg,#fce4ec,#f3e5f5,#e8eaf6)' },
  { label: 'Sunset Glow',   value: 'linear-gradient(135deg,#ffecd2,#fcb69f)' },
  { label: 'Lavender Mist', value: 'linear-gradient(135deg,#a18cd1,#fbc2eb)' },
  { label: 'Cotton Candy',  value: 'linear-gradient(135deg,#f093fb,#f5576c)' },
  { label: 'Peach Cream',   value: 'linear-gradient(135deg,#fccb90,#d57eeb)' },
  { label: 'Minty Fresh',   value: 'linear-gradient(135deg,#84fab0,#8fd3f4)' },
  { label: 'Rose Gold',     value: 'linear-gradient(135deg,#f7971e,#ffd200)' },
  { label: 'Ocean Mist',    value: 'linear-gradient(135deg,#89f7fe,#66a6ff)' },
];

/* ─────────────────────────────────────────────────────────────
   Section – defined OUTSIDE to avoid re-creation on every render
───────────────────────────────────────────────────────────── */
const Section = memo(({ id, title, icon: Icon, children, activeSection, onToggle, isDark }) => {
  const cardCls = isDark
    ? 'bg-white/5 border border-white/10 rounded-2xl shadow-lg mb-4 overflow-hidden'
    : 'bg-white/60 backdrop-blur-sm border border-white/70 rounded-2xl shadow-card mb-4 overflow-hidden';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cardCls}>
      <button
        onClick={() => onToggle(id)}
        className="flex items-center justify-between w-full p-5 sm:p-6"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isDark ? 'bg-white/10' : 'bg-gradient-to-br from-pink-100 to-purple-100'}`}>
            <Icon size={16} className={isDark ? 'text-purple-300' : 'text-pink-500'} />
          </div>
          <h2 className={`text-base sm:text-lg font-semibold font-playfair ${isDark ? 'text-purple-100' : 'text-purple-800'}`}>
            {title}
          </h2>
        </div>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${activeSection === id ? 'rotate-180' : ''} ${isDark ? 'text-purple-300' : 'text-purple-400'}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {activeSection === id && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className={`px-5 sm:px-6 pb-6 border-t ${isDark ? 'border-white/10' : 'border-pink-50'}`}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

/* ─────────────────────────────────────────────────────────────
   PinSection – own local state so typing doesn't re-render parent
───────────────────────────────────────────────────────────── */
const PinSection = memo(({ isDark }) => {
  const [pin,        setPin]        = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const inputCls = isDark
    ? 'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-purple-100 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all'
    : 'input-field';
  const labelCls = isDark ? 'text-purple-200' : 'text-purple-700';
  const subCls   = isDark ? 'text-purple-300' : 'text-purple-500';

  const handleSetPin = async () => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) return toast.error('PIN must be 4 digits!');
    if (pin !== confirmPin) return toast.error('PINs do not match!');
    try {
      await authAPI.setPin(pin);
      toast.success('PIN set successfully! 🔐');
      setPin(''); setConfirmPin('');
    } catch { toast.error('Failed to set PIN.'); }
  };

  return (
    <div className="space-y-4 pt-4">
      <p className={`text-sm ${subCls}`}>Set a 4-digit PIN to protect your diary from prying eyes 👀</p>

      {/* PIN dots display */}
      <div className="flex justify-center gap-4 my-2">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
              pin.length > i
                ? (isDark ? 'bg-purple-400 scale-110' : 'bg-pink-400 scale-110')
                : (isDark ? 'bg-white/20' : 'bg-pink-200')
            }`}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className={`text-sm font-semibold mb-1 ${labelCls}`}>New PIN</p>
          <input
            type="password" inputMode="numeric" maxLength={4}
            placeholder="····" value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className={`${inputCls} text-center text-xl tracking-[0.5em]`}
          />
        </div>
        <div>
          <p className={`text-sm font-semibold mb-1 ${labelCls}`}>Confirm PIN</p>
          <input
            type="password" inputMode="numeric" maxLength={4}
            placeholder="····" value={confirmPin}
            onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className={`${inputCls} text-center text-xl tracking-[0.5em]`}
          />
        </div>
      </div>

      <button onClick={handleSetPin} className="btn-primary w-full">🔐 Set PIN</button>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────
   Main SettingsPage
───────────────────────────────────────────────────────────── */
export default function SettingsPage() {
  const { user, updatePreferences } = useAuth();
  const { entries } = useDiary();

  const prefs = user?.preferences || {};
  const [theme,      setTheme]      = useState(prefs.theme      || 'pastel');
  const [bgType,     setBgType]     = useState(prefs.backgroundType     || 'theme-default');
  const [bgColor,    setBgColor]    = useState(prefs.backgroundColor    || '#fce4ec');
  const [bgGradient, setBgGradient] = useState(prefs.backgroundGradient || GRADIENTS[0].value);
  const [bgImage,    setBgImage]    = useState(prefs.backgroundImage     || '');
  const [fontFamily, setFontFamily] = useState(prefs.fontFamily || 'Nunito, sans-serif');
  const [fontSize,   setFontSize]   = useState(prefs.fontSize   || 16);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('appearance');
  const [cursorPrefs, setCursorPrefs] = useState(loadCursorPrefs);
  const colorPickerRef = useRef(null);

  const isDark   = theme === 'dark';
  const labelCls = isDark ? 'text-purple-200' : 'text-purple-700';
  const subCls   = isDark ? 'text-purple-300' : 'text-purple-500';
  const inputCls = isDark
    ? 'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-purple-100 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all'
    : 'input-field';

  const onToggle = useCallback((id) => setActiveSection(v => v === id ? '' : id), []);

  /* Close colour picker on outside click */
  useEffect(() => {
    const h = (e) => { if (colorPickerRef.current && !colorPickerRef.current.contains(e.target)) setShowColorPicker(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* Live preview — applies theme immediately for the user to see it */
  useEffect(() => {
    applyUserTheme({ theme, backgroundType: bgType, backgroundColor: bgColor, backgroundGradient: bgGradient, backgroundImage: bgImage, fontFamily, fontSize });
  }, [theme, bgType, bgColor, bgGradient, bgImage, fontFamily, fontSize]);

  /* On unmount, snap back to saved prefs so the preview doesn't bleed.
     AppLayout will also re-apply saved prefs on the next route render. */
  useEffect(() => {
    return () => applyUserTheme(user?.preferences || {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onload = () => setBgImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      await updatePreferences({ theme, backgroundType: bgType, backgroundColor: bgColor, backgroundGradient: bgGradient, backgroundImage: bgImage, fontFamily, fontSize });
      toast.success('Preferences saved! 💖');
    } catch { toast.error('Failed to save preferences.'); }
    finally { setSaving(false); }
  };

  const handleExportPDF = async () => {
    setExportLoading(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const { data } = await entriesAPI.getAll();
      doc.setFont('helvetica');
      doc.setFontSize(24); doc.setTextColor(160, 90, 180);
      doc.text("Kitty's Diary 💖", 20, 25);
      doc.setFontSize(10); doc.setTextColor(130, 100, 160);
      doc.text(`Exported on ${new Date().toLocaleDateString()}`, 20, 35);
      doc.line(20, 40, 190, 40);
      let y = 50;
      for (const entry of data.entries) {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFontSize(14); doc.setTextColor(180, 80, 160);
        doc.text(entry.date + (entry.mood ? ` ${entry.mood}` : ''), 20, y); y += 6;
        if (entry.title) { doc.setFontSize(12); doc.setTextColor(100, 60, 140); doc.text(entry.title, 20, y); y += 7; }
        doc.setFontSize(10); doc.setTextColor(80, 60, 100);
        const stripped = (entry.content || '').replace(/<[^>]+>/g, '').slice(0, 400);
        const lines = doc.splitTextToSize(stripped || '(No content)', 170);
        doc.text(lines, 20, y); y += lines.length * 5 + 8;
        doc.setDrawColor(220, 180, 220); doc.line(20, y, 190, y); y += 8;
      }
      doc.save('kittys-diary.pdf');
      toast.success('Diary exported as PDF! 📄');
    } catch (err) { console.error(err); toast.error('Export failed.'); }
    finally { setExportLoading(false); }
  };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className={`text-2xl font-bold font-playfair ${isDark ? 'text-purple-100' : 'text-purple-800'}`}>⚙️ Settings</h1>
          <p className={`text-sm mt-1 ${subCls}`}>Personalise your diary experience</p>
        </motion.div>

        {/* ── APPEARANCE ───────────────────────────────────────── */}
        <Section id="appearance" title="Appearance & Theme" icon={Palette} activeSection={activeSection} onToggle={onToggle} isDark={isDark}>
          <div className="space-y-6 pt-5">

            {/* Theme Presets */}
            <div>
              <p className={`text-sm font-semibold mb-3 ${labelCls}`}>Theme Preset</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    id={`theme-${t.id}`}
                    onClick={() => { setTheme(t.id); setBgType('theme-default'); }}
                    className={`relative p-3 rounded-2xl text-sm font-semibold transition-all border-2
                      ${theme === t.id ? 'border-pink-400 scale-105 shadow-lg' : 'border-transparent hover:border-pink-200 hover:scale-102'}`}
                    style={{ background: t.bg, color: t.text }}
                  >
                    {theme === t.id && (
                      <span className="absolute top-1.5 right-1.5 bg-pink-400 rounded-full p-0.5">
                        <Check size={10} color="white" />
                      </span>
                    )}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`border-t ${isDark ? 'border-white/10' : 'border-pink-100'}`} />

            {/* Background Override */}
            <div>
              <p className={`text-sm font-semibold mb-3 ${labelCls}`}>Custom Background <span className={`font-normal text-xs ${subCls}`}>(overrides theme)</span></p>
              <div className="flex flex-wrap gap-2 mb-4">
                {['theme-default', 'color', 'gradient', 'image'].map(t => (
                  <button
                    key={t} id={`bg-type-${t}`}
                    onClick={() => setBgType(t)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium capitalize transition-all border
                      ${bgType === t
                        ? (isDark ? 'bg-purple-500 text-white border-purple-400' : 'bg-gradient-to-r from-pink-400 to-purple-400 text-white border-transparent')
                        : (isDark ? 'bg-white/10 text-purple-200 border-white/20 hover:bg-white/20' : 'bg-white/60 text-pink-600 border-pink-200 hover:bg-pink-50')}`}
                  >
                    {t === 'theme-default' ? 'Theme Default' : t}
                  </button>
                ))}
              </div>

              {bgType === 'color' && (
                <div ref={colorPickerRef}>
                  <p className={`text-xs mb-2 ${subCls}`}>Click the swatch to open the colour picker</p>
                  <div className="w-14 h-10 rounded-xl border-2 border-pink-200 cursor-pointer shadow-md" style={{ background: bgColor }} onClick={() => setShowColorPicker(v => !v)} />
                  {showColorPicker && <div className="mt-2 p-2 bg-white rounded-xl shadow-xl inline-block"><HexColorPicker color={bgColor} onChange={setBgColor} /></div>}
                </div>
              )}

              {bgType === 'gradient' && (
                <div>
                  <p className={`text-xs mb-2 ${subCls}`}>Select a gradient</p>
                  <div className="grid grid-cols-4 gap-2">
                    {GRADIENTS.map(g => (
                      <button key={g.label} onClick={() => setBgGradient(g.value)} title={g.label}
                        className={`h-12 rounded-xl border-2 transition-all hover:scale-105 ${bgGradient === g.value ? 'border-purple-500 scale-105 shadow-md' : 'border-transparent hover:border-pink-300'}`}
                        style={{ background: g.value }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {bgType === 'image' && (
                <div>
                  <label htmlFor="bg-image-upload"
                    className={`flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer text-sm transition-colors
                      ${isDark ? 'bg-white/10 border-white/20 text-purple-300 hover:bg-white/20' : 'bg-pink-50 border-pink-200 text-pink-600 hover:bg-pink-100'}`}
                  >
                    📷 Upload background image (max 5MB)
                  </label>
                  <input id="bg-image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  {bgImage && (
                    <div className="mt-3 relative w-full h-28 rounded-xl overflow-hidden shadow-md">
                      <img src={bgImage} alt="bg preview" className="w-full h-full object-cover" />
                      <button onClick={() => setBgImage('')} className="absolute top-2 right-2 bg-rose-500 text-white text-xs px-2 py-1 rounded-lg">Remove</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button id="save-appearance-btn" onClick={handleSavePreferences} disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving...' : '💾 Save Appearance'}
            </button>
          </div>
        </Section>

        {/* ── TYPOGRAPHY ───────────────────────────────────────── */}
        <Section id="typography" title="Typography" icon={Type} activeSection={activeSection} onToggle={onToggle} isDark={isDark}>
          <div className="space-y-5 pt-5">
            <div>
              <p className={`text-sm font-semibold mb-2 ${labelCls}`}>Default Font</p>
              <select id="settings-font" value={fontFamily} onChange={e => setFontFamily(e.target.value)} className={inputCls} style={{ fontFamily }}>
                {FONTS.map(f => <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>)}
              </select>
              <p className={`text-sm mt-3 px-3 py-2 rounded-xl ${isDark ? 'bg-white/10 text-purple-200' : 'bg-pink-50 text-purple-500'}`} style={{ fontFamily }}>
                Preview: The quick brown fox jumps over the lazy dog 🦊
              </p>
            </div>
            <div>
              <p className={`text-sm font-semibold mb-2 ${labelCls}`}>Font Size: <strong>{fontSize}px</strong></p>
              <input id="settings-font-size" type="range" min={12} max={48} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className={`w-full ${isDark ? 'accent-purple-400' : 'accent-pink-500'}`} />
              <div className={`flex justify-between text-xs mt-1 ${subCls}`}><span>12px</span><span>48px</span></div>
            </div>
            <button id="save-typography-btn" onClick={handleSavePreferences} disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving...' : '💾 Save Typography'}
            </button>
          </div>
        </Section>

        {/* ── CURSOR STYLE ─────────────────────────────────────── */}
        <Section id="cursor" title="Cursor Style 🖱️" icon={MousePointer2} activeSection={activeSection} onToggle={onToggle} isDark={isDark}>
          <div className="space-y-5 pt-5">
            <p className={`text-sm ${subCls}`}>Choose your cursor shape and colour (desktop only). Changes apply instantly!</p>

            {/* Shape grid */}
            <div>
              <p className={`text-sm font-semibold mb-3 ${labelCls}`}>Shape</p>
              <div className="grid grid-cols-4 gap-2">
                {CURSOR_STYLES.map(s => {
                  const activeColor = CURSOR_COLORS.find(c => c.id === cursorPrefs.colorId)?.hex ?? '#f472b6';
                  const isActive = cursorPrefs.style === s.id;
                  return (
                    <button
                      key={s.id}
                      id={`cursor-style-${s.id}`}
                      onClick={() => {
                        const next = { ...cursorPrefs, style: s.id };
                        setCursorPrefs(next);
                        saveCursorPrefs(next);
                      }}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all
                        ${ isActive
                          ? (isDark ? 'border-purple-400 bg-white/10 scale-105' : 'border-pink-400 bg-pink-50 scale-105')
                          : (isDark ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-pink-100 bg-white/60 hover:bg-pink-50')
                        }`}
                    >
                      <div className="w-8 h-8 flex items-center justify-center">
                        <CursorSVG styleId={s.id} color={activeColor} size={24} />
                      </div>
                      <span className={`text-xs font-medium ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>
                        {s.label}
                      </span>
                      {isActive && (
                        <span className="absolute top-1 right-1">
                          <Check size={10} className="text-pink-400" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color palette */}
            <div>
              <p className={`text-sm font-semibold mb-3 ${labelCls}`}>Colour</p>
              <div className="flex flex-wrap gap-3">
                {CURSOR_COLORS.map(c => (
                  <button
                    key={c.id}
                    id={`cursor-color-${c.id}`}
                    title={c.label}
                    onClick={() => {
                      const next = { ...cursorPrefs, colorId: c.id };
                      setCursorPrefs(next);
                      saveCursorPrefs(next);
                    }}
                    style={{ background: c.hex }}
                    className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-125
                      ${ cursorPrefs.colorId === c.id
                        ? 'border-white scale-125 shadow-lg ring-2 ring-pink-400 ring-offset-1'
                        : 'border-white/50 hover:border-white'
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Live preview */}
            <div className={`flex items-center gap-4 px-4 py-3 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-pink-50 border border-pink-100'}`}>
              <CursorSVG
                styleId={cursorPrefs.style}
                color={CURSOR_COLORS.find(c => c.id === cursorPrefs.colorId)?.hex ?? '#f472b6'}
                size={28}
              />
              <div>
                <p className={`text-sm font-semibold ${labelCls}`}>Live Preview</p>
                <p className={`text-xs ${subCls}`}>
                  {CURSOR_STYLES.find(s => s.id === cursorPrefs.style)?.label} · {CURSOR_COLORS.find(c => c.id === cursorPrefs.colorId)?.label}
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* ── PIN LOCK ─────────────────────────────────────────── */}
        <Section id="pin" title="PIN Lock 🔐" icon={Lock} activeSection={activeSection} onToggle={onToggle} isDark={isDark}>
          <PinSection isDark={isDark} />
        </Section>

        {/* ── EXPORT ───────────────────────────────────────────── */}
        <Section id="export" title="Export Diary 📄" icon={Download} activeSection={activeSection} onToggle={onToggle} isDark={isDark}>
          <div className="space-y-4 pt-5">
            <p className={`text-sm ${subCls}`}>Download all your diary entries as a PDF document.</p>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isDark ? 'bg-white/10' : 'bg-pink-50'}`}>
              <span className="text-2xl">📊</span>
              <div>
                <p className={`text-sm font-semibold ${labelCls}`}>{entries?.length ?? '—'} entries</p>
                <p className={`text-xs ${subCls}`}>ready to export</p>
              </div>
            </div>
            <button id="export-pdf-btn" onClick={handleExportPDF} disabled={exportLoading} className="btn-primary w-full flex items-center justify-center gap-2">
              <Download size={15} />
              {exportLoading ? 'Generating PDF...' : 'Export as PDF'}
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}
