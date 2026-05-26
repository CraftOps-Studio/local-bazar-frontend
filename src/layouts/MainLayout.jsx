import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslate } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { ShoppingBag, Globe, Sun, Moon, LogOut, User, LayoutDashboard, ShoppingCart, Search, Menu, X, Store, ClipboardList } from 'lucide-react';

const MainLayout = () => {
  const { user, logout, isAuthenticated, isShopOwner, roleMode, switchRoleMode } = useAuth();
  const { lang, setLang, t } = useTranslate();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  // Calculate actual total items count in cart dynamically
  const getCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    } catch (err) {
      return 0;
    }
  };

  const [cartCount, setCartCount] = useState(getCartCount);

  useEffect(() => {
    const handleCartUpdate = () => {
      setCartCount(getCartCount());
    };
    
    // Initial fetch on mount
    handleCartUpdate();

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/storefront?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text transition-colors duration-300">
      {/* ─── Premium Sticky Navbar ─── */}
      <header className="sticky top-0 z-50 glass shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <span className="w-10 h-10 bg-gradient-to-tr from-primary to-violet-400 rounded-xl flex items-center justify-center text-xl font-bold shadow-md shadow-primary/20 transform group-hover:scale-105 transition-transform">
                🛍️
              </span>
              <div className="hidden sm:block">
                <h1 className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-brand-text to-violet-300 bg-clip-text text-transparent">
                  {t('brandName')}
                </h1>
                <p className="text-[10px] text-brand-muted font-medium uppercase tracking-wider -mt-0.5">
                  {t('tagline')}
                </p>
              </div>
            </Link>

            {/* Quick Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full bg-brand-surface-2 border border-brand-border rounded-full py-2 pl-4 pr-10 outline-none text-sm text-brand-text placeholder-brand-muted focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-primary transition-colors">
                <Search size={17} />
              </button>
            </form>

            {/* Right Desktop Nav Utilities */}
            <nav className="hidden lg:flex items-center gap-4">
              
              {/* Language Selector */}
              <div className="flex items-center gap-1 bg-brand-surface-2 border border-brand-border rounded-lg px-2.5 py-1.5 text-xs font-semibold cursor-pointer text-brand-text hover:border-primary transition-colors">
                <Globe size={14} className="text-brand-muted" />
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="bg-transparent border-none outline-none cursor-pointer pr-1 text-brand-text font-sans font-medium"
                >
                  <option value="en" className="bg-brand-surface">English</option>
                  <option value="ta" className="bg-brand-surface">தமிழ்</option>
                  <option value="hi" className="bg-brand-surface">हिन्दी</option>
                </select>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 bg-brand-surface-2 border border-brand-border rounded-lg text-brand-muted hover:text-primary hover:border-primary transition-colors"
                title={t('themeLabel')}
              >
                {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              {/* Shopping Cart Drawer Trigger */}
              <Link
                to="/cart"
                className="p-2 bg-brand-surface-2 border border-brand-border rounded-lg text-brand-muted hover:text-primary hover:border-primary transition-colors relative flex items-center"
              >
                <ShoppingCart size={17} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-primary to-violet-500 text-white font-bold text-[9px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Authentication Menu */}
              <div className="h-5 w-[1px] bg-brand-border"></div>
              
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/orders"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-brand-surface-2 border border-brand-border rounded-lg text-brand-text hover:border-primary transition-all"
                  >
                    <ClipboardList size={14} className="text-primary" />
                    <span>My Orders</span>
                  </Link>
                  {/* Multi-role Selector Option */}
                  {user?.roles && user.roles.length > 1 && (
                    <div className="flex items-center gap-1 bg-brand-surface-2 border border-brand-border rounded-lg px-2.5 py-1.5 text-xs">
                      <span className="text-[10px] text-brand-muted font-bold mr-1 uppercase">Portal:</span>
                      <select
                        value={roleMode || 'customer'}
                        onChange={(e) => {
                          switchRoleMode(e.target.value);
                          if (e.target.value === 'customer') {
                            navigate('/storefront');
                          } else {
                            navigate('/dashboard');
                          }
                        }}
                        className="bg-transparent border-none outline-none cursor-pointer pr-1 text-brand-text font-bold text-[11px]"
                      >
                        {user.roles.includes('customer') && <option value="customer" className="bg-brand-surface">Customer</option>}
                        {user.roles.includes('shopOwner') && <option value="shopOwner" className="bg-brand-surface">Seller</option>}
                        {user.roles.includes('admin') && <option value="admin" className="bg-brand-surface">Admin</option>}
                      </select>
                    </div>
                  )}

                  {isShopOwner ? (
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary/10 border border-primary/20 rounded-lg text-primary hover:bg-primary/20 transition-all"
                    >
                      <LayoutDashboard size={14} />
                      <span>{t('dashboard')}</span>
                    </Link>
                  ) : (
                    user?.role !== 'admin' && (
                      <Link
                        to="/shop-register"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary/10 border border-primary/20 rounded-lg text-primary hover:bg-primary/20 transition-all"
                      >
                        <Store size={14} />
                        <span>{t('shopRegister')}</span>
                      </Link>
                    )
                  )}
                  
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-brand-surface-2 border border-brand-border rounded-lg text-brand-muted hover:text-error hover:border-error/20 transition-all"
                  >
                    <LogOut size={14} />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Link
                    to="/login"
                    className="text-xs font-bold text-brand-text hover:text-primary transition-colors"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-primary to-violet-500 hover:from-primary-hover rounded-xl text-white shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5"
                  >
                    {t('signup')}
                  </Link>
                </div>
              )}
            </nav>

            {/* Mobile Actions (Menu Toggle) */}
            <div className="flex lg:hidden items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 bg-brand-surface-2 border border-brand-border rounded-lg text-brand-muted hover:text-primary transition-colors"
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              
              <Link to="/cart" className="p-2 bg-brand-surface-2 border border-brand-border rounded-lg text-brand-muted hover:text-primary transition-colors relative">
                <ShoppingCart size={15} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white font-bold text-[8px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 bg-brand-surface-2 border border-brand-border rounded-lg text-brand-muted hover:text-primary transition-colors"
              >
                {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
              </button>
            </div>

          </div>
        </div>

        {/* ─── Mobile Dropdown Menu ─── */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-brand-border bg-brand-surface/95 backdrop-blur-xl px-4 py-4 space-y-4 animate-fadeIn">
            {/* Search Input for Mobile */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full bg-brand-surface-2 border border-brand-border rounded-xl py-2 pl-4 pr-10 outline-none text-xs"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted">
                <Search size={14} />
              </button>
            </form>

            <div className="flex items-center justify-between border-b border-brand-border/40 pb-3">
              <span className="text-xs font-semibold text-brand-muted flex items-center gap-1.5">
                <Globe size={13} /> {t('languageLabel')}
              </span>
              <div className="flex gap-2">
                {['en', 'ta', 'hi'].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded ${
                      lang === l ? 'bg-primary text-white' : 'bg-brand-surface-2 text-brand-muted'
                    }`}
                  >
                    {l === 'en' ? 'EN' : l === 'ta' ? 'தமிழ்' : 'हिन्दी'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 bg-brand-surface-2 border border-brand-border rounded-xl text-brand-text font-bold text-xs"
                  >
                    <ClipboardList size={14} className="text-primary" />
                    <span>My Orders</span>
                  </Link>

                  {/* Multi-role Selector Option */}
                  {user?.roles && user.roles.length > 1 && (
                    <div className="flex items-center justify-between py-2 px-4 bg-brand-surface-2 border border-brand-border rounded-xl text-brand-text text-xs">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-brand-muted">Active Portal</span>
                      <select
                        value={roleMode || 'customer'}
                        onChange={(e) => {
                          switchRoleMode(e.target.value);
                          setMobileMenuOpen(false);
                          if (e.target.value === 'customer') {
                            navigate('/storefront');
                          } else {
                            navigate('/dashboard');
                          }
                        }}
                        className="bg-transparent border-none outline-none cursor-pointer pr-1 text-brand-text font-bold text-xs"
                      >
                        {user.roles.includes('customer') && <option value="customer" className="bg-brand-surface">Customer</option>}
                        {user.roles.includes('shopOwner') && <option value="shopOwner" className="bg-brand-surface">Seller</option>}
                        {user.roles.includes('admin') && <option value="admin" className="bg-brand-surface">Admin</option>}
                      </select>
                    </div>
                  )}

                  {isShopOwner ? (
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-2.5 bg-primary/10 border border-primary/20 rounded-xl text-primary font-bold text-xs"
                    >
                      <LayoutDashboard size={14} />
                      {t('dashboard')}
                    </Link>
                  ) : (
                    user?.role !== 'admin' && (
                      <Link
                        to="/shop-register"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-2 py-2.5 bg-primary/10 border border-primary/20 rounded-xl text-primary font-bold text-xs"
                      >
                        <Store size={14} />
                        {t('shopRegister')}
                      </Link>
                    )
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 bg-brand-surface-2 border border-brand-border rounded-xl text-brand-muted hover:text-error font-bold text-xs"
                  >
                    <LogOut size={14} />
                    {t('logout')}
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 bg-brand-surface-2 border border-brand-border rounded-xl font-bold text-xs"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center py-2.5 bg-gradient-to-r from-primary to-violet-500 rounded-xl font-bold text-xs text-white"
                  >
                    {t('signup')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ─── Main Content Outlet ─── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      {/* ─── Premium Footer ─── */}
      <footer className="bg-brand-surface border-t border-brand-border/60 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h4 className="font-extrabold text-md text-brand-text mb-1 flex items-center gap-1.5 justify-center md:justify-start">
              🛍️ {t('brandName')}
            </h4>
            <p className="text-xs text-brand-muted">{t('tagline')}</p>
          </div>
          <div className="flex gap-6 text-xs text-brand-muted">
            <Link to="/storefront" className="hover:text-primary transition-colors">Find Shops</Link>
            <Link to="/shop-register" className="hover:text-primary transition-colors">{t('shopRegister')}</Link>
            <a href="https://razorpay.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Security</a>
          </div>
          <div className="text-xs text-brand-muted font-sans font-medium text-center md:text-right">
            &copy; {new Date().getFullYear()} Local Bazar. Secured with Razorpay in India.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
