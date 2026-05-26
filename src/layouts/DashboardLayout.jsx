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
      <div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-text">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider animate-pulse">
            Loading Store Profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-brand-bg text-brand-text font-sans transition-colors duration-300">
      
      {/* ─── Mobile Sidebar Overlay Backdrop ─── */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Sidebar Navigation Drawer ─── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-[#0A1E3F] border-r border-white/5 transition-transform duration-300 transform 
        lg:translate-x-0 lg:static lg:h-screen lg:flex-shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Sidebar Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2">
            <span className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-lg font-bold">
              🛍️
            </span>
            <div>
              <h2 className="font-extrabold text-sm tracking-tight text-brand-text">
                {t('brandName')}
              </h2>
              <span className="text-[9px] text-primary font-bold uppercase tracking-wider">
                Seller Center
              </span>
            </div>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="p-1 text-brand-muted hover:text-brand-text lg:hidden bg-brand-surface-2 rounded-lg border border-brand-border"
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
                  ${isActive 
                    ? 'bg-[#1E3A8A]/50 border-[#2563EB]/30 text-white' 
                    : 'border-transparent text-slate-300 hover:text-white hover:bg-[#1E293B]/40'
                  }
                `}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer utility menu */}
        <div className="p-4 border-t border-white/5 space-y-3.5 bg-[#071630]">
          {/* Quick-links back to public store */}
          <Link 
            to="/storefront" 
            className="flex items-center justify-center gap-2 w-full py-2 bg-[#122543] hover:bg-[#1A3157] border border-white/5 rounded-xl text-slate-300 hover:text-white text-xs font-bold transition-all"
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
              <h4 className="text-xs font-bold text-white truncate">{user?.name || 'Shop Owner'}</h4>
              <p className="text-[9px] text-slate-400 truncate">{user?.email || 'owner@bazar.com'}</p>
            </div>
            <button 
              onClick={logout} 
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-[#122543] border border-transparent hover:border-white/5 rounded-lg transition-colors"
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
        <header className="h-20 bg-[#000000] border-b border-white/5 flex items-center justify-between px-6 sm:px-8 flex-shrink-0">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 border border-brand-border rounded-xl text-brand-muted hover:text-brand-text lg:hidden bg-brand-surface-2 transition-colors"
            >
              <Menu size={16} />
            </button>
            
            {/* Title / Back home */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
                <ArrowLeft size={13} /> {t('home')}
              </Link>
              <span>/</span>
              <span className="text-white font-bold">{t('dashboard')}</span>
            </div>
          </div>

          {/* Quick Header Utilities */}
          <div className="flex items-center gap-3">
            
            {/* Multi-role Selector Option */}
            {user?.roles && user.roles.length > 1 && (
              <div className="flex items-center gap-1 bg-brand-surface-2 border border-brand-border rounded-lg px-2 py-1 text-xs">
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
                  {user.roles.includes('customer') && <option value="customer" className="bg-[#0A1E3F]">Customer</option>}
                  {user.roles.includes('shopOwner') && <option value="shopOwner" className="bg-[#0A1E3F]">Seller</option>}
                  {user.roles.includes('admin') && <option value="admin" className="bg-[#0A1E3F]">Admin</option>}
                </select>
              </div>
            )}
            
            {/* Lang Dropdown */}
            <div className="flex items-center gap-1 bg-brand-surface-2 border border-brand-border rounded-lg px-2 py-1 text-xs">
              <Globe size={13} className="text-brand-muted" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer pr-1 text-brand-text font-medium text-[11px]"
              >
                <option value="en" className="bg-brand-surface">EN</option>
                <option value="ta" className="bg-brand-surface">தமிழ்</option>
                <option value="hi" className="bg-brand-surface">हिन्दी</option>
              </select>
            </div>

            {/* Mode Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 bg-brand-surface-2 border border-brand-border rounded-lg text-brand-muted hover:text-primary transition-colors"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

          </div>
        </header>

        {/* Dashboard Outlet Content Wrapper */}
        <main className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 sm:py-8 bg-[#000000]">
          <Outlet context={{ shop, setShop, refreshShop: fetchShop }} />
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
