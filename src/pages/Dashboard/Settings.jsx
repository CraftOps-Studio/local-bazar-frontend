import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Settings as SettingsIcon, Store, Mail, Phone, FileText, 
  MapPin, Truck, IndianRupee, Image as ImageIcon, ShieldCheck, 
  AlertCircle, Loader2, Sparkles, Megaphone
} from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminSettings = () => {
  const [platformAnnounce, setPlatformAnnounce] = useState('');
  const [platformFee, setPlatformFee] = useState('10');
  const [minPayout, setMinPayout] = useState('500');
  const [supportEmail, setSupportEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Load from backend on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setFetchLoading(true);
        const res = await apiClient.get('/settings');
        if (res.data?.success) {
          const s = res.data.data.settings;
          setPlatformAnnounce(s.announcement || '');
          setPlatformFee(String(s.platformFeePercent ?? 10));
          setMinPayout(String(s.minSellerPayout ?? 500));
          setSupportEmail(s.supportEmail || '');
        }
      } catch (err) {
        setErrorMsg('Failed to load platform settings.');
      } finally {
        setFetchLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await apiClient.put('/settings', {
        announcement: platformAnnounce,
        platformFeePercent: Number(platformFee),
        minSellerPayout: Number(minPayout),
        supportEmail,
      });
      if (res.data?.success) {
        setSuccessMsg('Platform-wide configurations updated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="border-b border-brand-border/40 pb-4">
        <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
          <SettingsIcon size={22} className="text-primary" />
          Platform Configurations
        </h2>
        <p className="text-xs text-brand-muted mt-1 font-sans">
          Adjust parameters governing commissions, support lines, and landing page broadcasts.
        </p>
      </div>

      {fetchLoading ? (
        <div className="flex items-center gap-2 py-10 justify-center text-brand-muted text-xs font-sans">
          <Loader2 size={16} className="animate-spin text-primary" />
          Loading platform configuration...
        </div>
      ) : null}

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 text-xs text-emerald-400 font-sans font-semibold animate-fadeIn">
          🎉 {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/25 rounded-2xl p-4 text-xs text-rose-400 font-sans font-semibold flex items-center gap-2 animate-fadeIn">
          <AlertCircle size={14} className="shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="glass rounded-3xl p-6 sm:p-8 border border-brand-border">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest pl-1 select-none flex items-center gap-1.5">
              <Megaphone size={13} /> Landing Announcement
            </h3>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-brand-muted uppercase tracking-wider pl-1">
                Announcements Banner Text
              </label>
              <textarea
                value={platformAnnounce}
                onChange={(e) => setPlatformAnnounce(e.target.value)}
                rows="3"
                className="w-full bg-brand-surface-2 border border-brand-border rounded-xl py-3 px-4 outline-none text-brand-text placeholder-brand-muted text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
                required
              />
            </div>
          </div>

          <hr className="border-brand-border/40" />

          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest pl-1 select-none flex items-center gap-1.5">
              <Megaphone size={13} /> Fiscal Commission Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Flat Platform Commission (%)"
                type="number"
                placeholder="10"
                icon={FileText}
                value={platformFee}
                onChange={(e) => setPlatformFee(e.target.value)}
                required
              />
              <Input
                label="Min Seller Payout Threshold (₹)"
                type="number"
                placeholder="500"
                icon={Megaphone}
                value={minPayout}
                onChange={(e) => setMinPayout(e.target.value)}
                required
              />
            </div>
          </div>

          <hr className="border-brand-border/40" />

          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-primary uppercase tracking-widest pl-1 select-none flex items-center gap-1.5">
              <Mail size={13} /> System Support Coordinates
            </h3>

            <Input
              label="Support Email Address"
              type="email"
              placeholder="support@localbazar.com"
              icon={Mail}
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={ShieldCheck}
            loading={loading}
            className="w-full py-3.5 mt-2 rounded-xl shadow-lg shadow-primary/25"
          >
            Commit Platform Changes
          </Button>

        </form>
      </div>
    </div>
  );
};

const SellerSettings = () => {
  const { shop, refreshShop } = useOutletContext();
  
  // Fields State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [deliveryRadius, setDeliveryRadius] = useState('10');
  const [minimumOrderAmount, setMinimumOrderAmount] = useState('0');

  // File Upload States
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const categories = [
    'Grocery',
    'Electronics',
    'Fashion',
    'Food & Beverages',
    'Home & Garden',
    'Beauty & Health',
    'Sports',
    'Books',
    'Toys',
    'Automotive',
    'Other'
  ];

  // Initialize fields on shop load
  useEffect(() => {
    if (shop) {
      setName(shop.name || '');
      setDescription(shop.description || '');
      setCategory(shop.category || 'Other');
      setStreet(shop.address?.street || '');
      setCity(shop.address?.city || '');
      setState(shop.address?.state || '');
      setPincode(shop.address?.pincode || '');
      setContactEmail(shop.contactEmail || '');
      setContactPhone(shop.contactPhone || '');
      setGstNumber(shop.gstNumber || '');
      setDeliveryRadius(String(shop.deliveryRadius || '10'));
      setMinimumOrderAmount(String(shop.minimumOrderAmount || '0'));
    }
  }, [shop]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!name || !description || !street || !city || !state || !pincode) {
      setErrorMsg('Please fill in all mandatory shop profile details.');
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        name,
        description,
        category,
        address: { street, city, state, pincode },
        contactEmail,
        contactPhone,
        gstNumber: gstNumber || undefined,
        deliveryRadius: Number(deliveryRadius),
        minimumOrderAmount: Number(minimumOrderAmount)
      };

      const res = await apiClient.put(`/shops/${shop._id}`, payload);
      
      if (res.data?.success) {
        setSuccessMsg('Shop settings updated successfully!');
        await refreshShop();
      }
    } catch (err) {
      console.error('Failed to update shop settings:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update shop settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      setErrorMsg('');
      
      const formData = new FormData();
      formData.append('logo', file);

      const res = await apiClient.post(`/shops/${shop._id}/logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setSuccessMsg('Store logo updated successfully!');
        await refreshShop();
      }
    } catch (err) {
      console.error('Logo upload failed:', err.message);
      setErrorMsg(err.response?.data?.message || 'Logo upload failed. Limit is 2MB (jpg/png).');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingBanner(true);
      setErrorMsg('');

      const formData = new FormData();
      formData.append('banner', file);

      const res = await apiClient.post(`/shops/${shop._id}/banner`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setSuccessMsg('Store banner updated successfully!');
        await refreshShop();
      }
    } catch (err) {
      console.error('Banner upload failed:', err.message);
      setErrorMsg(err.response?.data?.message || 'Banner upload failed. Limit is 2MB (jpg/png).');
    } finally {
      setUploadingBanner(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      
      {/* Header controls */}
      <div className="border-b border-brand-border/40 pb-4">
        <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
          <SettingsIcon size={22} className="text-primary" />
          Shop Settings
        </h2>
        <p className="text-xs text-brand-muted mt-1 font-sans">
          Manage business status toggles, branding visual logs, and GSTIN variables.
        </p>
      </div>

      {/* SUCCESS / ERROR ALERT */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 text-xs text-emerald-400 font-sans font-semibold animate-fadeIn">
          🎉 {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/25 rounded-2xl p-4 text-xs text-rose-400 font-sans font-semibold flex items-center gap-2 animate-fadeIn">
          <AlertCircle size={14} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Settings block split: Left branding, Right core forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Visual Branding uploads */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          
          {/* Logo Card */}
          <div className="glass rounded-3xl p-6 border border-brand-border flex flex-col items-center gap-4 text-center">
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider select-none">
              Store logo
            </span>
            <div className="w-24 h-24 rounded-2xl bg-brand-surface-2 border border-brand-border overflow-hidden shrink-0 flex items-center justify-center text-3xl font-bold shadow-inner relative group">
              {shop?.logo?.url ? (
                <img src={shop.logo.url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-brand-muted">🏪</span>
              )}
            </div>
            
            <div className="flex flex-col gap-1 w-full mt-2">
              <label className="inline-flex items-center justify-center px-4 py-2 border border-brand-border bg-brand-surface-2 hover:bg-brand-surface text-xs font-bold text-brand-text rounded-xl cursor-pointer hover:border-brand-border/80 transition-all select-none active:scale-[0.98] w-full">
                {uploadingLogo ? (
                  <Loader2 size={13} className="animate-spin text-primary mr-1.5" />
                ) : (
                  <ImageIcon size={13} className="text-primary mr-1.5" />
                )}
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploadingLogo} />
                <span>Upload Logo</span>
              </label>
              <span className="text-[9px] text-brand-muted font-sans mt-1">PNG, JPG up to 2MB.</span>
            </div>
          </div>

          {/* Banner Card */}
          <div className="glass rounded-3xl p-6 border border-brand-border flex flex-col items-center gap-4 text-center">
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider select-none">
              Store Banner
            </span>
            <div className="w-full h-24 rounded-xl bg-brand-surface-2 border border-brand-border overflow-hidden shrink-0 flex items-center justify-center text-brand-muted font-bold shadow-inner relative">
              {shop?.banner?.url ? (
                <img src={shop.banner.url} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-sans font-medium">No Banner Configured</span>
              )}
            </div>
            
            <div className="flex flex-col gap-1 w-full mt-2">
              <label className="inline-flex items-center justify-center px-4 py-2 border border-brand-border bg-brand-surface-2 hover:bg-brand-surface text-xs font-bold text-brand-text rounded-xl cursor-pointer hover:border-brand-border/80 transition-all select-none active:scale-[0.98] w-full">
                {uploadingBanner ? (
                  <Loader2 size={13} className="animate-spin text-primary mr-1.5" />
                ) : (
                  <ImageIcon size={13} className="text-primary mr-1.5" />
                )}
                <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" disabled={uploadingBanner} />
                <span>Upload Banner</span>
              </label>
              <span className="text-[9px] text-brand-muted font-sans mt-1">Wide landscape up to 2MB.</span>
            </div>
          </div>

        </div>

        {/* Right Column: Configuration Form */}
        <div className="glass rounded-3xl p-6 sm:p-8 border border-brand-border lg:col-span-2">
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Bio Settings */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest pl-1 select-none flex items-center gap-1.5">
                🏪 Store Identity
              </h3>
              
              <Input
                label="Shop Name"
                type="text"
                placeholder="Shop Name"
                icon={Store}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-brand-muted uppercase tracking-wider pl-1">
                  Description
                </label>
                <textarea
                  placeholder="Tell buyers what makes your store special..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full bg-brand-surface-2 border border-brand-border rounded-xl py-3 px-4 outline-none text-brand-text placeholder-brand-muted text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-brand-muted uppercase tracking-wider pl-1">
                  Business Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-brand-surface-2 border border-brand-border rounded-xl py-3 px-4 outline-none text-brand-text text-sm focus:border-primary transition-all font-sans"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-brand-surface">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <hr className="border-brand-border/40" />

            {/* Location Address */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest pl-1 select-none flex items-center gap-1.5">
                📍 Location Coordinates
              </h3>

              <Input
                label="Street Address"
                type="text"
                placeholder="Shop details, street address..."
                icon={MapPin}
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
              />

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="City"
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
                <Input
                  label="State"
                  type="text"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
                <Input
                  label="Pincode"
                  type="text"
                  maxLength="6"
                  placeholder="Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            </div>

            <hr className="border-brand-border/40" />

            {/* Contact Details & Business Registration */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest pl-1 select-none flex items-center gap-1.5">
                📞 contact details & GSTIN
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contact Email"
                  type="email"
                  placeholder="owner@localstore.com"
                  icon={Mail}
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
                <Input
                  label="Contact Phone"
                  type="text"
                  placeholder="e.g. 9876543210"
                  icon={Phone}
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>

              <Input
                label="GSTIN Number (Optional)"
                type="text"
                placeholder="e.g. 07AAAAA1111A1Z1"
                icon={FileText}
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
              />
            </div>

            <hr className="border-brand-border/40" />

            {/* Logistics Parameters */}
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest pl-1 select-none flex items-center gap-1.5">
                🚚 Logistics & Delivery Bounds
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Max Delivery Radius (km)"
                  type="number"
                  placeholder="10"
                  icon={Truck}
                  value={deliveryRadius}
                  onChange={(e) => setDeliveryRadius(e.target.value)}
                  required
                />
                <Input
                  label="Min Order Amount (₹)"
                  type="number"
                  placeholder="0"
                  icon={IndianRupee}
                  value={minimumOrderAmount}
                  onChange={(e) => setMinimumOrderAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={ShieldCheck}
              loading={loading}
              className="w-full py-3.5 mt-2 rounded-xl shadow-lg shadow-primary/25"
            >
              Save Configuration Settings
            </Button>

          </form>

        </div>

      </div>

    </div>
  );
};

const Settings = () => {
  const { roleMode } = useAuth();
  if (roleMode === 'admin') {
    return <AdminSettings />;
  }
  return <SellerSettings />;
};

export default Settings;
