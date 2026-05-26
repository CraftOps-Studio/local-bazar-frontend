import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useTranslate } from '../context/LanguageContext';
import { Sun, Moon, ArrowLeft } from 'lucide-react';

const AuthLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg text-brand-text transition-colors duration-300 relative px-4 py-8 overflow-hidden">
      
      {/* Background elegant radial blur glow rings */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />

      {/* Floating Utilities */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2.5 bg-brand-surface border border-brand-border rounded-xl text-brand-muted hover:text-primary transition-colors"
          title={t('themeLabel')}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-muted hover:text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          <span>{t('home')}</span>
        </Link>
      </div>

      {/* Centered Auth Box Card */}
      <div className="w-full max-w-md glass rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 border border-brand-border/60">
        
        {/* Core Layout Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-2xl font-bold shadow-md shadow-primary/20 hover:scale-105 transition-transform mb-3">
            🛍️
          </Link>
          <h2 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-text to-violet-300 bg-clip-text text-transparent">
            {t('brandName')}
          </h2>
          <p className="text-xs text-brand-muted mt-1 text-center font-medium">
            {t('tagline')}
          </p>
        </div>

        {/* Auth Subpage Injections */}
        <Outlet />

      </div>

    </div>
  );
};

export default AuthLayout;
