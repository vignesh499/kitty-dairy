import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DiaryProvider } from './context/DiaryContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import CustomCursor from './components/effects/CustomCursor';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import PinLockPage from './pages/auth/PinLockPage';
import DiaryPage from './pages/diary/DiaryPage';
import EntriesPage from './pages/entries/EntriesPage';
import SettingsPage from './pages/settings/SettingsPage';

// Pin route guard
function PinRoute() {
  const { user, loading, pinVerified } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (pinVerified) return <Navigate to="/diary" replace />;
  return <PinLockPage />;
}

// Public route guard (redirect if already logged in)
function PublicRoute({ children }) {
  const { user, loading, pinVerified } = useAuth();
  if (loading) return null;
  if (user && pinVerified) return <Navigate to="/diary" replace />;
  if (user && !pinVerified) return <Navigate to="/pin" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DiaryProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(244, 114, 182, 0.3)',
                color: '#7e22ce',
                fontFamily: 'Nunito, sans-serif',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(244, 114, 182, 0.15)',
              },
              success: { iconTheme: { primary: '#f472b6', secondary: 'white' } },
              error: { iconTheme: { primary: '#f43f5e', secondary: 'white' } },
            }}
          />
          <CustomCursor />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

            {/* PIN Route */}
            <Route path="/pin" element={<PinRoute />} />

            {/* Protected app routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/diary" replace />} />
              <Route path="diary" element={<DiaryPage />} />
              <Route path="entries" element={<EntriesPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/diary" replace />} />
          </Routes>
        </DiaryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
