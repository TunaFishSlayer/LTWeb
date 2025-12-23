import { Navigate, Routes, Route } from 'react-router-dom';
import { useAuthStore } from '../../lib/auth';
import Home from '../pages/Home';
import Checkout from '../pages/Checkout';
import OrderHistory from '../pages/OrderHistory';
import TrackOrder from '../pages/TrackOrder';
import Products from '../pages/Products';
import ProductDetail from '../pages/ProductDetail';
import ProductComparison from '../pages/ProductComparison';
import AboutUs from '../pages/AboutUs';
import Contact from '../pages/Contact';


export default function ProtectedRoute() {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    // Redirect to the login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Only allow access for users with 'user' role (not admin)
  if (!user || user.role?.toLowerCase() !== "user") {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/compare" element={<ProductComparison />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders" element={<OrderHistory />} />
      <Route path="/track-order/:orderId" element={<TrackOrder />} />
      <Route path="*" element={<Navigate to="/user/home" replace />} />
    </Routes>
  );
}
