import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Lock, Heart } from 'lucide-react';

export default function PinLockPage() {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputs = useRef([]);
  const { verifyPin, user, logout } = useAuth();

  const handleInput = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError('');
    if (value && index < 3) inputs.current[index + 1]?.focus();
    if (newPin.every(d => d !== '')) {
      handleVerify(newPin.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (pinStr) => {
    setLoading(true);
    try {
      await verifyPin(pinStr);
      toast.success('Welcome, Kitty! 💖');
    } catch {
      setError('Wrong PIN, sweetie 🙈');
      setShake(true);
      setPin(['', '', '', '']);
      setTimeout(() => { setShake(false); inputs.current[0]?.focus(); }, 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="diary-bg flex items-center justify-center min-h-screen p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-pink-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="text-6xl mb-4"
          >
            🔐
          </motion.div>
          <h1 className="text-3xl font-bold font-playfair bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Kitty's Diary
          </h1>
          <p className="text-purple-500 mt-2 text-sm">
            Hi, <strong>{user?.name}</strong>! Enter your PIN to continue 💕
          </p>
        </div>

        <motion.div
          className="glass p-8 text-center"
          animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-center gap-2 mb-3 text-purple-600">
            <Lock size={16} />
            <span className="text-sm font-medium">Enter 4-digit PIN</span>
          </div>

          <div className="flex gap-3 justify-center my-6">
            {pin.map((digit, i) => (
              <motion.input
                key={i}
                id={`pin-input-${i}`}
                ref={el => inputs.current[i] = el}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleInput(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                whileFocus={{ scale: 1.05 }}
                className="w-14 h-14 text-2xl text-center bg-white/70 border-2 border-pink-200
                           rounded-xl font-bold text-purple-700 focus:outline-none focus:border-pink-400
                           focus:ring-2 focus:ring-pink-200 transition-all"
                autoFocus={i === 0}
              />
            ))}
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-rose-500 text-sm mb-4"
            >
              {error}
            </motion.p>
          )}

          {loading && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-pink-400 text-sm"
            >
              Verifying...
            </motion.div>
          )}

          <button
            onClick={logout}
            className="text-xs text-purple-400 hover:text-purple-600 mt-4 underline transition-colors"
          >
            Not you? Switch account
          </button>
        </motion.div>

        <motion.div
          className="text-center mt-6 text-pink-300 text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
        >
          <Heart size={12} className="inline fill-pink-300 mr-1" />
          This diary is just for you
          <Heart size={12} className="inline fill-pink-300 ml-1" />
        </motion.div>
      </motion.div>
    </div>
  );
}
