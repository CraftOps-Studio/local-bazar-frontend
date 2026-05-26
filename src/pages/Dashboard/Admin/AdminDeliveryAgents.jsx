import React, { useState, useEffect, useCallback } from 'react';
import {
  Truck, UserPlus, Search, X, CheckCircle2, AlertCircle,
  Store, Loader2, Trash2, UserCheck, UserX,
  Copy, Check, RefreshCw, Smartphone,
} from 'lucide-react';
import apiClient from '../../../services/api';

// ─── Vehicle type options ──────────────────────────────────────────────────
const VEHICLE_TYPES = [
  { value: 'bike', label: 'Bike', emoji: '🏍️' },
  { value: 'scooter', label: 'Scooter', emoji: '🛵' },
  { value: 'car', label: 'Car', emoji: '🚗' },
  { value: 'bicycle', label: 'Bicycle', emoji: '🚴' },
];

// ─── Empty form state ───────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  vehicleType: 'bike',
  vehicleNumber: '',
  shopSlug: '',
};

// ─── Role badge chip ────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const map = {
    delivery: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    admin: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    shopOwner: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    customer: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  };
  return (
    <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider select-none ${map[role] || map.customer}`}>
      {role}
    </span>
  );
};

// ─── Copy-to-clipboard button ───────────────────────────────────────────────
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
    </button>
  );
};

const AdminDeliveryAgents = () => {
  const [agents, setAgents] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newCredentials, setNewCredentials] = useState(null); // { agent, tempPassword }

  // ─── Fetch agents and shops ───────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [agentsRes, shopsRes] = await Promise.all([
        apiClient.get('/users/delivery-agents'),
        apiClient.get('/shops'),
      ]);
      setAgents(agentsRes.data?.data?.agents || []);
      setShops(shopsRes.data?.data?.shops || []);
    } catch (err) {
      console.error('Failed to load delivery agents:', err);
      setError('Could not load delivery agent data. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Client-side form validation ─────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required.';
    if (!form.email.trim()) errs.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email.';
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit Indian mobile number.';
    return errs;
  };

  // ─── Handle form field changes ────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // ─── Submit new delivery agent ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await apiClient.post('/users/delivery-agents', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        vehicleType: form.vehicleType,
        vehicleNumber: form.vehicleNumber.trim() || undefined,
        shopSlug: form.shopSlug.trim() || undefined,
      });

      if (res.data?.success) {
        const { agent } = res.data.data;
        setAgents((prev) => [agent, ...prev]);
        setNewCredentials({ agent });
        setForm(EMPTY_FORM);
        setFormErrors({});
        setShowForm(false);
        setSuccess('');
        console.log(`[Admin] New delivery agent created: ${agent.email}`);
      }
    } catch (err) {
      console.error('Onboarding failed:', err);
      setError(err.response?.data?.message || 'Failed to onboard delivery agent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Toggle agent active status ───────────────────────────────────────────
  const handleToggleStatus = async (agentId, isActive) => {
    setError('');
    try {
      const res = await apiClient.patch(`/users/${agentId}/status`);
      if (res.data?.success) {
        setAgents((prev) => prev.map(a => a._id === agentId ? { ...a, isActive: !isActive } : a));
        setSuccess(`Agent ${!isActive ? 'activated' : 'suspended'} successfully.`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update agent status.');
    }
  };

  // ─── Delete agent ─────────────────────────────────────────────────────────
  const handleDelete = async (agentId) => {
    if (!window.confirm('Permanently delete this delivery agent? This cannot be undone.')) return;
    setError('');
    try {
      await apiClient.delete(`/users/${agentId}`);
      setAgents((prev) => prev.filter(a => a._id !== agentId));
      setSuccess('Agent deleted successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    }
  };

  // ─── Filtered agents ──────────────────────────────────────────────────────
  const filtered = agents.filter(a =>
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.phone && a.phone.includes(searchTerm)) ||
    (a.assignedShop?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6">

      {/* ─── PAGE HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-brand-text flex items-center gap-2.5">
            <Truck size={22} className="text-cyan-400" />
            Delivery Agents
          </h2>
          <p className="text-xs text-brand-muted mt-1 font-medium">
            Register and manage delivery partners. Assign them to shops and monitor their account status.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Search bar */}
          <div className="relative w-full sm:w-56">
            <input
              type="text"
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#071630] border border-white/5 rounded-xl py-2 pl-4 pr-9 outline-none text-xs text-white placeholder:text-slate-500 focus:border-cyan-500/40 transition-colors"
            />
            <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>

          {/* Refresh */}
          <button
            onClick={fetchData}
            className="p-2 bg-[#071630] border border-white/5 rounded-xl text-slate-400 hover:text-white hover:border-white/10 transition-colors"
            title="Refresh agents list"
          >
            <RefreshCw size={14} />
          </button>

          {/* Onboard button */}
          <button
            onClick={() => { setShowForm(true); setNewCredentials(null); setError(''); }}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-[#000] font-bold text-xs rounded-xl transition-colors shadow-lg shadow-cyan-500/20 whitespace-nowrap"
          >
            <UserPlus size={14} />
            Onboard Agent
          </button>
        </div>
      </div>

      {/* ─── ALERTS ─── */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in slide-in-from-top-2 duration-200">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-400/60 hover:text-red-400"><X size={14} /></button>
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-400 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* ─── NEW AGENT REGISTERED CARD ─── */}
      {newCredentials && (
        <div className="bg-[#071630] border border-cyan-500/30 rounded-2xl p-5 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center">
                <CheckCircle2 size={16} className="text-cyan-400" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">Agent Onboarded Successfully!</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Share the registered email with the agent — they log in via OTP on the delivery app.</p>
              </div>
            </div>
            <button onClick={() => setNewCredentials(null)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5">
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#0A1E3F] rounded-xl p-3.5 border border-white/5">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Registered Email (Login ID)</p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-white truncate">{newCredentials.agent.email}</span>
                <CopyButton text={newCredentials.agent.email} />
              </div>
            </div>
            <div className="bg-[#0A1E3F] rounded-xl p-3.5 border border-cyan-500/15">
              <p className="text-[9px] font-bold text-cyan-500/60 uppercase tracking-wider mb-1">Login Method</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Smartphone size={14} className="text-cyan-400 shrink-0" />
                <span className="text-xs font-bold text-cyan-300">OTP via Delivery App</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                Agent opens the Local Bazar Delivery app, enters their email, and logs in with a 6-digit OTP.
              </p>
            </div>
          </div>

          {newCredentials.agent.assignedShop && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Store size={12} className="text-cyan-400 shrink-0" />
              <span>Assigned to: <span className="font-bold text-white">{newCredentials.agent.assignedShop.name}</span></span>
            </div>
          )}
        </div>
      )}

      {/* ─── ONBOARD FORM MODAL ─── */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0A1E3F] border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
            
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <div>
                <h3 className="font-extrabold text-base text-white">Onboard Delivery Agent</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Enter details to register. Agents log in instantly using OTP on the mobile app.</p>
              </div>
              <button
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormErrors({}); }}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              
              {/* Row 1: Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Kumar"
                    className={`w-full bg-[#071630] border ${formErrors.name ? 'border-red-500/50' : 'border-white/5 focus:border-cyan-500/50'} rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors`}
                  />
                  {formErrors.name && <p className="text-[10px] text-red-400 mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="agent@email.com"
                    className={`w-full bg-[#071630] border ${formErrors.email ? 'border-red-500/50' : 'border-white/5 focus:border-cyan-500/50'} rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors`}
                  />
                  {formErrors.email && <p className="text-[10px] text-red-400 mt-1">{formErrors.email}</p>}
                </div>
              </div>

              {/* Row 2: Phone */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Mobile Number</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile (e.g. 9876543210)"
                  maxLength={10}
                  className={`w-full bg-[#071630] border ${formErrors.phone ? 'border-red-500/50' : 'border-white/5 focus:border-cyan-500/50'} rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors`}
                />
                {formErrors.phone && <p className="text-[10px] text-red-400 mt-1">{formErrors.phone}</p>}
              </div>

              {/* Row 3: Vehicle Type */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Vehicle Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {VEHICLE_TYPES.map(v => (
                    <button
                      type="button"
                      key={v.value}
                      onClick={() => setForm(prev => ({ ...prev, vehicleType: v.value }))}
                      className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        form.vehicleType === v.value
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                          : 'bg-[#071630] border-white/5 text-slate-400 hover:border-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-lg leading-none">{v.emoji}</span>
                      <span>{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 4: Vehicle Number + Shop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Vehicle Number</label>
                  <input
                    name="vehicleNumber"
                    value={form.vehicleNumber}
                    onChange={handleChange}
                    placeholder="e.g. KA-01-AB-1234"
                    className="w-full bg-[#071630] border border-white/5 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Assign to Shop</label>
                  <select
                    name="shopSlug"
                    value={form.shopSlug}
                    onChange={handleChange}
                    className="w-full bg-[#071630] border border-white/5 focus:border-cyan-500/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-colors cursor-pointer appearance-none"
                  >
                    <option value="">— No shop assignment —</option>
                    {shops.map(s => (
                      <option key={s._id} value={s.slug}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit row */}
              <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setFormErrors({}); }}
                  className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-transparent border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#000] transition-colors shadow-lg shadow-cyan-500/20 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
                  {submitting ? 'Onboarding...' : 'Create Agent Account'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ─── STATS ROW ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Agents', value: agents.length, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
          { label: 'Active', value: agents.filter(a => a.isActive).length, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Suspended', value: agents.filter(a => !a.isActive).length, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'Unassigned', value: agents.filter(a => !a.assignedShop).length, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} border rounded-2xl p-4 flex flex-col gap-1`}>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
            <span className={`text-2xl font-black ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* ─── AGENTS TABLE ─── */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Loading agents...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-[#0A1E3F] border border-white/5 rounded-3xl flex flex-col items-center gap-3">
          <span className="text-4xl">🛵</span>
          <h3 className="font-extrabold text-sm text-white mt-2">
            {searchTerm ? 'No agents match your search' : 'No Delivery Agents Yet'}
          </h3>
          <p className="text-xs text-slate-400 max-w-xs">
            {searchTerm ? 'Try a different name, email, or shop name.' : 'Click "Onboard Agent" to register your first delivery partner.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-xl transition-colors"
            >
              <UserPlus size={13} /> Onboard First Agent
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[#0A1E3F] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider bg-[#071630]/65 select-none">
                  <th className="px-6 py-4">Agent</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Vehicle</th>
                  <th className="px-6 py-4">Assigned Shop</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Deliveries</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-semibold text-slate-300">
                {filtered.map(agent => (
                  <tr key={agent._id} className="hover:bg-[#122543]/20 transition-colors">

                    {/* Agent profile */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-black text-white text-xs shrink-0 shadow-inner">
                          {agent.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate max-w-[140px]">{agent.name}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{agent.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <span className="text-slate-300">{agent.phone || '—'}</span>
                    </td>

                    {/* Vehicle */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="capitalize font-bold text-white">
                          {VEHICLE_TYPES.find(v => v.value === agent.vehicleType)?.emoji} {agent.vehicleType}
                        </span>
                        {agent.vehicleNumber && (
                          <span className="text-[10px] text-slate-500 font-mono">{agent.vehicleNumber}</span>
                        )}
                      </div>
                    </td>

                    {/* Assigned shop */}
                    <td className="px-6 py-4">
                      {agent.assignedShop ? (
                        <div className="flex items-center gap-1.5">
                          <Store size={11} className="text-cyan-400 shrink-0" />
                          <span className="text-white font-bold truncate max-w-[120px]">{agent.assignedShop.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic text-[10px]">Not assigned</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {agent.isActive ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                          <UserCheck size={10} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-red-500/20">
                          <UserX size={10} /> Suspended
                        </span>
                      )}
                    </td>

                    {/* Deliveries count */}
                    <td className="px-6 py-4">
                      <span className="font-black text-white">{agent.totalDeliveries ?? 0}</span>
                      <span className="text-slate-500 ml-1 text-[10px]">trips</span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(agent._id, agent.isActive)}
                          className={`p-1.5 border rounded-xl transition-all cursor-pointer ${
                            agent.isActive
                              ? 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400'
                          }`}
                          title={agent.isActive ? 'Suspend Agent' : 'Activate Agent'}
                        >
                          {agent.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                        </button>
                        <button
                          onClick={() => handleDelete(agent._id)}
                          className="p-1.5 border border-transparent hover:border-white/5 hover:bg-[#071630] text-slate-500 hover:text-red-400 rounded-xl transition-all cursor-pointer"
                          title="Delete agent"
                        >
                          <Trash2 size={13} />
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

export default AdminDeliveryAgents;
