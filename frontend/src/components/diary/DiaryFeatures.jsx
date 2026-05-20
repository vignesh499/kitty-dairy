import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDiary } from '../../context/DiaryContext';
import { useNavigate } from 'react-router-dom';
import { parseISO, format } from 'date-fns';

/**
 * Computes the current writing streak from all entries.
 * A streak = consecutive days ending at today or yesterday.
 */
export function useStreak(entries) {
  return useMemo(() => {
    if (!entries || entries.length === 0) return 0;

    // Build a set of date strings
    const dateSet = new Set(entries.map(e => e.date));

    const today = new Date();
    let streak = 0;
    let cursor = new Date(today);

    // Allow streak to continue if today or yesterday has an entry
    const todayStr = cursor.toISOString().slice(0, 10);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yestStr = yesterday.toISOString().slice(0, 10);

    if (!dateSet.has(todayStr) && !dateSet.has(yestStr)) return 0;

    // Start from today; if today not written yet, start from yesterday
    if (!dateSet.has(todayStr)) cursor = yesterday;

    while (true) {
      const s = cursor.toISOString().slice(0, 10);
      if (dateSet.has(s)) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [entries]);
}

/**
 * StreakBadge — shows flame + count in the sidebar.
 */
export function StreakBadge({ streak, collapsed }) {
  if (streak === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`mx-3 mb-3 px-3 py-2 rounded-2xl flex items-center gap-2
        bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200
        ${collapsed ? 'justify-center px-0' : ''}`}
    >
      <span className="text-lg leading-none">🔥</span>
      {!collapsed && (
        <div>
          <p className="text-xs font-bold text-orange-500 leading-tight">
            {streak} day{streak !== 1 ? 's' : ''} streak!
          </p>
          <p className="text-xs text-orange-400 leading-tight">Keep writing 💪</p>
        </div>
      )}
    </motion.div>
  );
}

/**
 * OnThisDay — shows the user's OWN past entries from the same calendar date.
 * Only appears if there are matching entries from previous years.
 */
export function OnThisDay({ entries }) {
  const navigate = useNavigate();
  const { setSelectedDate, fetchEntryByDate } = useDiary();

  const memories = useMemo(() => {
    if (!entries || entries.length === 0) return [];

    const today = new Date();
    const todayMD = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const thisYear = today.getFullYear();

    return entries
      .filter(e => {
        const d = parseISO(e.date);
        const md = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return md === todayMD && d.getFullYear() < thisYear;
      })
      .sort((a, b) => parseISO(b.date) - parseISO(a.date)); // newest year first
  }, [entries]);

  if (memories.length === 0) return null;

  const handleClick = async (entry) => {
    setSelectedDate(entry.date);
    await fetchEntryByDate(entry.date);
    navigate('/diary');
  };

  const yearsAgo = (dateStr) => {
    const year = parseISO(dateStr).getFullYear();
    const diff = new Date().getFullYear() - year;
    return diff === 1 ? '1 year ago' : `${diff} years ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mb-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🕰️</span>
        <div>
          <h2 className="text-sm font-bold font-playfair text-purple-800">On This Day</h2>
          <p className="text-xs text-purple-400" style={{ fontFamily: '"Caveat", cursive', fontSize: '0.95rem' }}>
            Your memories from {format(new Date(), 'MMMM d')}
          </p>
        </div>
      </div>

      {/* Memory cards */}
      <div className="space-y-2">
        {memories.map((entry, i) => (
          <motion.button
            key={entry._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => handleClick(entry)}
            className="w-full text-left p-3 rounded-2xl border border-pink-100
              bg-gradient-to-r from-pink-50/80 to-purple-50/80
              hover:from-pink-100 hover:to-purple-100
              hover:border-pink-300 hover:shadow-md
              transition-all duration-200 group"
          >
            <div className="flex items-start gap-2">
              {/* Year pill */}
              <span className="flex-shrink-0 mt-0.5 px-2 py-0.5 rounded-full text-xs font-bold
                bg-gradient-to-r from-pink-300 to-purple-300 text-white">
                {yearsAgo(entry.date)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {entry.mood && <span className="text-base">{entry.mood}</span>}
                  <p className="text-sm font-semibold text-purple-800 truncate font-playfair group-hover:text-pink-600 transition-colors">
                    {entry.title || 'Untitled Entry'}
                  </p>
                </div>
                <p className="text-xs text-purple-400 mt-0.5" style={{ fontFamily: '"Caveat", cursive', fontSize: '0.9rem' }}>
                  {format(parseISO(entry.date), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <span className="text-pink-300 group-hover:text-pink-500 transition-colors text-xs mt-1">→</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Divider */}
      <div className="mt-4 border-t border-pink-100" />
    </motion.div>
  );
}
