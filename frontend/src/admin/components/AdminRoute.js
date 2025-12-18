import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/auth';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuthStore();
  
  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    // Redirect to home page if not admin
    return <Navigate to="/" replace />;
  }

  return children;
}
