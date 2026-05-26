import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslate } from '../context/LanguageContext';
import { User, Mail, Lock, Phone, AlertCircle } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const Signup = () => {
  const { register } = useAuth();
  const { t } = useTranslate();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' or 'shopOwner'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Field checks
    if (!name || !email || !password || !phone) {
      return setError('Please fill in all the required fields.');
    }
    if (phone.length < 10) {
      return setError('Please enter a valid 10-digit mobile number.');
    }

    setLoading(true);
    const res = await register(name, email, password, phone, role);
    setLoading(false);

    if (res.success) {
      // Redirect successfully registered user
      if (role === 'shopOwner') {
        navigate('/shop-register');
      } else {
        navigate('/');
      }
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      
      {/* Header title */}
      <div className="text-center sm:text-left">
        <h3 className="text-xl font-extrabold tracking-tight">{t('signup')}</h3>
        <p className="text-xs text-brand-muted mt-1">Create an account to discover nearby shops or sell online</p>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/25 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-error animate-fadeIn">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Role Selection Toggles */}
      <div className="grid grid-cols-2 gap-3 p-1 bg-brand-surface-2 border border-brand-border rounded-xl">
        <button
          type="button"
          onClick={() => setRole('customer')}
          className={`
            py-2 text-[11px] font-extrabold rounded-lg uppercase tracking-wider select-none transition-all
            ${role === 'customer' 
              ? 'bg-primary text-white shadow-md shadow-primary/20' 
              : 'text-brand-muted hover:text-brand-text'
            }
          `}
        >
          Customer
        </button>
        <button
          type="button"
          onClick={() => setRole('shopOwner')}
          className={`
            py-2 text-[11px] font-extrabold rounded-lg uppercase tracking-wider select-none transition-all
            ${role === 'shopOwner' 
              ? 'bg-primary text-white shadow-md shadow-primary/20' 
              : 'text-brand-muted hover:text-brand-text'
            }
          `}
        >
          Sell (Shop Owner)
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        
        {/* Full Name */}
        <Input
          label="Full Name"
          type="text"
          placeholder="Riya Sharma"
          icon={User}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Email */}
        <Input
          label="Email Address"
          type="email"
          placeholder="riya@example.com"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Mobile Phone */}
        <Input
          label="Mobile Number"
          type="text"
          placeholder="9876543210"
          icon={Phone}
          maxLength="10"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
          required
        />

        {/* Password */}
        <Input
          label="Password"
          type="password"
          placeholder="Min 6 characters"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full mt-2"
        >
          {role === 'shopOwner' ? 'Continue to Shop Registry' : t('signup')}
        </Button>

      </form>

      {/* Footer login toggle */}
      <div className="text-center text-xs text-brand-muted border-t border-brand-border/40 pt-4 mt-2">
        <span>Already have an account? </span>
        <Link 
          to="/login" 
          className="font-bold text-primary hover:text-primary-hover hover:underline transition-colors ml-1"
        >
          {t('login')}
        </Link>
      </div>

    </div>
  );
};

export default Signup;
