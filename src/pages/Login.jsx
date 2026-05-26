import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslate } from '../context/LanguageContext';
import { Mail, Lock, AlertCircle, Users, Store, ShieldCheck, ArrowRight } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const Login = () => {
  const { login, switchRoleMode } = useAuth();
  const { t } = useTranslate();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [multiRoles, setMultiRoles] = useState(null);

  // Retrieve path to redirect back to, or default to storefront/dashboard
  const from = location.state?.from 
    ? (location.state.from.pathname + (location.state.from.search || '')) 
    : '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      return setError('Please enter both email and password.');
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      const loggedUser = res.user;
      const userRoles = loggedUser?.roles || [loggedUser?.role || 'customer'];

      if (userRoles.length > 1) {
        // Expose multi-role selector card views!
        setMultiRoles(userRoles);
      } else {
        // Single role, switch and route normally
        const singleRole = userRoles[0] || 'customer';
        switchRoleMode(singleRole);
        
        if (singleRole === 'shopOwner' || singleRole === 'admin') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }
    } else {
      setError(res.message);
    }
  };

  const handleChooseRole = (chosenRole) => {
    switchRoleMode(chosenRole);
    if (chosenRole === 'customer') {
      navigate('/storefront', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  // ─── RENDERING MULTI-ROLE SELECTOR SCREEN ───
  if (multiRoles) {
    return (
      <div className="flex flex-col gap-6 animate-fadeIn">
        <div className="text-center">
          <h3 className="text-xl font-extrabold tracking-tight">Select Active Portal</h3>
          <p className="text-xs text-brand-muted mt-1 max-w-xs mx-auto">
            Your account has multi-role credentials. Choose which portal you would like to enter.
          </p>
        </div>

        <div className="flex flex-col gap-3.5 mt-2">
          {multiRoles.includes('customer') && (
            <button
              onClick={() => handleChooseRole('customer')}
              className="glass glass-hover text-left p-5 border border-brand-border rounded-2xl flex items-center justify-between group cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Users size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-brand-text group-hover:text-primary transition-colors">
                    Customer Portal
                  </h4>
                  <p className="text-[10px] text-brand-muted mt-0.5 font-sans font-medium">
                    Shop fresh organic local stock and track your orders.
                  </p>
                </div>
              </div>
              <ArrowRight size={14} className="text-brand-muted group-hover:translate-x-1 group-hover:text-primary transition-all shrink-0" />
            </button>
          )}

          {multiRoles.includes('shopOwner') && (
            <button
              onClick={() => handleChooseRole('shopOwner')}
              className="glass glass-hover text-left p-5 border border-brand-border rounded-2xl flex items-center justify-between group cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Store size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-brand-text group-hover:text-primary transition-colors">
                    Merchant Dashboard
                  </h4>
                  <p className="text-[10px] text-brand-muted mt-0.5 font-sans font-medium">
                    Manage catalog listings, fulfill client orders, and view sales.
                  </p>
                </div>
              </div>
              <ArrowRight size={14} className="text-brand-muted group-hover:translate-x-1 group-hover:text-primary transition-all shrink-0" />
            </button>
          )}

          {multiRoles.includes('admin') && (
            <button
              onClick={() => handleChooseRole('admin')}
              className="glass glass-hover text-left p-5 border border-brand-border rounded-2xl flex items-center justify-between group cursor-pointer transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-brand-text group-hover:text-primary transition-colors">
                    Platform Administrator
                  </h4>
                  <p className="text-[10px] text-brand-muted mt-0.5 font-sans font-medium">
                    Super-admin reporting, merchants review approvals, and security.
                  </p>
                </div>
              </div>
              <ArrowRight size={14} className="text-brand-muted group-hover:translate-x-1 group-hover:text-primary transition-all shrink-0" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── STANDARD LOGIN RENDER ───
  return (
    <div className="flex flex-col gap-6">
      
      {/* Page header title */}
      <div className="text-center sm:text-left">
        <h3 className="text-xl font-extrabold tracking-tight">{t('login')}</h3>
        <p className="text-xs text-brand-muted mt-1">Access your account to manage store or place orders</p>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/25 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-error animate-fadeIn">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* Email Input */}
        <Input
          label="Email Address"
          type="email"
          placeholder="riya@example.com"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password Input */}
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Action Button */}
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full mt-2"
        >
          {t('login')}
        </Button>

      </form>

      {/* Footer redirection link */}
      <div className="text-center text-xs text-brand-muted border-t border-brand-border/40 pt-4 mt-2">
        <span>Don't have an account? </span>
        <Link 
          to="/signup" 
          className="font-bold text-primary hover:text-primary-hover hover:underline transition-colors ml-1"
        >
          {t('signup')}
        </Link>
      </div>

    </div>
  );
};

export default Login;
