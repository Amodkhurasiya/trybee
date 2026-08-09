// Layout component for consistent page structure
import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectIsAuthenticated,
  selectUser,
  logout,
} from '../store/authSlice';
import {
  selectCartTotalItems,
  selectCartOpen,
  toggleCart,
  fetchCartSummary,
} from '../store/cartSlice';
import CartSidebar from './CartSidebar';
import { fetchWishlist } from '../store/userSlice';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Keep navbar and dropdown gradients in sync
  const navbarGradientStyle = {
    background: 'linear-gradient(90deg, #0b6a4f 24%, #10b971 110%)',
  };

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const cartItemsCount = useSelector(selectCartTotalItems);
  const isCartOpen = useSelector(selectCartOpen);

  // Fetch cart summary when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCartSummary());
      dispatch(fetchWishlist());
    }
  }, [isAuthenticated, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    setIsMobileMenuOpen(false);
  };

  const handleCartToggle = () => {
    dispatch(toggleCart());
  };

  // Scroll to top on route change
  useEffect(() => {
    // Use smooth behavior for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const isActivePage = (path) => {
    return location.pathname === path
      ? 'text-indigo-600'
      : 'text-gray-700 hover:text-indigo-600';
  };

  const handleSearchClick = () => {
    navigate('/search');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 font-gilroy" style={navbarGradientStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 relative w-44 h-20 overflow-visible -ml-4 sm:-ml-6 lg:-ml-8">
              <Link to="/" className="block w-full h-full relative">
                <img
                  src="/Trybee-Logo.svg"
                  alt="Trybee logo"
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-60 w-auto object-contain select-none pointer-events-none"
                />
                <span className="sr-only">Home</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className={`transition-colors duration-200 font-medium text-white `}>
                Home
              </Link>
              <Link to="/products" className={`transition-colors duration-200 font-medium text-white `}>
                Products
              </Link>
              <Link to="/categories" className={`transition-colors duration-200 font-medium text-white `}>
                Categories
              </Link>
              <Link to="/about" className={`transition-colors duration-200 font-medium text-white `}>
                About
              </Link>
              <Link to="/contact" className={`transition-colors duration-200 font-medium text-white `}>
                Contact
              </Link>
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Search button */}
              <button
                onClick={handleSearchClick}
                className="transition-colors duration-200 text-white"
                title="Search products"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Cart button */}
              <button onClick={handleCartToggle} className="relative text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m.6 8v6a1 1 0 001 1h8a1 1 0 001-1v-6M7 13l-2-8H3m10 8a2 2 0 11-4 0m4 0a2 2 0 11-4 0" />
                </svg>
                {cartItemsCount > 0 && (
                  <span
                    className="absolute -top-2 -right-2 text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    style={{ backgroundColor: '#ffffff', color: '#065f46' }}
                  >
                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                  </span>
                )}
              </button>

              {/* User menu */}
              {/*isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center text-white">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#ffffff', color: '#065f46' }}
                      >
                        <span className="text-sm font-medium">
                          {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button> */}

                {/* User menu */}
{isAuthenticated ? (
  <div className="relative group">
    <button className="flex items-center text-white">
      {user?.avatarUrl ? (
        <img
          src={
            user.avatarUrl.startsWith('http')
              ? user.avatarUrl
              : `https://trybee.onrender.com${user.avatarUrl}`
          }
          alt="Avatar"
          className="w-8 h-8 rounded-full object-cover border border-gray-200"
        />
      ) : (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#ffffff', color: '#065f46' }}
        >
          <span className="text-sm font-medium">
            {user?.firstName?.charAt(0) ||
              user?.email?.charAt(0) ||
              'U'}
          </span>
        </div>
      )}

      <svg
        className="ml-1 w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

                  {/* Dropdown menu */}
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-md shadow-lg py-2 z-50 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200"
                    style={navbarGradientStyle}
                  >
                    <Link to="/profile" className="block px-4 py-2 text-base text-white">
                      Your Profile
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 text-base text-white">
                      Your Orders
                    </Link>
                    <Link to="/settings" className="block px-4 py-2 text-base text-white">
                      Settings
                    </Link>
                    {(user?.role === 'admin' || user?.isAdmin) && (
                      <>
                        <div className="my-1" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.25)' }}></div>
                        <Link to="/admin" className="block px-4 py-2 text-base font-medium text-white">
                          🛠️ Admin Panel
                        </Link>
                      </>
                    )}
                    <div className="my-1" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.25)' }}></div>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-base text-white">
                      Sign out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login" className="font-medium text-white">
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 border"
                    style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.7)' }}
                  >
                    Sign up
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.25)' }}>
              <div className="flex flex-col space-y-2">
                <Link to="/" className="block px-3 py-2 font-medium text-white" onClick={() => setIsMobileMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/products" className="block px-3 py-2 font-medium text-white" onClick={() => setIsMobileMenuOpen(false)}>
                  Products
                </Link>
                <Link to="/categories" className="block px-3 py-2 font-medium text-white" onClick={() => setIsMobileMenuOpen(false)}>
                  Categories
                </Link>
                <Link to="/about" className="block px-3 py-2 font-medium text-white" onClick={() => setIsMobileMenuOpen(false)}>
                  About
                </Link>
                <Link to="/contact" className="block px-3 py-2 font-medium text-white" onClick={() => setIsMobileMenuOpen(false)}>
                  Contact
                </Link>

                {/* Mobile user menu */}
                {isAuthenticated ? (
                  <div className="pt-2" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.25)' }}>
                    <div className="px-3 py-2 text-sm font-medium text-white">
                      {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email}
                    </div>
                    <Link to="/profile" className="block px-3 py-2 font-medium text-white" onClick={() => setIsMobileMenuOpen(false)}>
                      Your Profile
                    </Link>
                    <Link to="/orders" className="block px-3 py-2 font-medium text-white" onClick={() => setIsMobileMenuOpen(false)}>
                      Your Orders
                    </Link>
                    <Link to="/settings" className="block px-3 py-2 font-medium text-white" onClick={() => setIsMobileMenuOpen(false)}>
                      Settings
                    </Link>
                    {(user?.role === 'admin' || user?.isAdmin) && (
                      <Link
                        to="/admin"
                        className="block px-3 py-2 font-medium rounded-md mx-3 my-1"
                        style={{ color: '#065f46', backgroundColor: '#ffffff' }}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        🛠️ Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout} className="block w-full text-left px-3 py-2 font-medium text-white">
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="pt-2" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.25)' }}>
                    <Link to="/login" className="block px-3 py-2 font-medium text-white" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign in
                    </Link>
                    <Link to="/register" className="block px-3 py-2 font-medium text-white" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="text-white" style={navbarGradientStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Brand section */}
            <div className="col-span-1 md:col-span-2">
              <div className="space-y-3">
                {/*
                  Footer logo: fixed container height controls layout space; the image is absolutely positioned
                  and can be taller to visually overlap the content below without increasing footer height.
                  - Adjust container height (layout space): h-[70px] md:h-[90px]
                  - Adjust visual logo size (overlap): h-[120px] md:h-[150px]
                */}
                <div className="relative h-[70px] md:h-[90px] overflow-visible">
                  <img
                    src="/Trybee-Logo.svg"
                    alt="Trybee"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-[120px] md:h-[220px] w-auto select-none pointer-events-none z-10"
                  />
                </div>
                <p className="text-white/85 leading-relaxed">
                  Discover authentic tribal products crafted with traditional techniques and modern quality standards.
                </p>
                <p className="text-sm text-white/75">No social media — just quality products and support that cares.</p>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Shop</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/products" className="text-white/80 hover:text-white">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link to="/categories/jewelry" className="text-white/80 hover:text-white">
                    Jewelry
                  </Link>
                </li>
                <li>
                  <Link to="/categories/crafts" className="text-white/80 hover:text-white">
                    Crafts
                  </Link>
                </li>
                <li>
                  <Link to="/categories/clothing" className="text-white/80 hover:text-white">
                    Clothing
                  </Link>
                </li>
                <li>
                  <Link to="/categories/textiles" className="text-white/80 hover:text-white">
                    Textiles
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/contact" className="text-white/80 hover:text-white">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/20 text-center">
            <p className="text-white/70">© {new Date().getFullYear()} Trybee. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      <CartSidebar />
    </div>
  );
};

export default Layout;
// End of file
