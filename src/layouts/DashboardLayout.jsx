import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslate } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, ShoppingBag, ClipboardList, BarChart3, 
  Settings, LogOut, Sun, Moon, Globe, Menu, X, ArrowLeft, Store, Loader2, DollarSign, Truck
} from 'lucide-react';
import apiClient from '../services/api';

// Map-pin SVG logo
const MapPinIcon = ({ size = 36 }) => (
  <div
    className="flex items-center justify-center rounded-xl flex-shrink-0"
    style={{
      width: size, height: size,
      background: 'linear-gradient(135deg, #F97316, #FB923C)',
      boxShadow: '0 2px 8px rgba(249,115,22,0.35)',
    }}
  >
    <svg viewBox="0 0 24 24" fill="white" width={size * 0.58} height={size * 0.58}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
    </svg>
  </div>
);

const DashboardLayout = () => {
  const { user, logout, roleMode, switchRoleMode } = useAuth();
  const { lang, setLang, t } = useTranslate();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shop, setShop] = useState(null);
  const [shopLoading, setShopLoading] = useState(true);

  const fetchShop = async () => {
    if (roleMode === 'admin') {
      setShopLoading(false);
      return;
    }
    try {
      setShopLoading(true);
      const res = await apiClient.get('/shops/owner/my-shop');
      if (res.data?.success) {
        setShop(res.data.data.shop);
      }
    } catch (err) {
      console.error('Failed to fetch shop:', err.message);
      // If 404, redirect to shop register
      if (err.response?.status === 404) {
        navigate('/shop-register', { replace: true });
      }
    } finally {
      setShopLoading(false);
    }
  };

  useEffect(() => {
    fetchShop();
  }, [roleMode]);

  const menuItems = roleMode === 'admin'
    ? [
        { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Manage Shops', path: '/dashboard/shops', icon: Store },
        { name: 'Manage Users', path: '/dashboard/users', icon: ClipboardList },
        { name: 'Delivery Agents', path: '/dashboard/delivery-agents', icon: Truck },
        { name: 'Transactions', path: '/dashboard/transactions', icon: DollarSign },
        { name: 'Platform Analytics', path: '/dashboard/analytics', icon: BarChart3 },
        { name: 'Platform Settings', path: '/dashboard/settings', icon: Settings },
      ]
    : [
        { name: t('dashboard'), path: '/dashboard', icon: LayoutDashboard },
        { name: t('products'), path: '/dashboard/products', icon: ShoppingBag },
        { name: t('orders'), path: '/dashboard/orders', icon: ClipboardList },
        { name: t('transactions') || 'Transactions', path: '/dashboard/transactions', icon: DollarSign },
        { name: t('analytics'), path: '/dashboard/analytics', icon: BarChart3 },
        { name: t('settings'), path: '/dashboard/settings', icon: Settings },
      ];

  if (shopLoading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg)', color: 'var(--text)' }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
          <p className="text-xs font-semibold uppercase tracking-wider animate-pulse" style={{ color: 'var(--text-muted)' }}>
            Loading Store Profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex font-sans transition-colors duration-300"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      
      {/* ─── Mobile Sidebar Overlay Backdrop ─── */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar Navigation Drawer ─── */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col w-64 transition-transform duration-300 transform 
          lg:translate-x-0 lg:static lg:h-screen lg:flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: 'var(--card)', borderRight: '1px solid var(--border)' }}
      >
        
        {/* Sidebar Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <Link to="/" className="flex items-center gap-2">
            <MapPinIcon size={32} />
            <div>
              <h2 className="font-extrabold text-sm tracking-tight" style={{ color: 'var(--text)' }}>
                Local <span style={{ color: '#F97316' }}>Bazar</span>
              </h2>
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Seller Center
              </span>
            </div>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="p-1 lg:hidden rounded-lg border"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 text-xs sm:text-sm font-semibold rounded-xl border transition-all duration-200
                `}
                style={isActive 
                  ? { background: 'rgba(249, 115, 22, 0.08)', borderColor: 'rgba(249, 115, 22, 0.25)', color: '#F97316' }
                  : { background: 'transparent', borderColor: 'transparent', color: 'var(--text-secondary)' }
                }
              >
                <Icon size={16} style={{ color: isActive ? '#F97316' : 'var(--text-muted)' }} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer utility menu */}
        <div className="p-4 border-t space-y-3.5" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
          {/* Quick-links back to public store */}
          <Link 
            to="/storefront" 
            className="flex items-center justify-center gap-2 w-full py-2 border rounded-xl text-xs font-bold transition-all"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <Store size={14} />
            <span>View Storefront</span>
          </Link>

          {/* User profile brief card */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#F97316] to-[#FB923C] flex items-center justify-center font-bold text-white text-sm shadow-inner shadow-black/20">
              {user?.name?.slice(0, 2).toUpperCase() || 'SB'}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold truncate" style={{ color: 'var(--text)' }}>{user?.name || 'Shop Owner'}</h4>
              <p className="text-[9px] truncate" style={{ color: 'var(--text-muted)' }}>{user?.email || 'owner@bazar.com'}</p>
            </div>
            <button 
              onClick={logout} 
              className="p-1.5 border rounded-lg transition-colors"
              style={{ background: 'transparent', borderColor: 'transparent', color: 'var(--text-muted)' }}
              title={t('logout')}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>

      </aside>

      {/* ─── Dashboard Main Display ─── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Dashboard Dynamic Header */}
        <header 
          className="h-20 border-b flex items-center justify-between px-6 sm:px-8 flex-shrink-0"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 border rounded-xl lg:hidden transition-colors"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              <Menu size={16} />
            </button>
            
            {/* Title / Back home */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
              <Link to="/" className="hover:text-[var(--text)] transition-colors flex items-center gap-1">
                <ArrowLeft size={13} /> {t('home')}
              </Link>
              <span>/</span>
              <span className="font-bold" style={{ color: 'var(--text)' }}>{t('dashboard')}</span>
            </div>
          </div>

          {/* Quick Header Utilities */}
          <div className="flex items-center gap-3">
            
            {/* Multi-role Selector Option */}
            {user?.roles && user.roles.length > 1 && (
              <div 
                className="flex items-center gap-1 border rounded-lg px-2 py-1 text-xs"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <span className="text-[10px] font-bold mr-1 uppercase" style={{ color: 'var(--text-muted)' }}>Portal:</span>
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
                  className="bg-transparent border-none outline-none cursor-pointer pr-1 font-bold text-[11px]"
                  style={{ color: 'var(--text)' }}
                >
                  {user.roles.includes('customer') && <option value="customer">Customer</option>}
                  {user.roles.includes('shopOwner') && <option value="shopOwner">Seller</option>}
                  {user.roles.includes('admin') && <option value="admin">Admin</option>}
                </select>
              </div>
            )}
            
            {/* Lang Dropdown */}
            <div 
              className="flex items-center gap-1 border rounded-lg px-2 py-1 text-xs"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <Globe size={13} style={{ color: 'var(--text-muted)' }} />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer pr-1 font-medium text-[11px]"
                style={{ color: 'var(--text)' }}
              >
                <option value="en">EN</option>
                <option value="ta">தமிழ்</option>
                <option value="hi">हिन्दी</option>
              </select>
            </div>

            {/* Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 border rounded-lg transition-colors"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

          </div>
        </header>

        {/* Dashboard Outlet Content Wrapper */}
        <main className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 sm:py-8" style={{ background: 'var(--bg)' }}>
          <Outlet context={{ shop, setShop, refreshShop: fetchShop }} />
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
