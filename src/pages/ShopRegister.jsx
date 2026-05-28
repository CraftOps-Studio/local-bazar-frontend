import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslate } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Store, Text, FileImage, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import apiClient from '../services/api';

const ShopRegister = () => {
  const { t } = useTranslate();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Grocery');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = ['Grocery', 'Electronics', 'Fashion', 'Food & Beverages', 'Home & Garden', 'Beauty & Health', 'Other'];

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

    setLoading(true);
    try {
      // 1. Create the shop metadata
      const shopData = {
        name,
        description,
        category,
        address: { street, city, state, pincode },
        location: { type: 'Point', coordinates: [0, 0] }
      };

      const res = await apiClient.post('/shops', shopData);

      if (res.data?.success) {
        const shopId = res.data.data.shop._id;
        
        // 2. Upload Logo if a file is selected
        if (logoFile) {
          const formData = new FormData();
          formData.append('logo', logoFile);
          
          try {
            await apiClient.post(`/shops/${shopId}/logo`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          } catch (uploadErr) {
            console.error('Logo upload failed:', uploadErr.message);
            // Non-fatal, shop is already registered, proceed to dashboard
          }
        }
        
        // Refresh client-side user to upgrade role to 'shopOwner'
        await refreshUser();
        
        // Redirect successfully registered shop owner to Dashboard
        navigate('/dashboard');
      } else {
        setError('Shop registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Shop registry failed. Please verify details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 relative">
      
      {/* Glow Rings */}
      <div className="absolute top-[10%] left-[-15%] w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="glass rounded-3xl p-8 sm:p-10 border border-brand-border/60 shadow-2xl relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <span className="w-12 h-12 bg-primary/10 text-primary border border-primary/20 rounded-2xl flex items-center justify-center text-xl font-bold mb-3 shadow-inner">
            🏪
          </span>
          <h2 className="font-extrabold text-xl sm:text-2xl tracking-tight">{t('shopRegister')}</h2>
          <p className="text-xs text-brand-muted mt-1 max-w-md font-sans">
            Welcome, <strong className="text-brand-text">{user?.name || 'Owner'}</strong>! Set up your digital showcase profile and start listing products in minutes.
          </p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/25 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-error mb-6 animate-fadeIn">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          {/* Section: Shop Bio */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 pl-1 select-none">
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
                <span className="absolute left-3.5 top-3.5 text-brand-muted">
                  <Text size={16} />
                </span>
                <textarea
                  placeholder="Tell customers what your shop sells, speciality, opening hours..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full bg-brand-surface-2 border border-brand-border rounded-xl py-3 pl-11 pr-4 outline-none text-brand-text placeholder-brand-muted text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
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
                    className={`
                      py-2.5 border rounded-xl text-xs font-bold select-none cursor-pointer transition-all duration-200
                      ${category === cat
                        ? 'bg-primary/10 border-primary text-primary shadow-sm shadow-primary/10'
                        : 'bg-brand-surface-2 border-brand-border text-brand-muted hover:border-brand-border/80 hover:text-brand-text'
                      }
                    `}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Shop Logo Upload & Image Preview */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 pl-1 select-none">
              <FileImage size={13} /> Branding Logo
            </h3>
            
            <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-brand-surface-2/40 border border-brand-border rounded-2xl">
              {/* Image Preview Box */}
              <div className="w-20 h-20 rounded-2xl bg-brand-surface-2 border border-brand-border overflow-hidden shrink-0 flex items-center justify-center text-2xl font-bold shadow-inner relative group">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-brand-muted">🏪</span>
                )}
              </div>
              
              <div className="flex-1 flex flex-col gap-1 text-center sm:text-left w-full">
                <span className="text-xs font-bold text-brand-text">Upload Shop Logo</span>
                <span className="text-[10px] text-brand-muted leading-relaxed font-sans mb-2.5">
                  Select an image (PNG, JPG, max 2MB). This represents your business on the main discovery feeds.
                </span>
                
                {/* Custom File input button trigger */}
                <label className="inline-flex items-center justify-center px-4 py-2 border border-brand-border bg-brand-surface hover:bg-brand-surface-2 text-xs font-bold text-brand-text rounded-xl cursor-pointer hover:border-brand-border/80 transition-all select-none active:scale-[0.98]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                  Choose Image file
                </label>
              </div>
            </div>
          </div>

          {/* Section: Shop Address Address Grid */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 pl-1 select-none">
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
              className="w-full py-3.5 rounded-2xl shadow-xl shadow-primary/20 text-sm"
            >
              🚀 Submit for Approval
            </Button>
            <p className="text-center text-[10px] text-brand-muted font-sans px-4">
              Your shop profile will be sent to a platform administrator for review. Once approved, you can start listing products.
            </p>
          </div>

        </form>

      </div>

    </div>
  );
};

export default ShopRegister;
