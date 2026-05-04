import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Calendar, Plus, Settings, LogOut, Search,
  ChevronLeft, ChevronRight, Menu, X, Heart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDiary } from '../../context/DiaryContext';
import toast from 'react-hot-toast';

const MOODS = ['😊', '😢', '😍', '😤', '😴', '🥳', '😰', '🤔', '😌', '🥺'];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const { calendarDates, selectedDate, setSelectedDate, fetchEntryByDate, fetchCalendarDates } = useDiary();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  };

  const changeMonth = async (dir) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + dir);
    setCurrentMonth(newMonth);
    await fetchCalendarDates(newMonth.getMonth() + 1, newMonth.getFullYear());
  };

  const handleDayClick = async (day) => {
    if (!day) return;
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    await fetchEntryByDate(dateStr);
    navigate('/diary');
    setMobileOpen(false);
  };

  const handleNewEntry = () => {
    setSelectedDate(todayStr);
    fetchEntryByDate(todayStr);
    navigate('/diary');
    setMobileOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/entries?search=${encodeURIComponent(searchQuery)}`);
    setMobileOpen(false);
  };

  const days = getDaysInMonth(currentMonth);
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const entryDateSet = new Set(calendarDates.map(e => e.date));
  const moodMap = Object.fromEntries(calendarDates.map(e => [e.date, e.mood]));

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-4 mb-2`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">📖</span>
            <span className="font-bold font-playfair text-lg logo-shimmer">
              Kitty's Diary
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-xl hover:bg-white/40 text-purple-500 transition-colors hidden lg:flex"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <form onSubmit={handleSearch} className="px-3 mb-4">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" />
            <input
              id="sidebar-search"
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-white/50 border border-pink-200
                         rounded-xl placeholder-pink-300 text-purple-700 focus:outline-none
                         focus:ring-2 focus:ring-pink-200 transition-all"
            />
          </div>
        </form>
      )}

      {/* Nav */}
      <nav className="px-3 space-y-1 mb-4">
        <NavLink
          to="/diary"
          id="nav-diary"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`}
        >
          <BookOpen size={18} />
          {!collapsed && <span>My Diary</span>}
        </NavLink>
        <NavLink
          to="/entries"
          id="nav-entries"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`}
        >
          <Calendar size={18} />
          {!collapsed && <span>All Entries</span>}
        </NavLink>
        <button
          id="nav-new-entry"
          onClick={handleNewEntry}
          className={`nav-item w-full ${collapsed ? 'justify-center' : ''}`}
        >
          <Plus size={18} />
          {!collapsed && <span>New Entry</span>}
        </button>
        <NavLink
          to="/settings"
          id="nav-settings"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`}
        >
          <Settings size={18} />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </nav>

      {/* Mini Calendar */}
      {!collapsed && (
        <div className="px-3 mb-4 flex-1">
          <div className="bg-white/40 rounded-2xl p-3 border border-white/60">
            <div className="kitty-calendar-header mb-2">
              <button
                onClick={() => changeMonth(-1)}
                className="p-1 rounded-lg hover:bg-pink-100 text-purple-500 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-semibold text-purple-700">{monthName}</span>
              <button
                onClick={() => changeMonth(1)}
                className="p-1 rounded-lg hover:bg-pink-100 text-purple-500 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="kitty-calendar-grid">
              {dayNames.map(d => (
                <div key={d} className="kitty-day-name" style={{ fontSize: '0.65rem' }}>{d}</div>
              ))}
              {days.map((day, i) => {
                const dateStr = day
                  ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  : null;
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                const hasEntry = dateStr && entryDateSet.has(dateStr);
                const mood = dateStr && moodMap[dateStr];

                return (
                  <div
                    key={i}
                    onClick={() => day && handleDayClick(day)}
                    className={`kitty-day text-xs
                      ${!day ? 'empty' : ''}
                      ${isToday ? 'today' : ''}
                      ${isSelected && !isToday ? 'selected' : ''}
                      ${hasEntry ? 'has-entry' : ''}
                    `}
                    style={{ fontSize: '0.7rem', minHeight: '24px' }}
                    title={mood ? `Mood: ${mood}` : undefined}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* User & Logout */}
      <div className={`px-3 pb-4 border-t border-pink-100 pt-3 ${collapsed ? 'items-center' : ''}`}>
        {!collapsed && (
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() || 'K'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-purple-800 truncate">{user?.name || 'Kitty'}</p>
              <p className="text-xs text-purple-400 truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <button
          id="logout-btn"
          onClick={logout}
          className={`nav-item w-full text-rose-400 hover:text-rose-500 hover:bg-rose-50 ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={16} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 glass rounded-xl text-purple-600"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="lg:hidden fixed top-0 left-0 h-full w-72 z-50 glass border-r border-white/40 overflow-y-auto"
          >
            {sidebarContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.div
        animate={{ width: collapsed ? 72 : 272 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="hidden lg:flex flex-col h-full glass border-r border-white/40 overflow-y-auto overflow-x-hidden flex-shrink-0"
      >
        {sidebarContent}
      </motion.div>
    </>
  );
}
