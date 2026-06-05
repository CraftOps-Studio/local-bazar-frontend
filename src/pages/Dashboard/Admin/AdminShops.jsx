import React, { useState, useEffect } from 'react';
import { Store, ShieldCheck, Clock, Trash2, Search, Check, AlertCircle, XOctagon } from 'lucide-react';
import apiClient from '../../../services/api';
import Button from '../../../components/common/Button';

const AdminShops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchShops = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/shops');
      if (res.data?.success) {
        setShops(res.data.data.shops || []);
      }
    } catch (err) {
      console.error('Failed to load shops:', err);
      setError('Could not retrieve active platform shops.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleVerifyShop = async (shopId) => {
    setError('');
    setSuccess('');
    try {
      const res = await apiClient.patch(`/shops/${shopId}/status`, { status: 'approved' });
      if (res.data?.success) {
        setSuccess('Shop successfully approved and live!');
        setShops(shops.map(s => s._id === shopId ? { ...s, isVerified: true, status: 'approved' } : s));
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Approval failed:', err);
      setError(err.response?.data?.message || 'Approval patch request failed.');
    }
  };

  const handleRejectShop = async (shopId) => {
    const reason = window.prompt('Please enter the reason for rejecting this shop onboarding application:');
    if (reason === null) return; // user cancelled prompt

    setError('');
    setSuccess('');
    try {
      const res = await apiClient.patch(`/shops/${shopId}/status`, { 
        status: 'rejected',
        reason: reason.trim() || 'Details provided do not meet our criteria.'
      });
      if (res.data?.success) {
        setSuccess('Shop registration rejected successfully.');
        setShops(shops.map(s => s._id === shopId ? { ...s, status: 'rejected' } : s));
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Rejection failed:', err);
      setError(err.response?.data?.message || 'Rejection patch request failed.');
    }
  };

  const handleDeleteShop = async (shopId) => {
    if (!window.confirm('Are you absolutely sure you want to permanently delete this shop and remove its catalog? This action is irreversible!')) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      const res = await apiClient.delete(`/shops/${shopId}`);
      if (res.data?.success) {
        setSuccess('Shop permanently removed from platform.');
        setShops(shops.filter(s => s._id !== shopId));
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Shop deletion failed:', err);
      setError(err.response?.data?.message || 'Shop delete request failed.');
    }
  };

  const filteredShops = shops.filter(shop => 
    (shop.name && shop.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (shop.address?.pincode && shop.address.pincode.includes(searchTerm)) ||
    (shop.owner?.name && shop.owner.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <Store size={22} style={{ color: '#F97316' }} />
            Manage Shops
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
            Approve registered merchant applicants, review details, or manage existing storefront profiles
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64 shrink-0">
          <input
            type="text"
            placeholder="Search name, pincode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl py-2 pl-4 pr-10 outline-none text-xs"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          />
          <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-red-500 animate-fadeIn">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/25 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-green-500 animate-fadeIn">
          <ShieldCheck size={15} className="shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* ─── SHOPS DISPLAY ─── */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-xs font-bold uppercase tracking-widest animate-pulse" style={{ color: 'var(--text-secondary)' }}>
          Loading shops database...
        </div>
      ) : filteredShops.length === 0 ? (
        <div className="text-center py-20 rounded-3xl p-8 max-w-md mx-auto border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <span className="text-3xl">🏪</span>
          <h3 className="font-extrabold text-sm mt-3" style={{ color: 'var(--text)' }}>No Shops Found</h3>
          <p className="text-xs mt-2 font-sans" style={{ color: 'var(--text-secondary)' }}>
            Could not find any shops matching the active search filters.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl overflow-hidden shadow-sm border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-[10px] font-extrabold uppercase tracking-wider" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  <th className="px-6 py-4">Shop Details</th>
                  <th className="px-6 py-4">Owner Profile</th>
                  <th className="px-6 py-4">Address / Area</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs" style={{ borderColor: 'var(--border)' }}>
                {filteredShops.map((shop) => (
                  <tr key={shop._id} className="transition-colors" style={{ color: 'var(--text)' }}>
                    {/* Shop Branding */}
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden border shrink-0 flex items-center justify-center font-bold" style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                          {shop.logo?.url ? (
                            <img src={shop.logo.url} alt={shop.name} className="w-full h-full object-cover" />
                          ) : (
                            shop.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold leading-tight" style={{ color: 'var(--text)' }}>{shop.name}</span>
                          <span className="text-[10px] mt-0.5 truncate max-w-[150px]" style={{ color: 'var(--text-muted)' }}>{shop.slug}</span>
                        </div>
                      </div>
                    </td>

                    {/* Owner Details */}
                    <td className="px-6 py-4.5 font-sans">
                      <div className="flex flex-col">
                        <span className="font-semibold" style={{ color: 'var(--text)' }}>{shop.owner?.name || 'Local Seller'}</span>
                        <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{shop.owner?.email || 'No email'}</span>
                      </div>
                    </td>

                    {/* Address Location */}
                    <td className="px-6 py-4.5 font-sans">
                      <div className="flex flex-col">
                        <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          {shop.address ? `${shop.address.street || ''}, ${shop.address.city || ''}` : 'Standard Address'}
                        </span>
                        <span className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          PIN: {shop.address?.pincode || 'None'}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4.5">
                      {shop.status === 'approved' ? (
                        <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-500 text-[10px] font-bold px-2.5 py-1 rounded-full border border-green-500/20 select-none">
                          <ShieldCheck size={11} /> Verified Live
                        </span>
                      ) : shop.status === 'rejected' ? (
                        <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-500 text-[10px] font-bold px-2.5 py-1 rounded-full border border-red-500/20 select-none">
                          <XOctagon size={11} /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2.5 py-1 rounded-full border border-orange-500/20 select-none">
                          <Clock size={11} /> Pending Review
                        </span>
                      )}
                    </td>

                    {/* Verification Actions */}
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {shop.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleRejectShop(shop._id)}
                              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 rounded-xl transition-all cursor-pointer text-[10px] font-extrabold uppercase tracking-wide"
                              title="Reject Shop"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleVerifyShop(shop._id)}
                              className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-500 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide"
                              title="Verify Shop"
                            >
                              <Check size={12} /> Approve
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => handleDeleteShop(shop._id)}
                          className="p-2 border border-transparent hover:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 text-gray-400 hover:text-red-500 rounded-xl transition-all cursor-pointer"
                          title="Delete Shop"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminShops;
