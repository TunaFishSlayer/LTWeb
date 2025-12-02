import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Index from './pages/Home';
import Products from './pages/Products';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import TrackOrder from './pages/TrackOrder';
import ProductDetail from './pages/ProductDetail';
import ProductComparison from './pages/ProductComparison';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';

const App = () => (
    <>
      <Toaster position="top-center" richColors />
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/compare" element={<ProductComparison />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<Checkout />} />
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
        <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
);

export default App;