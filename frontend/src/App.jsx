// React 18+ - No need to import React for JSX
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './context/CartContext';
import { StripeProvider } from './contexts/StripeContext';
import ErrorBoundary from './components/ErrorBoundary';
import { TOAST_CONFIG } from './constants';
import Layout from './components/Layout';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Shop from './pages/Shop';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import MyOrders from './pages/MyOrders';

function App() {
  return (
    <ErrorBoundary>
      <StripeProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
          <div className="App">
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Shop />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/offers" element={<Shop />} />

              {/* User Routes */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/settings" element={<Settings />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminPanel />} />
              <Route
                path="/admin/*"
                element={
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/customers" element={<Customers />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </Layout>
                }
              />
            </Routes>
            <Toaster
              position={TOAST_CONFIG.POSITION}
              toastOptions={{
                duration: TOAST_CONFIG.DURATION,
                success: {
                  duration: TOAST_CONFIG.SUCCESS_DURATION,
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#FFFFFF',
                  },
                },
                error: {
                  duration: TOAST_CONFIG.ERROR_DURATION,
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#FFFFFF',
                  },
                },
                style: {
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  color: '#374151',
                  boxShadow:
                    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
              }}
            />
            </div>
            </Router>
          </CartProvider>
        </AuthProvider>
      </StripeProvider>
    </ErrorBoundary>
  );
}

export default App;
