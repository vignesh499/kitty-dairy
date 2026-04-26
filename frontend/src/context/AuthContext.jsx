import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pinVerified, setPinVerified] = useState(false);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('kitty_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await authAPI.getMe();
      setUser(data.user);
    } catch {
      localStorage.removeItem('kitty_token');
      localStorage.removeItem('kitty_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('kitty_token', data.token);
    setUser(data.user);
    setPinVerified(!data.user.hasPin); // Auto-verified if no PIN
    return data;
  };

  const signup = async (name, email, password) => {
    const { data } = await authAPI.signup({ name, email, password });
    localStorage.setItem('kitty_token', data.token);
    setUser(data.user);
    setPinVerified(true);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('kitty_token');
    localStorage.removeItem('kitty_user');
    setUser(null);
    setPinVerified(false);
    toast.success('See you soon, Kitty! 💖');
  };

  const updatePreferences = async (preferences) => {
    const { data } = await authAPI.updatePreferences(preferences);
    setUser(prev => ({ ...prev, preferences: data.preferences }));
    return data;
  };

  const verifyPin = async (pin) => {
    await authAPI.verifyPin(pin);
    setPinVerified(true);
  };

  return (
    <AuthContext.Provider value={{ user, loading, pinVerified, login, signup, logout, updatePreferences, verifyPin, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
