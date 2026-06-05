import React, { useState, useEffect } from 'react';
import { Store, Users, ShoppingBag, Landmark, ArrowRight, ShieldCheck, Clock, ShieldAlert } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import apiClient from '../../../services/api';
import Button from '../../../components/common/Button';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalShops: 0,
    verifiedShops: 0,
    pendingShops: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentShops, setRecentShops] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchAdminOverview = async () => {
      setLoading(true);
      try {
        const [shopsRes, usersRes, productsRes, ordersRes] = await Promise.all([
          apiClient.get('/shops'),
          apiClient.get('/users'),
          apiClient.get('/products'),
          apiClient.get('/orders'),
        ]);

        const shopsList = shopsRes.data?.data?.shops || [];
        const usersList = usersRes.data?.data?.users || [];
        const productsCount = productsRes.data?.data?.products?.length || 0;
        const ordersList = ordersRes.data?.data?.orders || [];

        const totalShops = shopsList.length;
        const verifiedShops = shopsList.filter(s => s.isVerified).length;
        const pendingShops = totalShops - verifiedShops;

        // Compute real revenue from paid orders
        const paidOrders = ordersList.filter(o => o.paymentStatus === 'paid' || o.orderStatus === 'delivered');
        const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

        setStats({
          totalShops,
          verifiedShops,
          pendingShops,
          totalUsers: usersList.length,
          totalProducts: productsCount,
          totalRevenue,
        });

        // Build weekly chart from real orders
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyMap = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dayName = daysOfWeek[d.getDay()];
          weeklyMap[dayName] = { name: dayName, Revenue: 0, Fees: 0 };
        }
        ordersList.forEach(order => {
          const orderDate = new Date(order.createdAt);
          const dayName = daysOfWeek[orderDate.getDay()];
          if (weeklyMap[dayName] && (order.paymentStatus === 'paid' || order.orderStatus === 'delivered')) {
            const amount = order.pricing?.total || 0;
            weeklyMap[dayName].Revenue += amount;
            weeklyMap[dayName].Fees += Math.round(amount * 0.1);
          }
        });
        setChartData(Object.values(weeklyMap));

        setRecentShops(shopsList.slice(-5).reverse());
        setRecentUsers(usersList.slice(-5).reverse());
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-brand-muted text-xs font-bold uppercase tracking-widest">
          Generating Platform Report...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      
      {/* ─── PLATFORM TITLE HEADER ─── */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-brand-text flex items-center gap-2">
          Platform Overview
        </h2>
        <p className="text-xs text-brand-muted font-semibold mt-1">
          Super-admin cockpit monitoring all shops, customers, catalog inventory, and commission revenues.
        </p>
      </div>

      {/* ─── METRIC STAT CARDS GRID ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Shops */}
        <div className="bg-[#0A1E3F] border border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shadow-inner">
            <Store size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest select-none">Total Shops</span>
            <h3 className="text-2xl font-black text-white mt-1">{stats.totalShops}</h3>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold mt-1">
            <span className="text-emerald-400 font-bold">{stats.verifiedShops} Verified</span>
            <span>•</span>
            <span className="text-orange-400 font-bold">{stats.pendingShops} Pending</span>
          </div>
        </div>

        {/* Total Platform Users */}
        <div className="bg-[#0A1E3F] border border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shadow-inner">
            <Users size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest select-none">Registered Users</span>
            <h3 className="text-2xl font-black text-white mt-1">{stats.totalUsers}</h3>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            Active customers & merchants
          </p>
        </div>

        {/* Total Products Listing */}
        <div className="bg-[#0A1E3F] border border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-inner">
            <ShoppingBag size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest select-none">Total Products</span>
            <h3 className="text-2xl font-black text-white mt-1">{stats.totalProducts}</h3>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            Live catalog items in local bazars
          </p>
        </div>

        {/* Estimated Platform Commissions */}
        <div className="bg-[#0A1E3F] border border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
            <Landmark size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest select-none">Est. Platform Fees</span>
            <h3 className="text-2xl font-black text-white mt-1">₹{Math.round(stats.totalRevenue * 0.1).toLocaleString('en-IN')}</h3>
          </div>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            10% flat commission rate
          </p>
        </div>

      </div>

      {/* ─── PLATFORM TRANSACTION PERFORMANCE CHART ─── */}
      <div className="bg-[#0A1E3F] border border-white/5 rounded-3xl p-6 flex flex-col gap-6">
        <div>
          <h3 className="font-extrabold text-sm text-white tracking-tight">Platform Sales & Fees Velocity</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Real-time mapping of weekly store turnovers and associated commission balances.</p>
        </div>

        <div className="h-64 sm:h-80 w-full font-sans text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#071630', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                labelStyle={{ fontWeight: 'bold', color: '#fff' }}
              />
              <Area type="monotone" dataKey="Revenue" stroke="#F97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              <Area type="monotone" dataKey="Fees" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorFees)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── DUAL SPLIT RECENT FEEDS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Shops Requiring Action / Recent Shops */}
        <div className="bg-[#0A1E3F] border border-white/5 rounded-3xl p-6 flex flex-col gap-5">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-white">Recent Shop Registrations</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Approve newly registered merchants to sell online</p>
            </div>
            <Link to="/dashboard/shops" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
              Manage Shops <ArrowRight size={12} />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {recentShops.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">No shops registered yet.</p>
            ) : (
              recentShops.map((shop) => (
                <div key={shop._id} className="bg-[#071630] border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#122543] border border-white/5 shrink-0 flex items-center justify-center font-bold text-slate-300">
                      {shop.logo?.url ? (
                        <img src={shop.logo.url} alt={shop.name} className="w-full h-full object-cover" />
                      ) : (
                        shop.name.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white truncate max-w-[150px]">{shop.name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">{shop.address?.pincode || 'No Pincode'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {shop.isVerified ? (
                      <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1 select-none">
                        <ShieldCheck size={10} /> Live
                      </span>
                    ) : (
                      <span className="bg-orange-500/10 text-orange-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-orange-500/20 flex items-center gap-1 select-none">
                        <Clock size={10} /> Pending
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent User Registrations */}
        <div className="bg-[#0A1E3F] border border-white/5 rounded-3xl p-6 flex flex-col gap-5">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-white">Recent Users Joined</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Manage customer security, suspend/verify accounts</p>
            </div>
            <Link to="/dashboard/users" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
              Manage Users <ArrowRight size={12} />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {recentUsers.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-6">No users signed up yet.</p>
            ) : (
              recentUsers.map((user) => (
                <div key={user._id} className="bg-[#071630] border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#9858FF] to-[#8B5CF6] flex items-center justify-center font-bold text-white text-xs shadow-inner">
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white truncate max-w-[150px]">{user.name}</h4>
                      <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border select-none uppercase tracking-wider
                      ${user.role === 'admin' 
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                        : user.role === 'shopOwner' 
                        ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' 
                        : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                      }
                    `}>
                      {user.role}
                    </span>
                    
                    {user.isActive ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active Account" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-red-500" title="Suspended Account" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
