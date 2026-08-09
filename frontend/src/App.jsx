import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AuthInitializer from './components/AuthInitializer';
import ToastContainer from './components/ToastContainer';

// Lazy load pages for better performance
import { lazy, Suspense } from 'react';

// Lazy loaded components
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Admin pages
const AdminPage = lazy(() => import('./pages/AdminPage'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

// Wrapper for lazy loaded components
const LazyWrapper = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

// Router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'products',
        element: (
          <LazyWrapper>
            <ProductsPage />
          </LazyWrapper>
        )
      },
      {
        path: 'products/:id',
        element: (
          <LazyWrapper>
            <ProductDetailPage />
          </LazyWrapper>
        )
      },
      {
        path: 'categories',
        element: (
          <LazyWrapper>
            <CategoriesPage />
          </LazyWrapper>
        )
      },
      {
        path: 'categories/:slug',
        element: (
          <LazyWrapper>
            <CategoryPage />
          </LazyWrapper>
        )
      },
      {
        path: 'search',
        element: (
          <LazyWrapper>
            <SearchPage />
          </LazyWrapper>
        )
      },
      {
        path: 'cart',
        element: (
          <LazyWrapper>
            <CartPage />
          </LazyWrapper>
        )
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute>
            <LazyWrapper>
              <CheckoutPage />
            </LazyWrapper>
          </ProtectedRoute>
        )
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <LazyWrapper>
              <ProfilePage />
            </LazyWrapper>
          </ProtectedRoute>
        )
      },
      {
        path: 'orders',
        element: (
          <ProtectedRoute>
            <LazyWrapper>
              <OrdersPage />
            </LazyWrapper>
          </ProtectedRoute>
        )
      },
      {
        path: 'orders/:id',
        element: (
          <ProtectedRoute>
            <LazyWrapper>
              <OrderDetailPage />
            </LazyWrapper>
          </ProtectedRoute>
        )
      },
      {
        path: 'wishlist',
        element: (
          <ProtectedRoute>
            <LazyWrapper>
              <WishlistPage />
            </LazyWrapper>
          </ProtectedRoute>
        )
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <LazyWrapper>
              <SettingsPage />
            </LazyWrapper>
          </ProtectedRoute>
        )
      },
      {
        path: 'about',
        element: (
          <LazyWrapper>
            <AboutPage />
          </LazyWrapper>
        )
      },
      {
        path: 'contact',
        element: (
          <LazyWrapper>
            <ContactPage />
          </LazyWrapper>
        )
      },
      // Admin routes
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <LazyWrapper>
              <AdminPage />
            </LazyWrapper>
          </AdminRoute>
        )
      },
    ]
  },
  // Auth routes (outside of main layout)
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />
  },
  // 404 page
  {
    path: '*',
    element: (
      <LazyWrapper>
        <NotFoundPage />
      </LazyWrapper>
    )
  }
]);

function App() {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <RouterProvider router={router} />
        <ToastContainer />
      </AuthInitializer>
    </Provider>
  );
}

export default App
