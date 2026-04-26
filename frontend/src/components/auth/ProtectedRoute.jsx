import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading, pinVerified } = useAuth();

  if (loading) {
    return (
      <div className="diary-bg flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">💖</div>
          <p className="text-purple-400 animate-pulse font-medium">Opening your diary...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!pinVerified) return <Navigate to="/pin" replace />;
  return children;
}
