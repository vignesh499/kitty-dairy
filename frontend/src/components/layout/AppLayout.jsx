import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import ParticleBackground from '../effects/ParticleBackground';
import CustomCursor from '../effects/CustomCursor';

export function applyUserTheme(prefs = {}) {
  const theme  = prefs.theme  || 'pastel';
  const bgType = prefs.backgroundType || 'theme-default';

  document.body.setAttribute('data-theme', theme);
  document.body.style.background            = '';
  document.body.style.backgroundImage       = '';
  document.body.style.backgroundSize        = '';
  document.body.style.backgroundPosition    = '';
  document.body.style.backgroundAttachment  = '';

  if (bgType === 'color') {
    document.body.style.background = prefs.backgroundColor || '';
  } else if (bgType === 'gradient') {
    document.body.style.background = prefs.backgroundGradient || '';
  } else if (bgType === 'image' && prefs.backgroundImage) {
    document.body.style.backgroundImage     = `url(${prefs.backgroundImage})`;
    document.body.style.backgroundSize      = 'cover';
    document.body.style.backgroundPosition  = 'center';
    document.body.style.backgroundAttachment = 'fixed';
  }

  if (prefs.fontFamily) document.documentElement.style.setProperty('--font-main', prefs.fontFamily);
  if (prefs.fontSize)   document.documentElement.style.setProperty('--font-size-base', `${prefs.fontSize}px`);
}

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8,  transition: { duration: 0.2 } },
};

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    applyUserTheme(user?.preferences || {});
  }, [user?.preferences, location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Global aesthetic effects */}
      <ParticleBackground />
      <CustomCursor />

      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
