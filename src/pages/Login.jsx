import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslate } from '../context/LanguageContext';
import { AlertCircle, Users, Store, ShieldCheck, ArrowRight } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

// ─── GOOGLE SIGN-IN BUTTON ───
const GoogleButton = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-[0.98]"
    style={{
      background: 'var(--card)',
      border: '1.5px solid var(--border)',
      color: 'var(--text)',
      boxShadow: 'var(--shadow-sm)',
    }}
  >
    {/* Google G logo */}
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
    Continue with Google
  </button>
);

// ─── MAIN LOGIN COMPONENT ───
const Login = () => {
  const { login, switchRoleMode } = useAuth();
  const { t } = useTranslate();
  const navigate = useNavigate();
  const location = useLocation();

  // Tab: 'login' | 'register' (kept at Login level for shared tab UI)
  const [activeTab, setActiveTab] = useState('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [multiRoles, setMultiRoles] = useState(null);
  const [googleToast, setGoogleToast] = useState(false);

  const from = location.state?.from
    ? location.state.from.pathname + (location.state.from.search || '')
    : '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) return setError('Please enter both email and password.');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      const loggedUser = res.user;
      const userRoles = loggedUser?.roles || [loggedUser?.role || 'customer'];
      if (userRoles.length > 1) {
        setMultiRoles(userRoles);
      } else {
        const singleRole = userRoles[0] || 'customer';
        switchRoleMode(singleRole);
        if (singleRole === 'shopOwner' || singleRole === 'admin') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }
    } else {
      if (res.unverified) {
        navigate('/signup', { state: { email: res.email } });
      } else {
        setError(res.message);
      }
    }
  };

  const handleChooseRole = (chosenRole) => {
    switchRoleMode(chosenRole);
    navigate(chosenRole === 'customer' ? '/storefront' : '/dashboard', { replace: true });
  };

  const handleGoogleClick = () => {
    setGoogleToast(true);
    setTimeout(() => setGoogleToast(false), 3000);
  };

  // ─── MULTI-ROLE SELECTOR ───
  if (multiRoles) {
    return (
      <div className="flex flex-col gap-5 px-8 py-7 animate-fadeIn">
        <div className="text-center">
          <h3 className="text-base font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
            Select Active Portal
          </h3>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Your account has multiple roles. Choose which portal to enter.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {multiRoles.includes('customer') && (
            <button
              onClick={() => handleChooseRole('customer')}
              className="text-left p-4 rounded-2xl flex items-center justify-between group cursor-pointer transition-all duration-200"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
                  <Users size={17} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>Customer Portal</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Shop from local stores</p>
                </div>
              </div>
              <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}

          {multiRoles.includes('shopOwner') && (
            <button
              onClick={() => handleChooseRole('shopOwner')}
              className="text-left p-4 rounded-2xl flex items-center justify-between group cursor-pointer transition-all duration-200"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.1)', color: '#F97316' }}>
                  <Store size={17} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>Merchant Dashboard</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Manage catalog & orders</p>
                </div>
              </div>
              <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}

          {multiRoles.includes('admin') && (
            <button
              onClick={() => handleChooseRole('admin')}
              className="text-left p-4 rounded-2xl flex items-center justify-between group cursor-pointer transition-all duration-200"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                  <ShieldCheck size={17} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>Platform Administrator</p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Super-admin controls</p>
                </div>
              </div>
              <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── STANDARD AUTH RENDER ───
  return (
    <div className="animate-fadeIn">
      {/* Login / Register Tab switcher */}
      <div
        className="flex border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
          onClick={() => setActiveTab('login')}
        >
          Login
        </button>
        <Link
          to="/signup"
          className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => setActiveTab('register')}
        >
          Register
        </Link>
      </div>

      {/* Form body */}
      <div className="px-8 py-7 flex flex-col gap-5">
        {/* Error alert */}
        {error && (
          <div
            className="flex items-start gap-2.5 text-xs rounded-xl p-3 animate-fadeIn"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}
          >
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google toast */}
        {googleToast && (
          <div
            className="flex items-center gap-2 text-xs rounded-xl p-3 animate-fadeIn"
            style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: '#F97316' }}
          >
            <span>🚀</span>
            <span>Google Sign-in coming soon! Please use email for now.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email address"
            type="email"
            placeholder="hello@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/* Forgot password */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs font-semibold transition-colors"
                style={{ color: '#F97316' }}
                onClick={() => alert('Password reset coming soon!')}
              >
                Forgot password?
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" loading={loading} className="w-full py-3 text-sm mt-1">
            Login
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>or continue with</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        {/* Google Sign-in */}
        <GoogleButton onClick={handleGoogleClick} />

        {/* Register link */}
        <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-bold transition-colors"
            style={{ color: '#F97316' }}
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
