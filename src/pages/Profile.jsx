import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslate } from '../context/LanguageContext';
import { User, Phone, Mail, MapPin, Plus, Trash2, Camera, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import apiClient from '../services/api';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslate();

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Avatar State
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  // Address State
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [pincode, setPincode] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Handles Profile Details Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(false);
    setProfileError('');
    try {
      const res = await apiClient.put('/users/profile', { name, phone });
      if (res.data?.success) {
        await refreshUser();
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handles Avatar File Selection and Upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarLoading(true);
    setAvatarSuccess(false);
    setAvatarError('');
    try {
      const res = await apiClient.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        await refreshUser();
        setAvatarSuccess(true);
        setTimeout(() => setAvatarSuccess(false), 3000);
      }
    } catch (err) {
      setAvatarError(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      setAvatarLoading(false);
    }
  };

  // Handles Adding New Address
  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!street || !city || !state || !pincode) {
      return setAddressError('Please fill in all address fields.');
    }
    setAddressLoading(true);
    setAddressError('');
    try {
      const res = await apiClient.post('/users/address', {
        street,
        city,
        state,
        country,
        pincode,
      });
      if (res.data?.success) {
        await refreshUser();
        setAddressModalOpen(false);
        // Reset fields
        setStreet('');
        setCity('');
        setState('');
        setPincode('');
      }
    } catch (err) {
      setAddressError(err.response?.data?.message || 'Failed to save address.');
    } finally {
      setAddressLoading(false);
    }
  };

  // Handles Deleting an Address
  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm('Are you sure you want to remove this address?')) return;
    try {
      const res = await apiClient.delete(`/users/address/${addrId}`);
      if (res.data?.success) {
        await refreshUser();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove address.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8 animate-slideUp">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>
          My Account
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          Manage your personal information, profile photo, and delivery addresses
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Card: Avatar & Roles overview */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div 
            className="rounded-3xl p-6 flex flex-col items-center text-center gap-4 relative"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
          >
            {/* Avatar container */}
            <div className="relative w-28 h-28 rounded-full overflow-hidden group border-2" style={{ borderColor: 'var(--border)' }}>
              <img 
                src={user?.avatar?.url || 'https://res.cloudinary.com/local-bazar/image/upload/v1/avatars/default.png'} 
                alt={user?.name} 
                className="w-full h-full object-cover"
              />
              {/* Photo Upload Overlay */}
              <label 
                className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <Camera size={20} className="text-white" />
                <span className="text-[10px] text-white font-bold mt-1">Change</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  className="hidden" 
                  disabled={avatarLoading}
                />
              </label>

              {avatarLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-white" />
                </div>
              )}
            </div>

            {/* User Meta */}
            <div>
              <h2 className="font-extrabold text-base" style={{ color: 'var(--text)' }}>{user?.name}</h2>
              <span className="text-xs uppercase font-extrabold" style={{ color: '#F97316' }}>
                {user?.role === 'shopOwner' ? 'Merchant' : user?.role || 'Customer'}
              </span>
            </div>

            {/* Notification messages */}
            {avatarSuccess && (
              <span className="text-[10px] font-bold text-green-500 animate-fadeIn">✓ Avatar updated!</span>
            )}
            {avatarError && (
              <span className="text-[10px] font-bold text-red-500 animate-fadeIn">{avatarError}</span>
            )}

            <div className="w-full h-px" style={{ background: 'var(--border)' }} />

            {/* Brief User Metadata List */}
            <div className="w-full space-y-3 text-left">
              <div className="flex items-center gap-2.5 text-xs">
                <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                <span className="truncate" style={{ color: 'var(--text-secondary)' }}>{user?.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs">
                <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>{user?.phone || 'No phone added'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: Edit details & Addresses */}
        <div className="md:col-span-2 flex flex-col gap-8">
          
          {/* Profile form */}
          <div 
            className="rounded-3xl p-6 sm:p-8 flex flex-col gap-5"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div>
              <h3 className="font-extrabold text-base" style={{ color: 'var(--text)' }}>
                Personal Details
              </h3>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Update your account display name and contact mobile number
              </p>
            </div>

            {profileSuccess && (
              <div className="flex items-center gap-2 p-3 text-xs text-green-600 rounded-xl animate-fadeIn" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <CheckCircle size={15} />
                <span>Profile updated successfully!</span>
              </div>
            )}

            {profileError && (
              <div className="flex items-center gap-2 p-3 text-xs text-red-600 rounded-xl animate-fadeIn" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <AlertCircle size={15} />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input 
                  label="Full Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                />
                <Input 
                  label="Phone Number" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" variant="primary" loading={profileLoading} className="px-6 py-2 text-xs">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Addresses section */}
          <div 
            className="rounded-3xl p-6 sm:p-8 flex flex-col gap-5"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base" style={{ color: 'var(--text)' }}>
                  Delivery Addresses
                </h3>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  Manage places where your orders are delivered
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                icon={Plus} 
                onClick={() => setAddressModalOpen(true)}
                className="py-1.5 px-3.5 text-xs font-bold"
              >
                Add Address
              </Button>
            </div>

            {user?.addresses && user.addresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.addresses.map((addr) => (
                  <div 
                    key={addr._id}
                    className="p-4 rounded-2xl flex justify-between gap-4 border"
                    style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
                  >
                    <div className="flex gap-2.5">
                      <MapPin size={16} className="shrink-0 mt-0.5" style={{ color: '#F97316' }} />
                      <div className="text-xs space-y-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        <p className="font-bold" style={{ color: 'var(--text)' }}>{addr.street}</p>
                        <p>{addr.city}, {addr.state}</p>
                        <p>{addr.country} - <span className="font-bold">{addr.pincode}</span></p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="text-gray-400 hover:text-red-500 self-start p-1 transition-colors"
                      title="Delete address"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div 
                className="rounded-2xl p-8 text-center flex flex-col items-center gap-2 border"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <MapPin size={24} style={{ color: 'var(--text-muted)' }} />
                <h4 className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>No addresses saved</h4>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Please add an address to start placing orders</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Address Form Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs" 
            onClick={() => setAddressModalOpen(false)}
          />
          {/* Modal Container */}
          <div 
            className="w-full max-w-md relative z-10 rounded-3xl p-6 sm:p-8 flex flex-col gap-5 animate-fadeIn"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}
          >
            <div>
              <h3 className="font-extrabold text-base" style={{ color: 'var(--text)' }}>
                New Delivery Address
              </h3>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Enter the shipping destination info below
              </p>
            </div>

            {addressError && (
              <div className="flex items-center gap-2 p-3 text-xs text-red-600 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <AlertCircle size={15} />
                <span>{addressError}</span>
              </div>
            )}

            <form onSubmit={handleAddAddress} className="space-y-4">
              <Input 
                label="Street / Landmark" 
                placeholder="Flat 101, Residency Apartment"
                value={street} 
                onChange={(e) => setStreet(e.target.value)} 
                required 
              />
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="City" 
                  placeholder="Madurai"
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  required 
                />
                <Input 
                  label="State" 
                  placeholder="Tamil Nadu"
                  value={state} 
                  onChange={(e) => setState(e.target.value)} 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Country" 
                  value={country} 
                  onChange={(e) => setCountry(e.target.value)} 
                  required 
                />
                <Input 
                  label="Pincode" 
                  placeholder="625020"
                  value={pincode} 
                  onChange={(e) => setPincode(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setAddressModalOpen(false)}
                  className="px-4 py-2 text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  loading={addressLoading}
                  className="px-5 py-2 text-xs font-bold"
                >
                  Add Address
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
