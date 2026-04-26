import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Heart, Stars } from 'lucide-react';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match! 🙈');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      toast.success(`Welcome, ${form.name}! Your diary is ready 💖`);
      navigate('/diary');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || err.message || 'Signup failed. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="diary-bg flex items-center justify-center min-h-screen p-4">
      <div className="fixed top-10 right-20 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 left-10 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-5xl mb-3">🌸</div>
          <h1 className="text-4xl font-bold font-playfair bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Kitty's Diary
          </h1>
          <p className="text-pink-400 mt-2 text-sm flex items-center justify-center gap-1">
            <Heart size={14} className="fill-pink-400" />
            Begin your diary journey
            <Heart size={14} className="fill-pink-400" />
          </p>
        </motion.div>

        <motion.div
          className="glass p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold font-playfair text-purple-800 mb-6 text-center">
            Create your diary ✨
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-700 mb-1.5">Your Name</label>
              <input
                id="signup-name"
                type="text"
                placeholder="Kitty"
                className="input-field"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-700 mb-1.5">Email</label>
              <input
                id="signup-email"
                type="email"
                placeholder="kitty@example.com"
                className="input-field"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="At least 6 characters..."
                  className="input-field pr-12"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-600"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-700 mb-1.5">Confirm Password</label>
              <input
                id="signup-confirm"
                type={showPass ? 'text' : 'password'}
                placeholder="Repeat your password..."
                className="input-field"
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                required
              />
            </div>

            <motion.button
              id="signup-submit"
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="animate-pulse">Creating your diary...</span>
              ) : (
                <>
                  <Stars size={16} />
                  Start My Diary
                  <Stars size={16} />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-purple-500 mt-6">
            Already have a diary?{' '}
            <Link
              to="/login"
              id="go-to-login"
              className="text-pink-500 font-semibold hover:text-pink-600 underline underline-offset-2"
            >
              Open it here
            </Link>
          </p>
        </motion.div>

        <motion.div
          className="text-center mt-6 text-pink-300 text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          🌸 Your stories deserve to be told 🌸
        </motion.div>
      </motion.div>
    </div>
  );
}
