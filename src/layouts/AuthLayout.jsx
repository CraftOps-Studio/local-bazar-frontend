import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

// Local Bazar logo — orange circle + map pin + split-color text
export const LocalBazarLogo = ({ size = 'md' }) => {
  const sizes = {
    sm: { icon: 28, text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 40, text: 'text-xl',   sub: 'text-[10px]' },
    lg: { icon: 52, text: 'text-2xl',  sub: 'text-xs' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="flex items-center gap-3">
      {/* Orange circle with map-pin SVG */}
      <div
        className="flex items-center justify-center rounded-2xl flex-shrink-0"
        style={{
          width: s.icon,
          height: s.icon,
          background: 'linear-gradient(135deg, #F97316, #FB923C)',
          boxShadow: '0 4px 12px rgba(249,115,22,0.35)',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="white"
          width={s.icon * 0.55}
          height={s.icon * 0.55}
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
        </svg>
      </div>

      {/* Brand name */}
      <div className="flex flex-col leading-tight">
        <div className={`font-extrabold tracking-tight ${s.text}`}>
          <span style={{ color: 'var(--text)' }}>Local </span>
          <span style={{ color: '#F97316' }}>Bazar</span>
        </div>
        <span
          className={`font-semibold uppercase tracking-widest ${s.sub}`}
          style={{ color: 'var(--text-muted)' }}
        >
          Your Digital Storefront
        </span>
      </div>
    </div>
  );
};

const AuthLayout = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className="min-h-screen flex items-center justify-center relative px-4 py-10 overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Soft orange ambient glow — top left */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full pointer-events-none"
        style={{ background: 'rgba(249,115,22,0.07)', filter: 'blur(80px)' }}
      />
      {/* Subtle glow — bottom right */}
      <div
        className="absolute bottom-[-15%] right-[-15%] w-[55%] h-[55%] rounded-full pointer-events-none"
        style={{ background: 'rgba(249,115,22,0.05)', filter: 'blur(100px)' }}
      />

      {/* Theme toggle — top right */}
      <div className="absolute top-5 right-5">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border transition-all"
          style={{
            background: 'var(--card)',
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)',
            boxShadow: 'var(--shadow-sm)',
          }}
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      {/* Back to home — top left */}
      <div className="absolute top-5 left-5">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Auth Card */}
      <div
        className="w-full max-w-sm relative z-10 rounded-3xl overflow-hidden"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        }}
      >
        {/* Logo header inside card */}
        <div
          className="flex flex-col items-center px-8 pt-8 pb-6"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <LocalBazarLogo size="md" />
          </Link>
        </div>

        {/* Page content (Login or Signup tabs injected here) */}
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
