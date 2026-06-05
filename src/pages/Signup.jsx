import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslate } from '../context/LanguageContext';
import { AlertCircle, CheckCircle } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

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
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
    Continue with Google
  </button>
);

const Signup = () => {
  const { register, verifyEmail, resendOtp } = useAuth();
  const { t } = useTranslate();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [phone, setPhone]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [googleToast, setGoogleToast] = useState(false);

  // OTP Verification state
  const [unverifiedEmail, setUnverifiedEmail] = useState(() => {
    return location.state?.email || '';
  });
  const [otpVal, setOtpVal] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpResentMessage, setOtpResentMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !phone) return setError('Please fill in all required fields.');
    if (phone.length < 10) return setError('Please enter a valid 10-digit mobile number.');

    setLoading(true);
    const res = await register(name, email, password, phone, 'customer');
    setLoading(false);

    if (res.success) {
      setUnverifiedEmail(res.email || email);
    } else {
      setError(res.message);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setOtpResentMessage('');
    if (!otpVal) return setError('Please enter the 6-digit verification code.');

    setOtpLoading(true);
    const res = await verifyEmail(unverifiedEmail, otpVal);
    setOtpLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setOtpResentMessage('');
    const res = await resendOtp(unverifiedEmail);
    if (res.success) {
      setOtpResentMessage('A new verification code has been sent to your email.');
    } else {
      setError(res.message);
    }
  };

  if (unverifiedEmail) {
    return (
      <div className="animate-fadeIn">
        <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
          <button className="auth-tab active" style={{ flex: 1 }}>Verify Email</button>
        </div>

        <div className="px-8 py-7 flex flex-col gap-5">
          <div className="text-center mb-2 flex flex-col items-center">
            <span className="text-3xl mb-2">📧</span>
            <h3 className="font-extrabold text-lg mt-1" style={{ color: 'var(--text)' }}>Confirm Your Email</h3>
            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              We've sent a 6-digit verification code to <br />
              <strong style={{ color: 'var(--text)' }}>{unverifiedEmail}</strong>
            </p>
          </div>

          {error && (
            <div
              className="flex items-start gap-2.5 text-xs rounded-xl p-3 animate-fadeIn"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}
            >
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {otpResentMessage && (
            <div
              className="flex items-center gap-2 text-xs rounded-xl p-3 animate-fadeIn"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22C55E' }}
            >
              <span>✅</span>
              <span>{otpResentMessage}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <Input 
              label="Enter 6-Digit OTP" 
              type="text" 
              placeholder="e.g. 123456" 
              maxLength="6"
              value={otpVal} 
              onChange={(e) => setOtpVal(e.target.value.replace(/\D/g, ''))} 
              required 
            />

            <Button type="submit" variant="primary" loading={otpLoading} className="w-full py-3 text-sm mt-1">
              Verify & Log In
            </Button>
          </form>

          <div className="flex flex-col gap-3.5 text-center mt-2">
            <button
              type="button"
              onClick={handleResendOtp}
              className="text-xs font-bold bg-transparent border-none cursor-pointer outline-none hover:opacity-80 transition-all"
              style={{ color: '#F97316' }}
            >
              Resend Code
            </button>
            <button
              type="button"
              onClick={() => setUnverifiedEmail('')}
              className="text-xs font-semibold bg-transparent border-none cursor-pointer outline-none hover:opacity-80 transition-all"
              style={{ color: 'var(--text-muted)' }}
            >
              Back to Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      {/* Login / Register tab switcher */}
      <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
        <Link to="/login" className="auth-tab">Login</Link>
        <button className="auth-tab active">Register</button>
      </div>

      {/* Form body */}
      <div className="px-8 py-7 flex flex-col gap-5">

        {/* Error */}
        {error && (
          <div
            className="flex items-start gap-2.5 text-xs rounded-xl p-3 animate-fadeIn"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}
          >
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {googleToast && (
          <div
            className="flex items-center gap-2 text-xs rounded-xl p-3 animate-fadeIn"
            style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', color: '#F97316' }}
          >
            <span>🚀</span>
            <span>Google Sign-up coming soon! Please register with email.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Full Name" type="text" placeholder="Priya Sharma" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email address" type="email" placeholder="hello@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Mobile Number" type="text" placeholder="9876543210" maxLength="10" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} required />
          <Input label="Password" type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <Button type="submit" variant="primary" loading={loading} className="w-full py-3 text-sm mt-1">
            Create Account
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>or continue with</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        <GoogleButton onClick={() => { setGoogleToast(true); setTimeout(() => setGoogleToast(false), 3000); }} />

        <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-bold" style={{ color: '#F97316' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
