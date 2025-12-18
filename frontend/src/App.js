import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Index from './user/pages/Home';
import Products from './user/pages/Products';
import AboutUs from './user/pages/AboutUs';
import Contact from './user/pages/Contact';
import Login from './Login';
import Checkout from './user/pages/Checkout';
import OrderHistory from './user/pages/OrderHistory';
import TrackOrder from './user/pages/TrackOrder';
import ProductDetail from './user/pages/ProductDetail';
import ProductComparison from './user/pages/ProductComparison';
import ProtectedRoute from './user/components/ProtectedRoute';
import AdminRoute from './admin/components/AdminRoute';
import NotFound from './user/pages/NotFound';
import AdminDashboard from './admin/AdminDashboard';

const App = () => (
    <>
      <Toaster position="top-center" richColors />
      <BrowserRouter>
      <Routes>
        {/* Public routes - no authentication required */}
        <Route path="/" element={<Index />} />  
        <Route path="/home" element={<Index />} />  
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/compare" element={<ProductComparison />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected user routes - authentication required */}
        <Route path="/home" element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute> 
        } />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <OrderHistory />
          </ProtectedRoute>
        } />
        <Route path="/track-order/:orderId" element={
          <ProtectedRoute>
            <TrackOrder />
          </ProtectedRoute>
        } />
        
        {/* Admin routes - admin role required */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/:section" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        
        {/* 404 page */}
        <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
);

export default App;