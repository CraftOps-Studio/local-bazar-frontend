import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslate } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  Search, Sun, Moon, Globe, LogOut, LayoutDashboard, ShoppingCart,
  Store, ClipboardList, Home, User, Menu, X
} from 'lucide-react';
import { LocalBazarLogo } from './AuthLayout';

// ─── MAP-PIN LOGO ICON (small, for nav) ───
const MapPinIcon = ({ size = 20 }) => (
  <div
    className="flex items-center justify-center rounded-xl flex-shrink-0"
    style={{
      width: size,
      height: size,
      background: 'linear-gradient(135deg, #F97316, #FB923C)',
      boxShadow: '0 2px 8px rgba(249,115,22,0.35)',
    }}
  >
    <svg viewBox="0 0 24 24" fill="white" width={size * 0.6} height={size * 0.6}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
    </svg>
  </div>
);

const MainLayout = () => {
  const { user, logout, isAuthenticated, isShopOwner, roleMode, switchRoleMode } = useAuth();
  const { lang, setLang } = useTranslate();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  // ── Cart count ──
  const getCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    } catch { return 0; }
  };
  const [cartCount, setCartCount] = useState(getCartCount);

  useEffect(() => {
    const update = () => setCartCount(getCartCount());
    update();
    window.addEventListener('cartUpdated', update);
    return () => window.removeEventListener('cartUpdated', update);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/storefront?search=${encodeURIComponent(searchVal.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  // ── Bottom Nav items ──
  const bottomNavItems = [
    { label: 'Home',    icon: Home,          to: '/' },
    { label: 'Search',  icon: Search,        to: '/storefront' },
    { label: 'Cart',    icon: ShoppingCart,  to: '/cart',   badge: cartCount },
    { label: 'Orders',  icon: ClipboardList, to: '/orders' },
    { label: 'Profile', icon: User,          to: isAuthenticated ? '/profile' : '/login' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* ─── STICKY NAVBAR ─── */}
      <header
        className="sticky top-0 z-50 transition-colors duration-300"
        style={{
          background: 'var(--card)',
          borderBottom: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <MapPinIcon size={36} />
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="font-extrabold text-base tracking-tight" style={{ color: 'var(--text)' }}>
                  Local <span style={{ color: '#F97316' }}>Bazar</span>
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Your Digital Storefront
                </span>
              </div>
            </Link>

            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
              <input
                type="text"
                placeholder="Search products, shops..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full text-sm rounded-full py-2 pl-4 pr-10 outline-none transition-all"
                style={{
                  background: 'var(--surface)',
                  border: '1.5px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <Search size={15} />
              </button>
            </form>

            {/* Desktop Right Nav */}
            <nav className="hidden lg:flex items-center gap-3">

              {/* Language */}
              <div
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              >
                <Globe size={13} style={{ color: 'var(--text-muted)' }} />
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="bg-transparent border-none outline-none cursor-pointer text-xs font-medium"
                  style={{ color: 'var(--text)' }}
                >
                  <option value="en">English</option>
                  <option value="ta">தமிழ்</option>
                  <option value="hi">हिन्दी</option>
                </select>
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg transition-colors"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              </button>

              {/* Cart */}
              <Link
                to="/cart"
                className="p-2 rounded-lg transition-colors relative"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                <ShoppingCart size={15} />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 text-white font-bold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center"
                    style={{ background: '#F97316', minWidth: '18px', minHeight: '18px', fontSize: '9px', padding: '2px' }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Separator */}
              <div className="w-px h-5" style={{ background: 'var(--border)' }} />

              {/* Auth actions */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/orders"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  >
                    <ClipboardList size={13} style={{ color: '#F97316' }} />
                    My Orders
                  </Link>

                  {/* Role switcher */}
                  {user?.roles && user.roles.length > 1 && (
                    <div
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                    >
                      <span className="text-[10px] font-bold mr-1 uppercase" style={{ color: 'var(--text-muted)' }}>Portal:</span>
                      <select
                        value={roleMode || 'customer'}
                        onChange={(e) => {
                          switchRoleMode(e.target.value);
                          navigate(e.target.value === 'customer' ? '/storefront' : '/dashboard');
                        }}
                        className="bg-transparent border-none outline-none cursor-pointer text-[11px] font-bold"
                        style={{ color: 'var(--text)' }}
                      >
                        {user.roles.includes('customer') && <option value="customer">Customer</option>}
                        {user.roles.includes('shopOwner') && <option value="shopOwner">Seller</option>}
                        {user.roles.includes('admin') && <option value="admin">Admin</option>}
                      </select>
                    </div>
                  )}

                  {isShopOwner ? (
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all"
                      style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', color: '#F97316' }}
                    >
                      <LayoutDashboard size={13} /> Dashboard
                    </Link>
                  ) : (
                    user?.role !== 'admin' && (
                      <Link
                        to="/shop-register"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all"
                        style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', color: '#F97316' }}
                      >
                        <Store size={13} /> Sell with Us
                      </Link>
                    )
                  )}

                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                  >
                    <LogOut size={13} />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/shop-register"
                    className="px-4 py-2 text-xs font-bold rounded-xl text-white transition-all"
                    style={{ background: '#F97316', boxShadow: '0 2px 8px rgba(249,115,22,0.3)' }}
                  >
                    Start Selling
                  </Link>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-xs font-bold rounded-xl transition-colors"
                    style={{ color: 'var(--text)', border: '1.5px solid var(--border)' }}
                  >
                    Login
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile right actions */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg transition-colors"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg transition-colors"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                {mobileMenuOpen ? <X size={15} /> : <Menu size={15} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden px-4 py-4 space-y-3 animate-fadeIn"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--card)' }}
          >
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search shops or products..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full text-sm rounded-xl py-2.5 pl-4 pr-10 outline-none"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                <Search size={14} />
              </button>
            </form>

            {/* Lang */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                <Globe size={13} /> Language
              </span>
              <div className="flex gap-2">
                {['en', 'ta', 'hi'].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all"
                    style={lang === l
                      ? { background: '#F97316', color: 'white' }
                      : { background: 'var(--surface)', color: 'var(--text-muted)' }
                    }
                  >
                    {l === 'en' ? 'EN' : l === 'ta' ? 'தமிழ்' : 'हिन्दी'}
                  </button>
                ))}
              </div>
            </div>

            {/* Auth actions */}
            {isAuthenticated ? (
              <div className="flex flex-col gap-2 pt-2">
                {isShopOwner ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs"
                    style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', color: '#F97316' }}
                  >
                    <LayoutDashboard size={14} /> Dashboard
                  </Link>
                ) : (
                  user?.role !== 'admin' && (
                    <Link
                      to="/shop-register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs"
                      style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', color: '#F97316' }}
                    >
                      <Store size={14} /> Sell with Us
                    </Link>
                  )
                )}
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/shop-register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 rounded-xl font-bold text-xs text-white transition-all"
                  style={{ background: '#F97316' }}
                >
                  Start Selling
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-2.5 rounded-xl font-bold text-xs transition-all"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* ─── MOBILE BOTTOM SPACER ─── */}
      <div className="mobile-bottom-spacer" />

      {/* ─── FOOTER (desktop only) ─── */}
      <footer
        className="hidden lg:block py-8 mt-auto"
        style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <LocalBazarLogo size="sm" />
          <div className="flex gap-6 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Link to="/storefront" className="hover:text-[#F97316] transition-colors">Find Shops</Link>
            <Link to="/shop-register" className="hover:text-[#F97316] transition-colors">Sell with Us</Link>
            <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#F97316] transition-colors">Security</a>
          </div>
          <p className="text-xs text-center md:text-right" style={{ color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} Local Bazar. Powered by Razorpay.
          </p>
        </div>
      </footer>

      {/* ─── MOBILE BOTTOM NAVIGATION BAR ─── */}
      <nav className="bottom-nav">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`bottom-nav-item ${active ? 'active' : ''}`}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                {item.badge > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 text-white font-bold rounded-full flex items-center justify-center"
                    style={{
                      background: '#F97316',
                      fontSize: '8px',
                      minWidth: '16px',
                      minHeight: '16px',
                      padding: '2px',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
};

export default MainLayout;
