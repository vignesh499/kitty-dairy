import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

export function applyUserTheme(prefs = {}) {
  const theme  = prefs.theme  || 'pastel';
  const bgType = prefs.backgroundType || 'theme-default';

  document.body.setAttribute('data-theme', theme);
  document.body.style.background         = '';
  document.body.style.backgroundImage    = '';
  document.body.style.backgroundSize     = '';
  document.body.style.backgroundPosition = '';
  document.body.style.backgroundAttachment = '';

  if (bgType === 'color') {
    document.body.style.background = prefs.backgroundColor || '';
  } else if (bgType === 'gradient') {
    document.body.style.background = prefs.backgroundGradient || '';
  } else if (bgType === 'image' && prefs.backgroundImage) {
    document.body.style.backgroundImage      = `url(${prefs.backgroundImage})`;
    document.body.style.backgroundSize       = 'cover';
    document.body.style.backgroundPosition   = 'center';
    document.body.style.backgroundAttachment = 'fixed';
  }

  if (prefs.fontFamily) document.documentElement.style.setProperty('--font-main', prefs.fontFamily);
  if (prefs.fontSize)   document.documentElement.style.setProperty('--font-size-base', `${prefs.fontSize}px`);
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Re-apply saved theme on EVERY route change so Settings preview never leaks
  useEffect(() => {
    applyUserTheme(user?.preferences || {});
  }, [user?.preferences, location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
