import React, { useState, useEffect } from 'react';
import { Users, Search, Trash2, ShieldAlert, ShieldCheck, UserCheck, UserX, AlertCircle } from 'lucide-react';
import apiClient from '../../../services/api';
import Button from '../../../components/common/Button';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/users');
      if (res.data?.success) {
        setUsers(res.data.data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Could not retrieve registered users data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId, currentActiveState) => {
    setError('');
    setSuccess('');
    try {
      const res = await apiClient.patch(`/users/${userId}/status`);
      if (res.data?.success) {
        const nextState = !currentActiveState;
        setSuccess(`User account ${nextState ? 'activated' : 'suspended'} successfully.`);
        setUsers(users.map(u => u._id === userId ? { ...u, isActive: nextState } : u));
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
      setError(err.response?.data?.message || 'Failed to modify account state.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you absolutely sure you want to permanently delete this user? All their orders, profiles, and associated data will be deleted. This is irreversible!')) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      const res = await apiClient.delete(`/users/${userId}`);
      if (res.data?.success) {
        setSuccess('User permanently deleted.');
        setUsers(users.filter(u => u._id !== userId));
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError(err.response?.data?.message || 'Delete request failed.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.phone && u.phone.includes(searchTerm)) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-brand-text flex items-center gap-2">
            <Users size={22} className="text-primary" />
            Manage Users
          </h2>
          <p className="text-xs text-brand-muted mt-1">Review user roles, toggle account access, or delete user accounts.</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64 shrink-0">
          <input
            type="text"
            placeholder="Search name, email, role..."
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

      {/* ─── USERS LIST ─── */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-brand-muted text-xs font-bold uppercase tracking-widest animate-pulse">
          Loading user records...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-20 bg-[#0A1E3F] border border-white/5 rounded-3xl p-8 max-w-md mx-auto">
          <span className="text-3xl">👥</span>
          <h3 className="font-extrabold text-sm text-white mt-3">No Users Found</h3>
          <p className="text-xs text-slate-400 mt-2 font-sans">
            Could not find any registered users matching the search queries.
          </p>
        </div>
      ) : (
        <div className="bg-[#0A1E3F] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider bg-[#071630]/65 select-none">
                  <th className="px-6 py-4">Full Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-semibold text-slate-300">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-[#122543]/20 transition-colors">
                    
                    {/* User Profile Info */}
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center font-bold text-white text-xs shrink-0 select-none">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-white">{u.name}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4.5">{u.email}</td>

                    {/* Contact Number */}
                    <td className="px-6 py-4.5">{u.phone || 'No phone number'}</td>

                    {/* Role Badge */}
                    <td className="px-6 py-4.5 font-bold uppercase tracking-wider">
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full border select-none
                        ${u.role === 'admin' 
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 font-black' 
                          : u.role === 'shopOwner' 
                          ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' 
                          : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        }
                      `}>
                        {u.role}
                      </span>
                    </td>

                    {/* Active State badge */}
                    <td className="px-6 py-4.5">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 select-none">
                          <UserCheck size={10} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/20 select-none">
                          <UserX size={10} /> Suspended
                        </span>
                      )}
                    </td>

                    {/* Action toggles */}
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        
                        {/* Toggle active status */}
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleStatus(u._id, u.isActive)}
                            className={`p-1.5 border rounded-xl transition-all cursor-pointer flex items-center justify-center
                              ${u.isActive 
                                ? 'bg-red-500/10 hover:bg-red-500/25 border-red-500/20 text-red-400' 
                                : 'bg-emerald-500/10 hover:bg-emerald-500/25 border-emerald-500/20 text-emerald-400'
                              }
                            `}
                            title={u.isActive ? 'Suspend User' : 'Activate User'}
                          >
                            {u.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                          </button>
                        )}

                        {/* Permanent deletion */}
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="p-1.5 border border-transparent hover:border-white/5 hover:bg-[#071630] text-slate-400 hover:text-red-400 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                            title="Delete User permanently"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}

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

export default AdminUsers;
