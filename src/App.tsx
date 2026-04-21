import { useEffect } from 'react';
import { RouterProvider, useRouter, useMatch } from './context/RouterContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ToastContainer from './components/shared/ToastContainer';

import Header from './components/customer/Header';
import Footer from './components/customer/Footer';
import AdminSidebar from './components/admin/AdminSidebar';

import HomePage from './pages/customer/HomePage';
import CatalogPage from './pages/customer/CatalogPage';
import ProductPage from './pages/customer/ProductPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderConfirmationPage from './pages/customer/OrderConfirmationPage';
import ContactPage from './pages/customer/ContactPage';

import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCakesPage from './pages/admin/AdminCakesPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { navigate } = useRouter();

  useEffect(() => {
    if (!loading && !user) navigate('/admin/login');
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-200 border-t-amber-600 animate-spin" />
      </div>
    );
  }
  if (!user) return null;
  return <>{children}</>;
}

function AppRoutes() {
  const { path } = useRouter();
  const isAdmin = path.startsWith('/admin');
  const productMatch = useMatch('/cake/:slug');
  const slug = productMatch?.slug;

  if (isAdmin) {
    if (path === '/admin/login') {
      return <AdminLoginPage />;
    }
    return (
      <AdminGuard>
        <div className="flex min-h-screen bg-stone-50">
          <AdminSidebar />
          <main className="flex-1 lg:ml-64 min-h-screen overflow-x-hidden">
            {path === '/admin/dashboard' && <AdminDashboardPage />}
            {path === '/admin/cakes' && <AdminCakesPage />}
            {path === '/admin/orders' && <AdminOrdersPage />}
          </main>
        </div>
      </AdminGuard>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {path === '/' && <HomePage />}
        {path === '/catalog' && <CatalogPage />}
        {path.startsWith('/cake/') && slug && <ProductPage slug={slug} />}
        {path === '/cart' && <CartPage />}
        {path === '/checkout' && <CheckoutPage />}
        {path === '/order-confirmation' && <OrderConfirmationPage />}
        {path === '/contact' && <ContactPage />}
        {![
          '/', '/catalog', '/cart', '/checkout', '/order-confirmation', '/contact'
        ].includes(path) && !path.startsWith('/cake/') && (
          <div className="min-h-screen flex items-center justify-center pt-20">
            <div className="text-center">
              <h1 className="font-serif text-6xl font-bold text-[#2C1810] mb-4">404</h1>
              <p className="text-stone-500 mb-6">Page not found</p>
              <a href="/" className="text-amber-600 hover:underline font-medium">Return Home</a>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <AppRoutes />
            <ToastContainer />
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </RouterProvider>
  );
}

export default App;
