import React, { useState, useEffect } from 'react';
import { useTranslate } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useOutletContext, Link } from 'react-router-dom';
import { 
  TrendingUp, IndianRupee, ClipboardList, 
  ShoppingBag, Users, Calendar, ArrowUpRight, Loader2, AlertCircle 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import apiClient from '../../services/api';

const Dashboard = () => {
  const { t } = useTranslate();
  const { shop } = useOutletContext();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!shop?._id) return;
      try {
        setLoading(true);
        const [prodRes, ordRes] = await Promise.all([
          apiClient.get(`/products/shop/${shop._id}`),
          apiClient.get(`/orders/shop/${shop._id}`)
        ]);
        if (prodRes.data?.success) {
          setProducts(prodRes.data.data.products || []);
        }
        if (ordRes.data?.success) {
          setOrders(ordRes.data.data.orders || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [shop?._id]);

  // Aggregate stats dynamically
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid' || o.orderStatus === 'delivered')
    .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

  const activeOrdersCount = orders.filter(
    o => !['delivered', 'cancelled', 'refunded'].includes(o.orderStatus)
  ).length;

  const activeCustomersCount = new Set(orders.map(o => o.customer?._id || o.customer)).size;

  const stats = [
    { 
      name: t('totalRevenue'), 
      value: `₹${totalRevenue.toLocaleString('en-IN')}`, 
      icon: IndianRupee 
    },
    { 
      name: t('totalOrders'), 
      value: String(orders.length), 
      icon: ClipboardList 
    },
    { 
      name: t('totalProducts'), 
      value: String(products.length), 
      icon: ShoppingBag 
    },
    { 
      name: t('activeCustomers'), 
      value: String(activeCustomersCount), 
      icon: Users 
    },
  ];

  // Group orders by weekday for charts
  const getWeeklyData = () => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyDataMap = {};
    
    // Initialize map with last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = daysOfWeek[d.getDay()];
      weeklyDataMap[dayName] = { day: dayName, revenue: 0, orders: 0 };
    }
    
    // Fill with real orders data
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const dayName = daysOfWeek[orderDate.getDay()];
      if (weeklyDataMap[dayName]) {
        weeklyDataMap[dayName].orders += 1;
        if (order.paymentStatus === 'paid' || order.orderStatus === 'delivered') {
          weeklyDataMap[dayName].revenue += order.pricing?.total || 0;
        }
      }
    });

    return Object.values(weeklyDataMap);
  };

  const revenueChartData = getWeeklyData();

  const getChartTitleDateRange = () => {
    const start = new Date();
    start.setDate(start.getDate() - 6);
    const end = new Date();
    
    const formatDate = (d) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[d.getMonth()]}-${String(d.getDate()).padStart(2, '0')}`;
    };
    return `Revenue Generation from ${formatDate(start)} to ${formatDate(end)}`;
  };

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const statusBadges = {
    pending: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    confirmed: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    preparing: 'bg-primary/10 border-primary/20 text-primary',
    out_for_delivery: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    delivered: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    cancelled: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    refunded: 'bg-gray-500/10 border-gray-500/20 text-gray-400',
  };

  const formatTimeAgo = (dateStr) => {
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} ${diffHrs === 1 ? 'hr' : 'hrs'} ago`;
    return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-black gap-3">
        <Loader2 size={32} className="animate-spin text-[#F97316]" />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider animate-pulse">
          Retrieving Dashboard Metrics...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 bg-black text-white min-h-screen">
      
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#F97316]/10 to-[#FB923C]/5 border border-[#F97316]/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-44 h-44 bg-[#F97316]/10 rounded-full blur-[60px] pointer-events-none" />
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Welcome Back, {shop?.name || 'Seller'}!</h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Here is your local store summary for the last 7 days. Your listings are fully operational.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-[#121214] border border-white/5 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-300">
          <Calendar size={14} className="text-[#F97316]" />
          <span>Last 7 Days</span>
        </div>
      </div>

      {/* Pending / Rejected Banner */}
      {shop?.status === 'pending' && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6 flex items-start gap-4 shadow-lg shadow-yellow-500/5">
          <div className="bg-yellow-500/20 text-yellow-500 p-2 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-yellow-500">Shop Pending Admin Approval</h3>
            <p className="text-sm text-yellow-500/80 mt-1">
              Your shop registration has been received and is currently under review by our platform administrators. You will be able to list products and receive orders once your shop is approved.
            </p>
          </div>
        </div>
      )}

      {shop?.status === 'rejected' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-4 shadow-lg shadow-red-500/5">
          <div className="bg-red-500/20 text-red-500 p-2 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-500">Shop Registration Rejected</h3>
            <p className="text-sm text-red-500/80 mt-1">
              Unfortunately, your shop registration could not be approved at this time. Please contact support for more information.
            </p>
          </div>
        </div>
      )}

      {/* Premium Stats Grid (Matching screenshot layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.name}
              className="bg-[#121214] rounded-2xl p-5 sm:p-6 border border-white/5 flex items-center gap-6 group hover:border-[#F97316]/30 transition-all duration-300 shadow-xl"
            >
              {/* Large Orange Icon */}
              <div className="text-[#F97316] shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Icon size={32} strokeWidth={1.5} />
              </div>
              
              {/* Divider */}
              <div className="h-12 w-[1px] bg-white/10 shrink-0" />
              
              {/* Values */}
              <div className="flex flex-col min-w-0">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                  {stat.value}
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none mt-0.5">
                  {stat.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Wide Bar Chart (Matching screenshot exactly) */}
      <div className="bg-[#121214] rounded-3xl p-6 sm:p-8 border border-white/5 flex flex-col gap-6 shadow-2xl">
        <div className="border-b border-white/5 pb-4">
          <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide uppercase text-slate-300">
            {getChartTitleDateRange()}
          </h3>
        </div>

        <div className="h-80 w-full font-sans text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.4)" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#121214', 
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  color: '#ffffff'
                }} 
              />
              <Bar 
                dataKey="revenue" 
                fill="#F97316" 
                radius={[6, 6, 0, 0]} 
                name="Revenue (₹)"
                maxBarSize={60}
                label={{ 
                  position: 'top', 
                  fill: '#ffffff', 
                  fontSize: 10, 
                  fontWeight: 'bold',
                  formatter: (v) => v > 0 ? `₹${v}` : '' 
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders log */}
      <div className="bg-[#121214] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="px-6 py-5 border-b border-white/5 bg-[#121214] flex items-center justify-between">
          <h3 className="font-extrabold text-sm sm:text-base text-white">Incoming Orders</h3>
          <Link to="/dashboard/orders" className="text-xs font-bold text-[#F97316] hover:underline flex items-center gap-0.5">
            Manage All <ArrowUpRight size={13} />
          </Link>
        </div>
        
        <div className="overflow-x-auto w-full no-scrollbar">
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs font-sans">
              No orders received yet. Share your store link with customers to start selling!
            </div>
          ) : (
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none bg-black/30">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Products</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Timeline</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
                {recentOrders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-white/[0.02] transition-all">
                    <td className="px-6 py-4 font-bold text-white">
                      <Link to={`/dashboard/orders`} className="hover:text-[#F97316] hover:underline">
                        {ord.orderNumber || ord._id.slice(-6).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-200">
                      {ord.customer?.name || 'Guest User'}
                    </td>
                    <td className="px-6 py-4 text-slate-400 max-w-[200px] truncate">
                      {ord.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#F97316]">
                      ₹{ord.pricing?.total?.toLocaleString('en-IN') || '0'}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {formatTimeAgo(ord.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border select-none ${statusBadges[ord.orderStatus] || 'text-slate-400 border-white/10'}`}>
                        {ord.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
