import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../lib/auth';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    // Redirect to the login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
}
