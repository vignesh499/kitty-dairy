import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';
import { Palette, Type, Lock, Download, ChevronDown, Check } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { entriesAPI } from '../../api';
import { useDiary } from '../../context/DiaryContext';

const THEMES = [
  { id: 'pastel',  label: 'Pastel 🌸',  bg: 'linear-gradient(135deg,#fce4ec 0%,#f3e5f5 50%,#e8eaf6 100%)', text: '#7e22ce' },
  { id: 'dark',    label: 'Dark 🌙',    bg: 'linear-gradient(135deg,#1e1b2e 0%,#2d1b3e 50%,#1a1a2e 100%)', text: '#e8d5ff' },
  { id: 'floral',  label: 'Floral 🌺',  bg: 'linear-gradient(135deg,#fce4ec 0%,#fff8e1 50%,#f1f8e9 100%)', text: '#7e22ce' },
  { id: 'cute',    label: 'Cute 💕',    bg: 'linear-gradient(135deg,#ffe4e6 0%,#fce7f3 50%,#f5d0fe 100%)', text: '#7e22ce' },
  { id: 'minimal', label: 'Minimal ✨', bg: 'linear-gradient(135deg,#fafafa 0%,#f5f5f5 100%)',              text: '#7e22ce' },
];

const FONTS = [
  { label: 'Nunito',          value: 'Nunito, sans-serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'Dancing Script',  value: '"Dancing Script", cursive' },
  { label: 'Lato',            value: 'Lato, sans-serif' },
  { label: 'Poppins',         value: 'Poppins, sans-serif' },
  { label: 'Merriweather',    value: 'Merriweather, serif' },
  { label: 'Pacifico',        value: 'Pacifico, cursive' },
  { label: 'Quicksand',       value: 'Quicksand, sans-serif' },
  { label: 'Caveat',          value: 'Caveat, cursive' },
  { label: 'Indie Flower',    value: '"Indie Flower", cursive' },
];

const GRADIENTS = [
  { label: 'Sakura Dream',  value: 'linear-gradient(135deg,#fce4ec 0%,#f3e5f5 50%,#e8eaf6 100%)' },
  { label: 'Sunset Glow',   value: 'linear-gradient(135deg,#ffecd2 0%,#fcb69f 100%)' },
  { label: 'Lavender Mist', value: 'linear-gradient(135deg,#a18cd1 0%,#fbc2eb 100%)' },
  { label: 'Cotton Candy',  value: 'linear-gradient(135deg,#f093fb 0%,#f5576c 100%)' },
  { label: 'Peach Cream',   value: 'linear-gradient(135deg,#fccb90 0%,#d57eeb 100%)' },
  { label: 'Minty Fresh',   value: 'linear-gradient(135deg,#84fab0 0%,#8fd3f4 100%)' },
  { label: 'Rose Gold',     value: 'linear-gradient(135deg,#f7971e 0%,#ffd200 100%)' },
  { label: 'Ocean Mist',    value: 'linear-gradient(135deg,#89f7fe 0%,#66a6ff 100%)' },
];

/* ── helper: applies theme vars immediately so the page feels live ── */
function applyTheme(theme, bgType, bgColor, bgGradient, bgImage) {
  document.body.setAttribute('data-theme', theme);
  // remove any inline override first
  document.body.style.background        = '';
  document.body.style.backgroundImage   = '';
  document.body.style.backgroundSize    = '';
  document.body.style.backgroundPosition = '';
  document.body.style.backgroundAttachment = '';

  if (bgType === 'color') {
    document.body.style.background = bgColor;
  } else if (bgType === 'gradient') {
    document.body.style.background = bgGradient;
  } else if (bgType === 'image' && bgImage) {
    document.body.style.backgroundImage      = `url(${bgImage})`;
    document.body.style.backgroundSize       = 'cover';
    document.body.style.backgroundPosition   = 'center';
    document.body.style.backgroundAttachment = 'fixed';
  }
  // 'theme-default' → no inline style, CSS var takes over
}

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
  const [pin,        setPin]        = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [saving,     setSaving]     = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('appearance');
  const colorPickerRef = useRef(null);

  const isDark = theme === 'dark';

  /* ── Close color picker on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Live preview while on this page ── */
  useEffect(() => {
    applyTheme(theme, bgType, bgColor, bgGradient, bgImage);
    document.documentElement.style.setProperty('--font-main', fontFamily);
    document.documentElement.style.setProperty('--font-size-base', `${fontSize}px`);

    return () => {
      // Revert to saved prefs on unmount
      const p = user?.preferences || {};
      applyTheme(
        p.theme || 'pastel',
        p.backgroundType || 'theme-default',
        p.backgroundColor || '#fce4ec',
        p.backgroundGradient || GRADIENTS[0].value,
        p.backgroundImage || ''
      );
      document.documentElement.style.setProperty('--font-main', p.fontFamily || 'Nunito, sans-serif');
      document.documentElement.style.setProperty('--font-size-base', `${p.fontSize || 16}px`);
    };
  }, [theme, bgType, bgColor, bgGradient, bgImage, fontFamily, fontSize]);

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
    } catch {
      toast.error('Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  const handleSetPin = async () => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) return toast.error('PIN must be 4 digits!');
    if (pin !== confirmPin) return toast.error('PINs do not match!');
    try {
      await authAPI.setPin(pin);
      toast.success('PIN set successfully! 🔐');
      setPin(''); setConfirmPin('');
    } catch { toast.error('Failed to set PIN.'); }
  };

  const handleExportPDF = async () => {
    setExportLoading(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const { data } = await entriesAPI.getAll();
      const allEntries = data.entries;

      doc.setFont('helvetica');
      doc.setFontSize(24); doc.setTextColor(160, 90, 180);
      doc.text("Kitty's Diary 💖", 20, 25);
      doc.setFontSize(10); doc.setTextColor(130, 100, 160);
      doc.text(`Exported on ${new Date().toLocaleDateString()}`, 20, 35);
      doc.line(20, 40, 190, 40);

      let y = 50;
      for (const entry of allEntries) {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFontSize(14); doc.setTextColor(180, 80, 160);
        doc.text(entry.date + (entry.mood ? ` ${entry.mood}` : ''), 20, y); y += 6;
        if (entry.title) {
          doc.setFontSize(12); doc.setTextColor(100, 60, 140);
          doc.text(entry.title, 20, y); y += 7;
        }
        doc.setFontSize(10); doc.setTextColor(80, 60, 100);
        const stripped = (entry.content || '').replace(/<[^>]+>/g, '').slice(0, 400);
        const lines = doc.splitTextToSize(stripped || '(No content)', 170);
        doc.text(lines, 20, y); y += lines.length * 5 + 8;
        doc.setDrawColor(220, 180, 220); doc.line(20, y, 190, y); y += 8;
      }
      doc.save('kittys-diary.pdf');
      toast.success('Diary exported as PDF! 📄');
    } catch (err) {
      console.error(err); toast.error('Export failed. Please try again.');
    } finally { setExportLoading(false); }
  };

  /* ── Shared styles that adapt to dark theme ── */
  const labelCls  = isDark ? 'text-purple-200' : 'text-purple-700';
  const subCls    = isDark ? 'text-purple-300' : 'text-purple-500';
  const cardCls   = isDark
    ? 'bg-white/5 border border-white/10 rounded-2xl shadow-lg mb-4'
    : 'card mb-4';
  const inputCls  = isDark
    ? 'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-purple-100 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all'
    : 'input-field';

  /* ── Collapsible Section Component ── */
  const Section = ({ id, title, icon: Icon, children }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cardCls}>
      <button
        onClick={() => setActiveSection(activeSection === id ? '' : id)}
        className="flex items-center justify-between w-full p-6"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isDark ? 'bg-white/10' : 'bg-gradient-to-br from-pink-100 to-purple-100'}`}>
            <Icon size={16} className={isDark ? 'text-purple-300' : 'text-pink-500'} />
          </div>
          <h2 className={`text-lg font-semibold font-playfair ${isDark ? 'text-purple-100' : 'text-purple-800'}`}>{title}</h2>
        </div>
        <ChevronDown size={16} className={`${subCls} transition-transform ${activeSection === id ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {activeSection === id && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className={`text-2xl font-bold font-playfair ${isDark ? 'text-purple-100' : 'text-purple-800'}`}>⚙️ Settings</h1>
          <p className={`text-sm mt-1 ${subCls}`}>Personalise your diary</p>
        </motion.div>

        {/* ─── APPEARANCE ─────────────────────────────────────────────── */}
        <Section id="appearance" title="Appearance & Theme" icon={Palette}>
          <div className="space-y-6">

            {/* Theme Presets */}
            <div>
              <p className={`text-sm font-semibold mb-3 ${labelCls}`}>Theme Preset</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    id={`theme-${t.id}`}
                    onClick={() => { setTheme(t.id); setBgType('theme-default'); }}
                    className={`relative p-3 rounded-2xl text-sm font-semibold transition-all border-2 overflow-hidden
                      ${theme === t.id ? 'border-pink-400 scale-105 shadow-lg' : 'border-transparent hover:border-pink-200'}`}
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
              <p className={`text-sm font-semibold mb-3 ${labelCls}`}>Custom Background Override</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {['theme-default', 'color', 'gradient', 'image'].map(t => (
                  <button
                    key={t}
                    id={`bg-type-${t}`}
                    onClick={() => setBgType(t)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all border
                      ${bgType === t
                        ? (isDark ? 'bg-purple-500 text-white border-purple-400' : 'bg-gradient-to-r from-pink-400 to-purple-400 text-white border-transparent')
                        : (isDark ? 'bg-white/10 text-purple-200 border-white/20 hover:bg-white/20' : 'bg-white/60 text-pink-600 border-pink-200 hover:bg-pink-50')
                      }`}
                  >
                    {t === 'theme-default' ? 'Theme Default' : t}
                  </button>
                ))}
              </div>

              {bgType === 'color' && (
                <div className="space-y-3">
                  <p className={`text-xs ${subCls}`}>Click the swatch to open the colour picker</p>
                  <div ref={colorPickerRef} className="inline-block">
                    <div
                      className="w-14 h-10 rounded-xl border-2 border-pink-200 cursor-pointer shadow-md"
                      style={{ background: bgColor }}
                      onClick={() => setShowColorPicker(v => !v)}
                    />
                    {showColorPicker && (
                      <div className="mt-2 p-2 bg-white rounded-xl shadow-xl inline-block">
                        <HexColorPicker color={bgColor} onChange={setBgColor} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {bgType === 'gradient' && (
                <div>
                  <p className={`text-xs mb-2 ${subCls}`}>Select a gradient</p>
                  <div className="grid grid-cols-4 gap-2">
                    {GRADIENTS.map(g => (
                      <button
                        key={g.label}
                        onClick={() => setBgGradient(g.value)}
                        title={g.label}
                        className={`h-12 rounded-xl border-2 transition-all shadow-sm hover:scale-105
                          ${bgGradient === g.value ? 'border-purple-500 scale-105 shadow-md' : 'border-transparent hover:border-pink-300'}`}
                        style={{ background: g.value }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {bgType === 'image' && (
                <div>
                  <label
                    htmlFor="bg-image-upload"
                    className={`flex items-center gap-2 px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer text-sm transition-colors
                      ${isDark ? 'bg-white/10 border-white/20 text-purple-300 hover:bg-white/20' : 'bg-pink-50 border-pink-200 text-pink-600 hover:bg-pink-100'}`}
                  >
                    📷 Upload background image (max 5MB)
                  </label>
                  <input id="bg-image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  {bgImage && (
                    <div className="mt-3 relative w-full h-28 rounded-xl overflow-hidden shadow-md">
                      <img src={bgImage} alt="Background preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setBgImage('')}
                        className="absolute top-2 right-2 bg-rose-500 text-white text-xs px-2 py-1 rounded-lg"
                      >Remove</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              id="save-appearance-btn"
              onClick={handleSavePreferences}
              disabled={saving}
              className="btn-primary w-full"
            >
              {saving ? 'Saving...' : '💾 Save Appearance'}
            </button>
          </div>
        </Section>

        {/* ─── TYPOGRAPHY ─────────────────────────────────────────────── */}
        <Section id="typography" title="Typography" icon={Type}>
          <div className="space-y-5">
            <div>
              <p className={`text-sm font-semibold mb-2 ${labelCls}`}>Default Font</p>
              <select
                id="settings-font"
                value={fontFamily}
                onChange={e => setFontFamily(e.target.value)}
                className={inputCls}
                style={{ fontFamily }}
              >
                {FONTS.map(f => (
                  <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                    {f.label}
                  </option>
                ))}
              </select>
              <p className={`text-sm mt-3 px-3 py-2 rounded-xl ${isDark ? 'bg-white/10 text-purple-200' : 'bg-pink-50 text-purple-500'}`} style={{ fontFamily }}>
                Preview: The quick brown fox jumps over the lazy dog 🦊
              </p>
            </div>

            <div>
              <p className={`text-sm font-semibold mb-2 ${labelCls}`}>
                Font Size: <strong>{fontSize}px</strong>
              </p>
              <input
                id="settings-font-size"
                type="range" min={12} max={48}
                value={fontSize}
                onChange={e => setFontSize(Number(e.target.value))}
                className={`w-full ${isDark ? 'accent-purple-400' : 'accent-pink-500'}`}
              />
              <div className={`flex justify-between text-xs mt-1 ${subCls}`}>
                <span>12px</span><span>48px</span>
              </div>
            </div>

            <button
              id="save-typography-btn"
              onClick={handleSavePreferences}
              disabled={saving}
              className="btn-primary w-full"
            >
              {saving ? 'Saving...' : '💾 Save Typography'}
            </button>
          </div>
        </Section>

        {/* ─── PIN LOCK ───────────────────────────────────────────────── */}
        <Section id="pin" title="PIN Lock 🔐" icon={Lock}>
          <div className="space-y-4">
            <p className={`text-sm ${subCls}`}>Set a 4-digit PIN to protect your diary from prying eyes 👀</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className={`text-sm font-semibold mb-1 ${labelCls}`}>New PIN</p>
                <input
                  id="new-pin"
                  type="password" inputMode="numeric" maxLength={4}
                  placeholder="····" value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className={`${inputCls} text-center text-xl tracking-widest`}
                />
              </div>
              <div>
                <p className={`text-sm font-semibold mb-1 ${labelCls}`}>Confirm PIN</p>
                <input
                  id="confirm-pin"
                  type="password" inputMode="numeric" maxLength={4}
                  placeholder="····" value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className={`${inputCls} text-center text-xl tracking-widest`}
                />
              </div>
            </div>
            <button id="save-pin-btn" onClick={handleSetPin} className="btn-primary w-full">
              🔐 Set PIN
            </button>
          </div>
        </Section>

        {/* ─── EXPORT ─────────────────────────────────────────────────── */}
        <Section id="export" title="Export Diary 📄" icon={Download}>
          <div className="space-y-4">
            <p className={`text-sm ${subCls}`}>Download all your diary entries as a beautiful PDF document.</p>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${isDark ? 'bg-white/10' : 'bg-pink-50'}`}>
              <span className="text-2xl">📊</span>
              <div>
                <p className={`text-sm font-semibold ${labelCls}`}>{entries?.length ?? '—'} entries</p>
                <p className={`text-xs ${subCls}`}>ready to export</p>
              </div>
            </div>
            <button
              id="export-pdf-btn"
              onClick={handleExportPDF}
              disabled={exportLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Download size={15} />
              {exportLoading ? 'Generating PDF...' : 'Export as PDF'}
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}
