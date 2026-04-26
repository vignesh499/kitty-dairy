import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';
import { Palette, Type, Lock, Download, ChevronDown } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { entriesAPI } from '../../api';
import { useDiary } from '../../context/DiaryContext';

const THEMES = [
  { id: 'pastel', label: 'Pastel 🌸', gradient: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 50%, #e8eaf6 100%)' },
  { id: 'dark', label: 'Dark 🌙', gradient: 'linear-gradient(135deg, #1e1b2e 0%, #2d1b3e 50%, #1a1a2e 100%)' },
  { id: 'floral', label: 'Floral 🌺', gradient: 'linear-gradient(135deg, #fce4ec 0%, #fff8e1 50%, #f1f8e9 100%)' },
  { id: 'cute', label: 'Cute 💕', gradient: 'linear-gradient(135deg, #ffe4e6 0%, #fce7f3 50%, #f5d0fe 100%)' },
  { id: 'minimal', label: 'Minimal ✨', gradient: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)' },
];

const FONTS = [
  { label: 'Nunito', value: 'Nunito, sans-serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'Dancing Script', value: '"Dancing Script", cursive' },
  { label: 'Lato', value: 'Lato, sans-serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'Pacifico', value: 'Pacifico, cursive' },
  { label: 'Quicksand', value: 'Quicksand, sans-serif' },
  { label: 'Comic Sans MS', value: '"Comic Sans MS", "Comic Sans", cursive' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
  { label: 'Caveat', value: 'Caveat, cursive' },
  { label: 'Indie Flower', value: '"Indie Flower", cursive' },
];

const GRADIENTS = [
  { label: 'Sakura Dream', value: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 50%, #e8eaf6 100%)' },
  { label: 'Sunset Glow', value: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { label: 'Lavender Mist', value: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' },
  { label: 'Cotton Candy', value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { label: 'Peach Cream', value: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)' },
  { label: 'Minty Fresh', value: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
  { label: 'Rose Gold', value: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)' },
  { label: 'Ocean Mist', value: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
];

export default function SettingsPage() {
  const { user, updatePreferences } = useAuth();
  const { entries } = useDiary();

  const prefs = user?.preferences || {};
  const [theme, setTheme] = useState(prefs.theme || 'pastel');
  const [bgType, setBgType] = useState(prefs.backgroundType || 'gradient');
  const [bgColor, setBgColor] = useState(prefs.backgroundColor || '#fce4ec');
  const [bgGradient, setBgGradient] = useState(prefs.backgroundGradient || GRADIENTS[0].value);
  const [bgImage, setBgImage] = useState(prefs.backgroundImage || '');
  const [fontFamily, setFontFamily] = useState(prefs.fontFamily || 'Nunito, sans-serif');
  const [fontSize, setFontSize] = useState(prefs.fontSize || 16);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [saving, setSaving] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('appearance');

  // Live preview effect
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    document.documentElement.style.setProperty('--font-main', fontFamily);
    document.documentElement.style.setProperty('--font-size-base', `${fontSize}px`);

    if (bgType === 'color') {
      document.body.style.background = bgColor;
      document.body.style.backgroundImage = '';
    } else if (bgType === 'gradient') {
      document.body.style.background = bgGradient;
      document.body.style.backgroundImage = '';
    } else if (bgType === 'image' && bgImage) {
      document.body.style.backgroundImage = `url(${bgImage})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    }

    return () => {
      // Revert to saved preferences when unmounting
      document.body.setAttribute('data-theme', user?.preferences?.theme || 'pastel');
      document.documentElement.style.setProperty('--font-main', user?.preferences?.fontFamily || 'Nunito, sans-serif');
      document.documentElement.style.setProperty('--font-size-base', `${user?.preferences?.fontSize || 16}px`);
      
      if (user?.preferences?.backgroundType === 'color') document.body.style.background = user.preferences.backgroundColor;
      else if (user?.preferences?.backgroundType === 'gradient') document.body.style.background = user.preferences.backgroundGradient;
      else if (user?.preferences?.backgroundType === 'image' && user.preferences.backgroundImage) {
        document.body.style.backgroundImage = `url(${user.preferences.backgroundImage})`;
      } else {
        document.body.style.background = '';
        document.body.style.backgroundImage = '';
      }
    };
  }, [theme, bgType, bgColor, bgGradient, bgImage, fontFamily, fontSize, user?.preferences]);

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
      await updatePreferences({
        theme,
        backgroundType: bgType,
        backgroundColor: bgColor,
        backgroundGradient: bgGradient,
        backgroundImage: bgImage,
        fontFamily,
        fontSize,
      });
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
      setPin('');
      setConfirmPin('');
    } catch {
      toast.error('Failed to set PIN.');
    }
  };

  const handleExportPDF = async () => {
    setExportLoading(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const { data } = await entriesAPI.getAll();
      const allEntries = data.entries;

      doc.setFont('helvetica');
      doc.setFontSize(24);
      doc.setTextColor(160, 90, 180);
      doc.text("Kitty's Diary 💖", 20, 25);
      doc.setFontSize(10);
      doc.setTextColor(130, 100, 160);
      doc.text(`Exported on ${new Date().toLocaleDateString()}`, 20, 35);
      doc.line(20, 40, 190, 40);

      let y = 50;
      for (const entry of allEntries) {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFontSize(14);
        doc.setTextColor(180, 80, 160);
        doc.text(entry.date + (entry.mood ? ` ${entry.mood}` : ''), 20, y);
        y += 6;
        if (entry.title) {
          doc.setFontSize(12);
          doc.setTextColor(100, 60, 140);
          doc.text(entry.title, 20, y);
          y += 7;
        }
        doc.setFontSize(10);
        doc.setTextColor(80, 60, 100);
        const stripped = (entry.content || '').replace(/<[^>]+>/g, '').slice(0, 400);
        const lines = doc.splitTextToSize(stripped || '(No content)', 170);
        doc.text(lines, 20, y);
        y += lines.length * 5 + 8;
        doc.setDrawColor(220, 180, 220);
        doc.line(20, y, 190, y);
        y += 8;
      }

      doc.save("kittys-diary.pdf");
      toast.success('Diary exported as PDF! 📄');
    } catch (err) {
      console.error(err);
      toast.error('Export failed. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const Section = ({ id, title, icon: Icon, children }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 mb-4"
    >
      <button
        onClick={() => setActiveSection(activeSection === id ? '' : id)}
        className="flex items-center justify-between w-full mb-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-pink-100 to-purple-100 rounded-xl">
            <Icon size={16} className="text-pink-500" />
          </div>
          <h2 className="text-lg font-semibold font-playfair text-purple-800">{title}</h2>
        </div>
        <ChevronDown
          size={16}
          className={`text-purple-400 transition-transform ${activeSection === id ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {activeSection === id && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold font-playfair text-purple-800">⚙️ Settings</h1>
          <p className="text-purple-400 text-sm mt-1">Personalize your diary</p>
        </motion.div>

        {/* Appearance */}
        <Section id="appearance" title="Appearance & Theme" icon={Palette}>
          <div className="space-y-5">
            {/* Theme Presets */}
            <div>
              <label className="text-sm font-medium text-purple-700 mb-3 block">Theme Preset</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    id={`theme-${t.id}`}
                    onClick={() => setTheme(t.id)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all border-2
                      ${theme === t.id ? 'border-pink-400 shadow-glow' : 'border-transparent hover:border-pink-200'}`}
                    style={{ background: t.gradient, color: t.id === 'dark' ? '#e8d5ff' : '#7e22ce' }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Type */}
            <div>
              <label className="text-sm font-medium text-purple-700 mb-2 block">Background</label>
              <div className="flex gap-2 mb-3">
                {['color', 'gradient', 'image'].map(t => (
                  <button
                    key={t}
                    id={`bg-type-${t}`}
                    onClick={() => setBgType(t)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all
                      ${bgType === t ? 'btn-primary py-1.5' : 'btn-secondary py-1.5'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {bgType === 'color' && (
                <div className="space-y-2">
                  <div
                    className="w-12 h-10 rounded-xl border-2 border-pink-200 cursor-pointer"
                    style={{ background: bgColor }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  />
                  {showColorPicker && (
                    <div className="p-2 bg-white rounded-xl shadow-lg inline-block">
                      <HexColorPicker color={bgColor} onChange={setBgColor} />
                    </div>
                  )}
                </div>
              )}

              {bgType === 'gradient' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {GRADIENTS.map(g => (
                    <button
                      key={g.label}
                      onClick={() => setBgGradient(g.value)}
                      title={g.label}
                      className={`h-10 rounded-xl border-2 transition-all
                        ${bgGradient === g.value ? 'border-purple-500 scale-105' : 'border-transparent hover:border-pink-300'}`}
                      style={{ background: g.value }}
                    />
                  ))}
                </div>
              )}

              {bgType === 'image' && (
                <div>
                  <label
                    htmlFor="bg-image-upload"
                    className="flex items-center gap-2 px-4 py-3 bg-pink-50 border-2 border-dashed border-pink-200
                               rounded-xl cursor-pointer hover:bg-pink-100 transition-colors text-sm text-pink-600"
                  >
                    📷 Upload background image (max 5MB)
                  </label>
                  <input
                    id="bg-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {bgImage && (
                    <div className="mt-2 relative w-full h-24 rounded-xl overflow-hidden">
                      <img src={bgImage} alt="Background preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              id="save-appearance-btn"
              onClick={handleSavePreferences}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : '💾 Save Appearance'}
            </button>
          </div>
        </Section>

        {/* Typography */}
        <Section id="typography" title="Typography" icon={Type}>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-purple-700 mb-2 block">Default Font</label>
              <select
                id="settings-font"
                value={fontFamily}
                onChange={e => setFontFamily(e.target.value)}
                className="input-field"
                style={{ fontFamily }}
              >
                {FONTS.map(f => (
                  <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                    {f.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-purple-400 mt-2" style={{ fontFamily }}>
                Preview: The quick brown fox jumps over the lazy dog 🦊
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-purple-700 mb-2 block">
                Default Font Size: <strong>{fontSize}px</strong>
              </label>
              <input
                id="settings-font-size"
                type="range"
                min={12}
                max={48}
                value={fontSize}
                onChange={e => setFontSize(Number(e.target.value))}
                className="w-full accent-pink-500"
              />
              <div className="flex justify-between text-xs text-purple-300 mt-1">
                <span>12px</span><span>48px</span>
              </div>
            </div>
            <button
              id="save-typography-btn"
              onClick={handleSavePreferences}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : '💾 Save Typography'}
            </button>
          </div>
        </Section>

        {/* PIN Lock */}
        <Section id="pin" title="PIN Lock 🔐" icon={Lock}>
          <div className="space-y-4">
            <p className="text-sm text-purple-500">
              Set a 4-digit PIN to protect your diary from prying eyes 👀
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-purple-700 mb-1 block">New PIN</label>
                <input
                  id="new-pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="····"
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="input-field text-center text-xl tracking-widest"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-purple-700 mb-1 block">Confirm PIN</label>
                <input
                  id="confirm-pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="····"
                  value={confirmPin}
                  onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="input-field text-center text-xl tracking-widest"
                />
              </div>
            </div>
            <button
              id="save-pin-btn"
              onClick={handleSetPin}
              className="btn-primary"
            >
              🔐 Set PIN
            </button>
          </div>
        </Section>

        {/* Export */}
        <Section id="export" title="Export Diary 📄" icon={Download}>
          <div className="space-y-4">
            <p className="text-sm text-purple-500">
              Download all your diary entries as a PDF document.
            </p>
            <button
              id="export-pdf-btn"
              onClick={handleExportPDF}
              disabled={exportLoading}
              className="btn-primary flex items-center gap-2"
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
