import React, { useState, useEffect } from 'react';
import { Store, ShieldCheck, Clock, Trash2, Search, Check, AlertCircle } from 'lucide-react';
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
      const res = await apiClient.patch(`/shops/${shopId}/verify`, { isVerified: true });
      if (res.data?.success) {
        setSuccess('Shop successfully verified and live!');
        setShops(shops.map(s => s._id === shopId ? { ...s, isVerified: true } : s));
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Verification failed:', err);
      setError(err.response?.data?.message || 'Verification patch request failed.');
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
    <div className="flex flex-col gap-6">
      
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-brand-text flex items-center gap-2">
            <Store size={22} className="text-primary" />
            Manage Shops
          </h2>
          <p className="text-xs text-brand-muted mt-1">Approve registered merchants, verify organic catalogs, or delete shops.</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64 shrink-0">
          <input
            type="text"
            placeholder="Search name, pincode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#071630] border border-white/5 rounded-xl py-2 pl-4 pr-10 outline-none text-xs text-white"
          />
          <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-error/10 border border-error/25 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-error animate-fadeIn">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-400 animate-fadeIn">
          <ShieldCheck size={15} className="shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* ─── SHOPS DISPLAY ─── */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-brand-muted text-xs font-bold uppercase tracking-widest animate-pulse">
          Loading shops database...
        </div>
      ) : filteredShops.length === 0 ? (
        <div className="text-center py-20 bg-[#0A1E3F] border border-white/5 rounded-3xl p-8 max-w-md mx-auto">
          <span className="text-3xl">🌾</span>
          <h3 className="font-extrabold text-sm text-white mt-3">No Shops Found</h3>
          <p className="text-xs text-slate-400 mt-2 font-sans">
            Could not find any shops matching the active search filters.
          </p>
        </div>
      ) : (
        <div className="bg-[#0A1E3F] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider bg-[#071630]/65">
                  <th className="px-6 py-4">Shop details</th>
                  <th className="px-6 py-4">Owner Profile</th>
                  <th className="px-6 py-4">Address / Area</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredShops.map((shop) => (
                  <tr key={shop._id} className="hover:bg-[#122543]/20 transition-colors">
                    {/* Shop Branding */}
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#071630] border border-white/5 shrink-0 flex items-center justify-center font-bold text-slate-300">
                          {shop.logo?.url ? (
                            <img src={shop.logo.url} alt={shop.name} className="w-full h-full object-cover" />
                          ) : (
                            shop.name.slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white leading-tight">{shop.name}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px]">{shop.slug}</span>
                        </div>
                      </div>
                    </td>

                    {/* Owner Details */}
                    <td className="px-6 py-4.5 font-sans">
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">{shop.owner?.name || 'Local Seller'}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">{shop.owner?.email || 'No email'}</span>
                      </div>
                    </td>

                    {/* Address Location */}
                    <td className="px-6 py-4.5 font-sans">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-300">
                          {shop.address ? `${shop.address.street || ''}, ${shop.address.city || ''}` : 'Standard Address'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                          PIN: {shop.address?.pincode || 'None'}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4.5">
                      {shop.isVerified ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/20 select-none">
                          <ShieldCheck size={11} /> Verified Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-orange-500/10 text-orange-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-orange-500/20 select-none">
                          <Clock size={11} /> Pending Review
                        </span>
                      )}
                    </td>

                    {/* Verification Actions */}
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!shop.isVerified && (
                          <button
                            onClick={() => handleVerifyShop(shop._id)}
                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-400 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wide"
                            title="Verify Shop"
                          >
                            <Check size={12} /> Approve
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteShop(shop._id)}
                          className="p-2 border border-transparent hover:border-white/5 hover:bg-[#071630] text-slate-400 hover:text-red-400 rounded-xl transition-all cursor-pointer"
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
