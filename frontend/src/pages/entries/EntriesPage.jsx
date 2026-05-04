import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { Search, X, BookOpen, ChevronRight, Calendar } from 'lucide-react';
import { useDiary } from '../../context/DiaryContext';

export default function EntriesPage() {
  const { entries, loading, fetchEntries, searchEntries, setSelectedDate, fetchEntryByDate } = useDiary();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [activeSearch, setActiveSearch] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const q = searchParams.get('search');
    if (q) {
      setSearchQuery(q);
      setActiveSearch(q);
      searchEntries(q);
    } else {
      fetchEntries();
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setActiveSearch('');
      fetchEntries();
      navigate('/entries');
      return;
    }
    setActiveSearch(searchQuery);
    searchEntries(searchQuery);
    navigate(`/entries?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
    fetchEntries();
    navigate('/entries');
  };

  const handleEntryClick = async (entry) => {
    setSelectedDate(entry.date);
    await fetchEntryByDate(entry.date);
    navigate('/diary');
  };

  const MOOD_BG = {
    '😊': 'from-yellow-100 to-orange-100',
    '😢': 'from-blue-100 to-indigo-100',
    '😍': 'from-pink-100 to-rose-100',
    '😤': 'from-red-100 to-orange-100',
    '😴': 'from-slate-100 to-blue-100',
    '🥳': 'from-purple-100 to-pink-100',
    '😰': 'from-green-100 to-teal-100',
    '🤔': 'from-violet-100 to-purple-100',
    '😌': 'from-emerald-100 to-teal-100',
    '🥺': 'from-rose-100 to-pink-100',
  };

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold font-playfair text-purple-800 mb-1">
            📚 All Entries
          </h1>
          <p className="text-purple-400 text-sm" style={{ fontFamily: '"Caveat", cursive', fontSize: '1rem' }}>
            {entries.length} {entries.length === 1 ? 'memory' : 'memories'} written ✨
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <form onSubmit={handleSearch} className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400" />
            <input
              id="entries-search"
              type="text"
              placeholder="Search your memories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-field pl-11 pr-12"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-600"
              >
                <X size={16} />
              </button>
            )}
          </form>
          {activeSearch && (
            <p className="text-xs text-purple-400 mt-2">
              Showing results for "<strong>{activeSearch}</strong>"
            </p>
          )}
        </motion.div>

        {/* Entries */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 bg-pink-100 rounded w-1/3 mb-2" />
                <div className="h-3 bg-pink-50 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4 animate-float inline-block">📖</div>
            <h3 className="text-xl font-semibold font-playfair text-purple-700 mb-2">
              {activeSearch ? 'No entries found' : 'No entries yet'}
            </h3>
            <p className="text-purple-400 text-sm">
              {activeSearch
                ? 'Try a different search term 💕'
                : 'Start writing your first diary entry! 🌸'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
              {entries.map((entry, i) => (
                <motion.div
                  key={entry._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.45, delay: Math.min(i * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ x: 6, transition: { duration: 0.2 } }}
                  onClick={() => handleEntryClick(entry)}
                  className={`card p-5 cursor-pointer border border-white/60 hover:border-pink-200
                              hover:shadow-glow transition-all duration-200 group
                              ${entry.mood ? `bg-gradient-to-r ${MOOD_BG[entry.mood] || 'from-white to-pink-50'} bg-opacity-40` : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar size={13} className="text-pink-400 flex-shrink-0" />
                        <span
                          className="text-purple-400 font-medium"
                          style={{ fontFamily: '"Caveat", cursive', fontSize: '1rem' }}
                        >
                          {format(parseISO(entry.date), 'EEEE, MMMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.mood && <span className="text-lg">{entry.mood}</span>}
                        <h3 className="font-semibold font-playfair text-purple-800 truncate">
                          {entry.title || 'Untitled Entry'}
                        </h3>
                      </div>
                      {entry.tags?.length > 0 && (
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {entry.tags.map(tag => (
                            <span key={tag} className="tag">#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight size={18} className="text-pink-300 group-hover:text-pink-500 transition-colors flex-shrink-0 ml-3" />
                  </div>
                </motion.div>
              ))}
            </div>
        )}
      </div>
    </div>
  );
}
