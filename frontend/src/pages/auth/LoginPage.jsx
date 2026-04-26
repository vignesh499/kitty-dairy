import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Heart, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields.');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(data.message || 'Welcome back! 💖');
      navigate('/diary');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="diary-bg flex items-center justify-center min-h-screen p-4">
      {/* Decorative blobs */}
      <div className="fixed top-20 left-10 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-100/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="text-5xl"
            >
              📖
            </motion.span>
          </div>
          <h1 className="text-4xl font-bold font-playfair bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Kitty's Diary
          </h1>
          <p className="text-pink-400 mt-2 font-nunito flex items-center justify-center gap-1">
            <Heart size={14} className="fill-pink-400" />
            Your private little world
            <Heart size={14} className="fill-pink-400" />
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="glass p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold font-playfair text-purple-800 mb-6 text-center">
            Welcome back 💕
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-1.5">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="kitty@example.com"
                className="input-field"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Your secret password..."
                  className="input-field pr-12"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-600 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <motion.button
              id="login-submit"
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="animate-pulse">Opening diary...</span>
              ) : (
                <>
                  <Sparkles size={16} />
                  Open My Diary
                  <Sparkles size={16} />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-purple-500 mt-6">
            New here?{' '}
            <Link
              to="/signup"
              id="go-to-signup"
              className="text-pink-500 font-semibold hover:text-pink-600 underline underline-offset-2 transition-colors"
            >
              Create your diary
            </Link>
          </p>
        </motion.div>

        {/* Floating sparkles */}
        <motion.div
          className="text-center mt-6 text-pink-300 text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
        >
          ✨ Every day is a new page ✨
        </motion.div>
      </motion.div>
    </div>
  );
}
