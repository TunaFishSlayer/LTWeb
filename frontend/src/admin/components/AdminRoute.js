import { Navigate, Routes, Route } from 'react-router-dom';
import { useAuthStore } from '../../lib/auth';
import AdminDashboard from '../AdminDashboard';

export default function AdminRoute() {
  const { isAuthenticated, isAdmin } = useAuthStore();
  
  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    // Redirect to home page if not admin
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/*" element={<AdminDashboard />} />
    </Routes>
  );
}
