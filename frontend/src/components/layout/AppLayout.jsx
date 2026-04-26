import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  // Apply user theme to body
  useEffect(() => {
    if (user?.preferences?.theme) {
      document.body.setAttribute('data-theme', user.preferences.theme);
    }
    if (user?.preferences?.backgroundType === 'color') {
      document.body.style.background = user.preferences.backgroundColor;
    } else if (user?.preferences?.backgroundType === 'gradient') {
      document.body.style.background = user.preferences.backgroundGradient;
    } else if (user?.preferences?.backgroundType === 'image' && user.preferences.backgroundImage) {
      document.body.style.backgroundImage = `url(${user.preferences.backgroundImage})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    }

    if (user?.preferences?.fontFamily) {
      document.documentElement.style.setProperty('--font-main', user.preferences.fontFamily);
    }
    if (user?.preferences?.fontSize) {
      document.documentElement.style.setProperty('--font-size-base', `${user.preferences.fontSize}px`);
    }

    return () => {
      document.body.style.background = '';
      document.body.style.backgroundImage = '';
    };
  }, [user?.preferences]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
