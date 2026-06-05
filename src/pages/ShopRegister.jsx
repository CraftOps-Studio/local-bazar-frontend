import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslate } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Store, Text, FileImage, MapPin, Sparkles, AlertCircle, User, Mail, Phone, CheckCircle, ArrowLeft } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import apiClient from '../services/api';

const ShopRegister = () => {
  const { t } = useTranslate();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Shop Details State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Grocery');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  
  // Owner Details (For guests/new applicants)
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const categories = ['Grocery', 'Electronics', 'Fashion', 'Food & Beverages', 'Home & Garden', 'Beauty & Health', 'Other'];

  // Autofill if user is already logged in
  useEffect(() => {
    if (user) {
      setOwnerName(user.name || '');
      setOwnerEmail(user.email || '');
      setOwnerPhone(user.phone || '');
    }
  }, [user]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !description || !street || !city || !state || !pincode) {
      return setError('Please fill in all shop profile details.');
    }

    if (!user && (!ownerName || !ownerEmail || !ownerPhone)) {
      return setError('Owner contact details (Name, Email, Phone) are required for onboarding.');
    }

    setLoading(true);
    try {
      if (!user) {
        // ─── GUEST/NEW APPLICANT FLOW ───
        // Use single multipart/form-data request to /shops/onboard
        const formData = new FormData();
        formData.append('name', name);
        formData.append('category', category);
        formData.append('description', description);
        formData.append('ownerName', ownerName);
        formData.append('ownerEmail', ownerEmail);
        formData.append('ownerPhone', ownerPhone);
        formData.append('address', JSON.stringify({ street, city, state, pincode }));
        if (logoFile) {
          formData.append('logo', logoFile);
        }

        const res = await apiClient.post('/shops/onboard', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data?.success) {
          setSuccess(true);
        } else {
          setError('Shop onboarding application failed. Please try again.');
        }
      } else {
        // ─── AUTHENTICATED USER FLOW ───
        const shopData = {
          name,
          description,
          category,
          address: { street, city, state, pincode },
        };

        const res = await apiClient.post('/shops', shopData);

        if (res.data?.success) {
          const shopId = res.data.data._id;
          
          if (logoFile) {
            const formData = new FormData();
            formData.append('logo', logoFile);
            try {
              await apiClient.post(`/shops/${shopId}/logo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              });
            } catch (uploadErr) {
              console.error('Logo upload failed:', uploadErr.message);
            }
          }
          
          await refreshUser();
          setSuccess(true);
        } else {
          setError('Shop registration failed. Please try again.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Shop registry failed. Please verify details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 relative animate-slideUp">
      <div
        className="rounded-3xl p-8 sm:p-10 shadow-sm relative z-10"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        
        {success ? (
          <div className="flex flex-col items-center text-center py-8 gap-5 animate-scaleUp">
            <span className="w-16 h-16 rounded-full flex items-center justify-center text-green-500 bg-green-500/10 border border-green-500/20">
              <CheckCircle size={32} className="animate-bounce" />
            </span>
            <div>
              <h2 className="font-extrabold text-xl tracking-tight" style={{ color: 'var(--text)' }}>
                Application Queued!
              </h2>
              <p className="text-xs mt-2 max-w-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Thank you for applying to sell on Local Bazar! Your request has been queued for platform review. We've sent a verification summary to <strong style={{ color: 'var(--text)' }}>{ownerEmail}</strong>.
              </p>
            </div>
            {!user ? (
              <Button onClick={() => navigate('/login')} variant="outline" className="px-6 py-2 text-xs font-bold mt-2">
                Go to Login
              </Button>
            ) : (
              <Button onClick={() => navigate('/')} variant="outline" className="px-6 py-2 text-xs font-bold mt-2">
                Return to Storefront
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Back Button */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-xs font-bold mb-6 hover:opacity-80 transition-all select-none border-none bg-transparent cursor-pointer pl-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ArrowLeft size={14} /> Back
            </button>

            {/* Header */}
            <div className="flex flex-col items-center mb-8 text-center">
              <span
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold mb-3"
                style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)', color: '#F97316' }}
              >
                🏪
              </span>
              <h2 className="font-extrabold text-xl sm:text-2xl tracking-tight" style={{ color: 'var(--text)' }}>
                {t('shopRegister')}
              </h2>
              <p className="text-xs mt-1 max-w-md" style={{ color: 'var(--text-muted)' }}>
                Set up your merchant details and submit your shop onboarding application for review
              </p>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/25 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-error mb-6 animate-fadeIn">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              {/* Section: Owner Info (Shown only to guests/new applicants) */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 pl-1 select-none" style={{ color: '#F97316' }}>
                  <User size={13} /> Owner Contact Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="e.g. Laxmi Prasad"
                    icon={User}
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    required
                    disabled={!!user}
                  />
                  <Input
                    label="Mobile Number"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    icon={Phone}
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    required
                    disabled={!!user}
                  />
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. info@yourstore.com"
                  icon={Mail}
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  required
                  disabled={!!user}
                />
              </div>

              {/* Section: Shop Bio */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 pl-1 select-none" style={{ color: '#F97316' }}>
                  <Sparkles size={13} /> Shop Details
                </h3>

                {/* Shop Name */}
                <Input
                  label="Shop Name"
                  type="text"
                  placeholder="e.g. Laxmi Provision Store"
                  icon={Store}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                {/* Shop Description */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-bold text-brand-muted uppercase tracking-wider pl-1">
                    Description
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5" style={{ color: 'var(--text-muted)' }}>
                      <Text size={16} />
                    </span>
                    <textarea
                      placeholder="Tell customers what your shop sells, speciality, opening hours..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows="3"
                      className="w-full rounded-xl py-3 pl-11 pr-4 outline-none text-sm transition-all"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                      required
                    />
                  </div>
                </div>

                {/* Category selection */}
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-bold text-brand-muted uppercase tracking-wider pl-1">
                    Business Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className="py-2.5 border rounded-xl text-xs font-bold select-none cursor-pointer transition-all duration-200"
                        style={category === cat
                          ? { background: 'rgba(249,115,22,0.08)', borderColor: '#F97316', color: '#F97316' }
                          : { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                        }
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section: Shop Logo Upload & Image Preview */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 pl-1 select-none" style={{ color: '#F97316' }}>
                  <FileImage size={13} /> Branding Logo
                </h3>
                
                <div className="flex flex-col sm:flex-row items-center gap-5 p-5 rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center text-2xl font-bold" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>🏪</span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-1 text-center sm:text-left w-full">
                    <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>Upload Shop Logo</span>
                    <span className="text-[10px] leading-relaxed mb-2.5" style={{ color: 'var(--text-muted)' }}>
                      PNG, JPG, max 2MB. Shown on discovery feeds.
                    </span>
                    <label
                      className="inline-flex items-center justify-center px-4 py-2 border text-xs font-bold rounded-xl cursor-pointer transition-all select-none active:scale-[0.98]"
                      style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    >
                      <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                      Choose Image
                    </label>
                  </div>
                </div>
              </div>

              {/* Section: Shop Address */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 pl-1 select-none" style={{ color: '#F97316' }}>
                  <MapPin size={13} /> Location Info
                </h3>

                {/* Street / Location */}
                <Input
                  label="Street Address / Area"
                  type="text"
                  placeholder="e.g. Shop 12, Main Bazar, MG Road"
                  icon={MapPin}
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                />

                {/* City + State + Pincode Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Input
                    label="City"
                    type="text"
                    placeholder="Jaipur"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="col-span-1"
                  />
                  <Input
                    label="State"
                    type="text"
                    placeholder="Rajasthan"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="col-span-1"
                  />
                  <Input
                    label="Pincode"
                    type="text"
                    maxLength="6"
                    placeholder="302017"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    required
                    className="col-span-2 sm:col-span-1"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  className="w-full py-3.5 rounded-2xl text-sm"
                >
                  🚀 Submit Onboarding Form
                </Button>
                <p className="text-center text-[10px] font-sans px-4" style={{ color: 'var(--text-muted)' }}>
                  Your details and application will be audited. Once verified, you will receive an activation email to set up your password and access the merchant center.
                </p>
              </div>

            </form>
          </>
        )}

      </div>

    </div>
  );
};

export default ShopRegister;
