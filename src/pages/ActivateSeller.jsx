import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, ShieldAlert, Sparkles, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import apiClient from '../services/api';

const ActivateSeller = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser, switchRoleMode, setToken } = useAuth();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load URL search parameters
  useEffect(() => {
    const emailParam = searchParams.get('email') || '';
    const otpParam = searchParams.get('otp') || '';
    setEmail(emailParam);
    setOtp(otpParam);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !otp) {
      return setError('Email and OTP verification code are required.');
    }
    if (password.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/activate-seller', {
        email,
        otp,
        password,
      });

      if (res.data?.success) {
        const { token } = res.data.data;
        
        // 1. Persist token to localStorage immediately
        localStorage.setItem('token', token);
        localStorage.setItem('roleMode', 'shopOwner');

        // 2. Inject token into axios default headers so refreshUser() works immediately
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // 3. Update AuthContext state directly
        setToken(token);

        // 4. Trigger AuthContext state refresh (now axios header is set correctly)
        await refreshUser();
        switchRoleMode('shopOwner');

        setSuccess(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Activation failed. Please check your OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Decorative Brand Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full blur-[140px] opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 70%)' }} />

      <div 
        className="w-full max-w-md rounded-3xl p-8 sm:p-10 relative z-10 shadow-lg"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {/* Success Screen */}
        {success ? (
          <div className="flex flex-col items-center text-center py-6 gap-4 animate-scaleUp">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-green-500 bg-green-500/10 border border-green-500/20">
              <CheckCircle2 size={36} className="animate-bounce" />
            </div>
            <div>
              <h2 className="font-extrabold text-xl tracking-tight" style={{ color: 'var(--text)' }}>
                Account Activated!
              </h2>
              <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Welcome to Local Bazar! Your store is now active and live. Redirecting to your merchant dashboard...
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col items-center text-center">
              <span 
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: '#F97316' }}
              >
                <KeyRound size={22} />
              </span>
              <h2 className="font-extrabold text-xl sm:text-2xl tracking-tight" style={{ color: 'var(--text)' }}>
                Activate Account
              </h2>
              <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--text-muted)' }}>
                Enter your activation details and choose a secure login password
              </p>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/25 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-error animate-fadeIn">
                <ShieldAlert size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                label="Email Address" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                disabled 
              />
              <Input 
                label="Activation OTP Code" 
                type="text" 
                placeholder="6-digit verification code"
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                required 
              />
              
              <div className="relative">
                <Input 
                  label="Choose Password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="At least 8 characters"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 bottom-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <Input 
                label="Confirm Password" 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Repeat password"
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />

              <Button 
                type="submit" 
                variant="primary" 
                loading={loading}
                className="w-full py-3.5 rounded-2xl text-xs font-bold mt-2"
              >
                🚀 Activate & Access Dashboard
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivateSeller;
