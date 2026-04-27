import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Save, Trash2, ChevronDown, Sparkles, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDiary } from '../../context/DiaryContext';
import RichTextEditor from '../../components/editor/RichTextEditor';
import toast from 'react-hot-toast';

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

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48];

const MOODS = ['😊', '😢', '😍', '😤', '😴', '🥳', '😰', '🤔', '😌', '🥺'];

const MOOD_LABELS = {
  '😊': 'Happy', '😢': 'Sad', '😍': 'In Love', '😤': 'Angry',
  '😴': 'Sleepy', '🥳': 'Excited', '😰': 'Anxious', '🤔': 'Thoughtful',
  '😌': 'Calm', '🥺': 'Emotional',
};

export default function DiaryPage() {
  const { user } = useAuth();
  const { selectedDate, currentEntry, fetchEntryByDate, saveEntry, deleteEntry } = useDiary();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [editor, setEditor] = useState(null);
  const autoSaveRef = useRef(null);

  // Load entry when selectedDate or currentEntry changes
  useEffect(() => {
    if (currentEntry) {
      setTitle(currentEntry.title || '');
      setContent(currentEntry.content || '');
      setMood(currentEntry.mood || '');
    } else {
      setTitle('');
      setContent('');
      setMood('');
    }
    setIsDirty(false);
  }, [currentEntry, selectedDate]);

  // Auto-save logic (every 30 seconds when dirty)
  useEffect(() => {
    if (!isDirty) return;
    autoSaveRef.current = setTimeout(async () => {
      await handleSave(true);
    }, 30000);
    return () => clearTimeout(autoSaveRef.current);
  }, [isDirty, content, title, mood]);

  const markDirty = useCallback(() => setIsDirty(true), []);

  const handleSave = async (isAutoSave = false) => {
    if (!selectedDate) return;
    setSaving(true);
    try {
      await saveEntry({ date: selectedDate, title, content, mood });
      setIsDirty(false);
      if (!isAutoSave) toast.success('Entry saved! 💖');
      else toast.success('Auto-saved ✨', { duration: 1500, icon: '💾' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save entry.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentEntry?._id) return;
    if (!confirm('Delete this diary entry forever? 🥺')) return;
    await deleteEntry(currentEntry._id);
  };

  const displayDate = selectedDate
    ? format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')
    : format(new Date(), 'EEEE, MMMM d, yyyy');

  const greetingEmoji = () => {
    const h = new Date().getHours();
    if (h < 6) return '🌙';
    if (h < 12) return '🌸';
    if (h < 17) return '☀️';
    if (h < 21) return '🌅';
    return '⭐';
  };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 text-purple-400 text-sm mb-1">
                <Calendar size={14} />
                <span>{displayDate}</span>
                {isDirty && (
                  <span className="text-xs text-amber-400 animate-pulse">● unsaved</span>
                )}
              </div>
              <h1 className="text-2xl font-bold font-playfair text-purple-800">
                {greetingEmoji()} {currentEntry ? 'Edit Entry' : 'New Entry'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {currentEntry?._id && (
                <motion.button
                  id="delete-entry-btn"
                  onClick={handleDelete}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-ghost text-rose-400 hover:bg-rose-50 flex items-center gap-1.5"
                >
                  <Trash2 size={15} />
                  <span className="hidden sm:inline">Delete</span>
                </motion.button>
              )}
              <motion.button
                id="save-entry-btn"
                onClick={() => handleSave(false)}
                disabled={saving}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <span className="animate-pulse">Saving...</span>
                ) : (
                  <>
                    <Save size={15} />
                    Save Entry
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Editor Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 space-y-5"
        >
          {/* Title */}
          <input
            id="entry-title"
            type="text"
            placeholder="Give today a title... ✨"
            value={title}
            onChange={e => { setTitle(e.target.value); markDirty(); }}
            className="w-full text-xl font-semibold font-playfair bg-transparent border-b-2 border-pink-100
                       focus:border-pink-300 outline-none py-2 text-purple-800 placeholder-pink-200
                       transition-colors"
          />

          {/* Toolbar Row: Font + Size + Mood */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="grid grid-cols-2 sm:flex items-center gap-3 w-full sm:w-auto">
              {/* Font Selector */}
              <div className="relative">
                <label className="text-xs text-purple-500 mb-1 block">Font</label>
                <div className="relative">
                  <select
                    id="font-selector"
                    value={editor?.getAttributes('textStyle').fontFamily || ''}
                    onChange={e => {
                      if (editor) editor.chain().focus().setFontFamily(e.target.value).run();
                      markDirty();
                    }}
                    className="appearance-none w-full pl-3 pr-8 py-2 text-sm bg-white/60 border border-pink-200
                               rounded-xl text-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-200
                               cursor-pointer"
                  >
                    <option value="">Default</option>
                    {FONTS.map(f => (
                      <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-pink-400 pointer-events-none" />
                </div>
              </div>

              {/* Font Size */}
              <div className="relative">
                <label className="text-xs text-purple-500 mb-1 block">Size</label>
                <div className="relative">
                  <select
                    id="font-size-selector"
                    value={editor?.getAttributes('textStyle').fontSize?.replace('px', '') || ''}
                    onChange={e => {
                      if (editor) editor.chain().focus().setFontSize(`${e.target.value}px`).run();
                      markDirty();
                    }}
                    className="appearance-none w-full pl-3 pr-8 py-2 text-sm bg-white/60 border border-pink-200
                               rounded-xl text-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-200
                               cursor-pointer"
                  >
                    <option value="">Default</option>
                    {FONT_SIZES.map(s => (
                      <option key={s} value={s}>{s}px</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-pink-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Mood */}
            <div className="w-full sm:flex-1 overflow-hidden">
              <label className="text-xs text-purple-500 mb-1 block">Mood</label>
              <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar py-2 px-1 w-full mask-linear">
                {MOODS.map(m => (
                  <button
                    key={m}
                    type="button"
                    id={`mood-${m}`}
                    onClick={() => { setMood(mood === m ? '' : m); markDirty(); }}
                    className={`mood-btn flex-shrink-0 ${mood === m ? 'selected' : ''}`}
                    title={MOOD_LABELS[m]}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rich Text Editor */}
          <RichTextEditor
            content={content}
            onChange={(html) => { setContent(html); markDirty(); }}
            onEditorReady={setEditor}
          />

          {/* Footer hints */}
          <div className="flex items-center justify-between text-xs text-purple-300">
            <span>
              {currentEntry?.updatedAt
                ? `Last saved: ${format(parseISO(currentEntry.updatedAt), 'h:mm a')}`
                : 'Not saved yet'}
            </span>
            <span className="flex items-center gap-1">
              <Sparkles size={11} />
              Auto-saves every 30 seconds
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
