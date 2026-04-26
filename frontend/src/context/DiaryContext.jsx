import { createContext, useContext, useState, useCallback } from 'react';
import { entriesAPI } from '../api';
import toast from 'react-hot-toast';

const DiaryContext = createContext(null);

export const DiaryProvider = ({ children }) => {
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [calendarDates, setCalendarDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(false);

  const fetchEntries = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const { data } = await entriesAPI.getAll(params);
      setEntries(data.entries);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCalendarDates = useCallback(async (month, year) => {
    try {
      const { data } = await entriesAPI.getDates({ month, year });
      setCalendarDates(data.entries);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchEntryByDate = useCallback(async (date) => {
    try {
      setLoading(true);
      const { data } = await entriesAPI.getByDate(date);
      setCurrentEntry(data.entry);
      return data.entry;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveEntry = useCallback(async (entryData) => {
    try {
      if (currentEntry?._id) {
        const { data } = await entriesAPI.update(currentEntry._id, entryData);
        setCurrentEntry(data.entry);
        // Update calendar dates
        setCalendarDates(prev => prev.some(e => e.date === entryData.date)
          ? prev
          : [...prev, { date: entryData.date, mood: entryData.mood }]);
        return { success: true, entry: data.entry };
      } else {
        const { data } = await entriesAPI.create(entryData);
        setCurrentEntry(data.entry);
        setCalendarDates(prev => [...prev, { date: entryData.date, mood: entryData.mood }]);
        return { success: true, entry: data.entry };
      }
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.entryId) {
        // Entry exists — update it
        const { data } = await entriesAPI.update(err.response.data.entryId, entryData);
        setCurrentEntry(data.entry);
        return { success: true, entry: data.entry };
      }
      throw err;
    }
  }, [currentEntry]);

  const deleteEntry = useCallback(async (id) => {
    await entriesAPI.delete(id);
    const deletedEntry = currentEntry;
    setCurrentEntry(null);
    setCalendarDates(prev => prev.filter(e => e.date !== deletedEntry?.date));
    setEntries(prev => prev.filter(e => e._id !== id));
    toast.success('Entry deleted.');
  }, [currentEntry]);

  const searchEntries = useCallback(async (search) => {
    try {
      setLoading(true);
      const { data } = await entriesAPI.getAll({ search });
      setEntries(data.entries);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <DiaryContext.Provider value={{
      entries, currentEntry, calendarDates, selectedDate, loading,
      setSelectedDate, fetchEntries, fetchCalendarDates, fetchEntryByDate,
      saveEntry, deleteEntry, searchEntries, setCurrentEntry
    }}>
      {children}
    </DiaryContext.Provider>
  );
};

export const useDiary = () => {
  const ctx = useContext(DiaryContext);
  if (!ctx) throw new Error('useDiary must be used within DiaryProvider');
  return ctx;
};
