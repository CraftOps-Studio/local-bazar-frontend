import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  BarChart3, TrendingUp, IndianRupee, ClipboardList, 
  ShoppingBag, Users, Loader2, Sparkles, PieChart as PieIcon 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
  Cell, PieChart, Pie
} from 'recharts';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminAnalytics = () => {
  const [metrics, setMetrics] = useState({
    totalTurnover: 76870,
    ordersCount: 412,
    merchantsCount: 14,
    usersCount: 89,
  });
  const [loading, setLoading] = useState(false);

  // Mock platform wide metrics
  const monthlyData = [
    { month: 'Jan', Turnover: 12000, Fees: 1200 },
    { month: 'Feb', Turnover: 19000, Fees: 1900 },
    { month: 'Mar', Turnover: 32000, Fees: 3200 },
    { month: 'Apr', Turnover: 54000, Fees: 5400 },
    { month: 'May', Turnover: 76870, Fees: 7687 },
  ];

  const categoryDistribution = [
    { name: 'Grocery', value: 45, color: '#F97316' },
    { name: 'Handicrafts', value: 20, color: '#8B5CF6' },
    { name: 'Bakery', value: 15, color: '#3B82F6' },
    { name: 'Pharmacy', value: 12, color: '#10B981' },
    { name: 'Clothing', value: 8, color: '#EF4444' },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* HEADER */}
      <div className="border-b border-brand-border/40 pb-4">
        <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
          <BarChart3 size={22} className="text-primary" />
          Platform Insights & Analytics
        </h2>
        <p className="text-xs text-brand-muted mt-1 font-sans">
          Deep-dive analysis on overall merchant volume, category splits, and transaction counts.
        </p>
      </div>

      {/* METRIC GRIDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Platform Turnover */}
        <div className="bg-[#0A1E3F] border border-white/5 rounded-3xl p-6 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
            <IndianRupee size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Turnover</span>
            <h3 className="text-2xl font-black text-white mt-1">₹{metrics.totalTurnover.toLocaleString()}</h3>
          </div>
        </div>

        {/* Total platform commissions */}
        <div className="bg-[#0A1E3F] border border-white/5 rounded-3xl p-6 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
            <TrendingUp size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Commission (10%)</span>
            <h3 className="text-2xl font-black text-white mt-1">₹{(metrics.totalTurnover * 0.1).toLocaleString()}</h3>
          </div>
        </div>

        {/* Total Platform Orders */}
        <div className="bg-[#0A1E3F] border border-white/5 rounded-3xl p-6 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <ClipboardList size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Orders</span>
            <h3 className="text-2xl font-black text-white mt-1">{metrics.ordersCount}</h3>
          </div>
        </div>

        {/* Merchants list count */}
        <div className="bg-[#0A1E3F] border border-white/5 rounded-3xl p-6 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Users size={18} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Merchants</span>
            <h3 className="text-2xl font-black text-white mt-1">{metrics.merchantsCount}</h3>
          </div>
        </div>

      </div>

      {/* CHARTS SPLIT LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Growth Bar Chart */}
        <div className="bg-[#0A1E3F] border border-white/5 rounded-3xl p-6 lg:col-span-2 flex flex-col gap-6">
          <div>
            <h3 className="font-extrabold text-sm text-white">Monthly Transaction Turnover Volume</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Platform growth parameters mapped against monthly settlement values.</p>
          </div>

          <div className="h-64 sm:h-72 w-full font-sans text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#071630', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#fff' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="Turnover" name="Total Sales" fill="#F97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Fees" name="Platform Commission" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Pie Chart */}
        <div className="bg-[#0A1E3F] border border-white/5 rounded-3xl p-6 lg:col-span-1 flex flex-col gap-6">
          <div>
            <h3 className="font-extrabold text-sm text-white">Category Market Share</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Distribution of purchases across core platform sectors.</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#071630', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Sector</span>
              <span className="text-sm font-black text-white mt-0.5">Grocery</span>
            </div>
          </div>

          {/* Legend Custom */}
          <div className="flex flex-col gap-2.5 mt-2">
            {categoryDistribution.map((cat) => (
              <div key={cat.name} className="flex justify-between items-center text-xs font-semibold text-slate-300 font-sans">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span>{cat.name}</span>
                </div>
                <span className="text-white font-extrabold">{cat.value}%</span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};

const SellerAnalytics = () => {
  const { shop } = useOutletContext();
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalyticsData = async () => {
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
        console.error('Failed to load analytics data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadAnalyticsData();
  }, [shop?._id]);

  // Calculations
  const paidOrders = orders.filter(
    o => o.paymentStatus === 'paid' || o.orderStatus === 'delivered'
  );
  
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0);
  const totalOrdersCount = orders.length;
  
  const avgOrderValue = totalOrdersCount > 0 
    ? Math.round(totalRevenue / (paidOrders.length || 1)) 
    : 0;

  const totalItemsSold = paidOrders.reduce(
    (sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  // Group by Payment Method
  const paymentMethods = orders.reduce((acc, o) => {
    const method = o.paymentMethod === 'razorpay' ? 'Online' : 'Cash (COD)';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});

  const paymentChartData = Object.keys(paymentMethods).map(name => ({
    name,
    value: paymentMethods[name]
  }));

  const COLORS = ['#7c5cfc', '#38bdf8', '#f43f5e', '#fbbf24'];

  // Best Selling Products calculation
  const bestSellersMap = {};
  paidOrders.forEach(order => {
    order.items.forEach(item => {
      if (bestSellersMap[item.name]) {
        bestSellersMap[item.name].sold += item.quantity;
        bestSellersMap[item.name].revenue += item.price * item.quantity;
      } else {
        bestSellersMap[item.name] = {
          name: item.name,
          sold: item.quantity,
          revenue: item.price * item.quantity
        };
      }
    });
  });

  const bestSellers = Object.values(bestSellersMap)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  // Weekly Revenue Aggregation
  const getWeeklyRevenue = () => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyDataMap = {};
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = daysOfWeek[d.getDay()];
      weeklyDataMap[dayName] = { day: dayName, Sales: 0, Volume: 0 };
    }
    
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const dayName = daysOfWeek[orderDate.getDay()];
      if (weeklyDataMap[dayName]) {
        weeklyDataMap[dayName].Volume += 1;
        if (order.paymentStatus === 'paid' || order.orderStatus === 'delivered') {
          weeklyDataMap[dayName].Sales += order.pricing?.total || 0;
        }
      }
    });

    return Object.values(weeklyDataMap);
  };

  const salesTrendData = getWeeklyRevenue();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 size={32} className="animate-spin text-primary" />
        <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider animate-pulse">
          Analyzing Store Data...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header controls */}
      <div className="border-b border-brand-border/40 pb-4">
        <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
          <BarChart3 size={22} className="text-primary" />
          Store Analytics
        </h2>
        <p className="text-xs text-brand-muted mt-1 font-sans">
          Deep-dive into sales metrics, category performances, and customer retention.
        </p>
      </div>

      {/* Analytics Brief Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Earnings Card */}
        <div className="glass rounded-3xl p-6 border border-brand-border flex items-start gap-4">
          <span className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center shrink-0">
            <IndianRupee size={22} />
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Total Earnings</span>
            <h3 className="text-2xl font-black text-brand-text">₹{totalRevenue.toLocaleString('en-IN')}</h3>
            <span className="text-[10px] text-brand-muted font-sans font-medium">Accumulated revenue</span>
          </div>
        </div>

        {/* Avg Order Value Card */}
        <div className="glass rounded-3xl p-6 border border-brand-border flex items-start gap-4">
          <span className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp size={22} />
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Avg Order Value</span>
            <h3 className="text-2xl font-black text-brand-text">₹{avgOrderValue.toLocaleString('en-IN')}</h3>
            <span className="text-[10px] text-brand-muted font-sans font-medium">Per successful basket</span>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="glass rounded-3xl p-6 border border-brand-border flex items-start gap-4">
          <span className="w-12 h-12 bg-violet-500/10 text-violet-400 rounded-xl flex items-center justify-center shrink-0">
            <ClipboardList size={22} />
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Total Orders</span>
            <h3 className="text-2xl font-black text-brand-text">{totalOrdersCount}</h3>
            <span className="text-[10px] text-brand-muted font-sans font-medium">Placed in catalogue</span>
          </div>
        </div>

        {/* Items Sold Card */}
        <div className="glass rounded-3xl p-6 border border-brand-border flex items-start gap-4">
          <span className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center shrink-0">
            <ShoppingBag size={22} />
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Items Dispatched</span>
            <h3 className="text-2xl font-black text-brand-text">{totalItemsSold}</h3>
            <span className="text-[10px] text-brand-muted font-sans font-medium">Physical items fulfilled</span>
          </div>
        </div>

      </div>

      {/* Main Charts area */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Sales Timeline Card */}
        <div className="lg:col-span-2 glass rounded-3xl p-5 sm:p-6 border border-brand-border flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-brand-border/40 pb-4">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">Sales Timeline</h3>
              <p className="text-[10px] text-brand-muted font-medium">Daily income generated in rupees (INR)</p>
            </div>
          </div>

          <div className="h-72 w-full font-sans text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c5cfc" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c5cfc" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="day" stroke="var(--color-brand-muted)" />
                <YAxis stroke="var(--color-brand-muted)" />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'var(--color-brand-surface)', 
                    borderColor: 'var(--color-brand-border)',
                    borderRadius: '16px',
                    color: 'var(--color-brand-text)'
                  }} 
                />
                <Area type="monotone" dataKey="Sales" stroke="#7c5cfc" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" name="Sales (₹)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods breakdown */}
        <div className="glass rounded-3xl p-5 sm:p-6 border border-brand-border flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-brand-border/40 pb-4">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-1.5">
                <PieIcon size={16} className="text-primary" />
                Payment Channels
              </h3>
              <p className="text-[10px] text-brand-muted font-medium">Razorpay Online vs Cash on Delivery</p>
            </div>
          </div>

          {paymentChartData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-xs text-brand-muted font-sans font-medium">
              No orders placed yet.
            </div>
          ) : (
            <div className="h-72 w-full font-sans text-xs relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'var(--color-brand-surface)', 
                      borderColor: 'var(--color-brand-border)',
                      borderRadius: '16px',
                      color: 'var(--color-brand-text)'
                    }} 
                  />
                  <Pie
                    data={paymentChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

      {/* Best Sellers and catalogue stats */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Best Selling Products */}
        <div className="glass rounded-3xl border border-brand-border overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-brand-border/40 bg-brand-surface-2/20 flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">Best Selling Products</h3>
              <p className="text-[10px] text-brand-muted font-sans font-medium">Items that generate maximum volume</p>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto w-full no-scrollbar">
            {bestSellers.length === 0 ? (
              <div className="text-center py-12 text-brand-muted text-xs font-sans">
                Collect storefront payments to trigger seller rankings!
              </div>
            ) : (
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="border-b border-brand-border/40 text-[10px] font-bold text-brand-muted uppercase tracking-wider select-none bg-brand-surface-2/10">
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4 text-center">Quantities Sold</th>
                    <th className="px-6 py-4 text-right">Revenue Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/20">
                  {bestSellers.map((item, index) => (
                    <tr key={index} className="hover:bg-brand-surface-2/20 transition-all">
                      <td className="px-6 py-4 font-bold text-brand-text flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                          index === 1 ? 'bg-gray-400/20 text-gray-400' :
                          index === 2 ? 'bg-amber-600/20 text-amber-500' : 'bg-brand-surface-2 text-brand-muted'
                        }`}>
                          #{index + 1}
                        </span>
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-brand-text">{item.sold} units</td>
                      <td className="px-6 py-4 text-right font-extrabold text-primary">₹{item.revenue.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Dynamic Category Coverage */}
        <div className="glass rounded-3xl border border-brand-border overflow-hidden p-6 flex flex-col gap-5">
          <div className="border-b border-brand-border/40 pb-4 flex items-center gap-2">
            <span className="text-lg">📁</span>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">Catalogue Category Coverage</h3>
              <p className="text-[10px] text-brand-muted font-sans font-medium">Breadth of items across different categories</p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 text-brand-muted text-xs font-sans">
              No products found in catalogue.
            </div>
          ) : (
            <div className="flex flex-col gap-4 font-sans text-xs">
              {Object.entries(
                products.reduce((acc, p) => {
                  acc[p.category] = (acc[p.category] || 0) + 1;
                  return acc;
                }, {})
              )
                .sort((a, b) => b[1] - a[1])
                .map(([catName, count], idx) => {
                  const pct = Math.round((count / products.length) * 100);
                  return (
                    <div key={catName} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-brand-muted font-medium text-[11px]">
                        <span className="text-brand-text font-bold uppercase tracking-wider">{catName}</span>
                        <span>{count} items ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-brand-surface-2 border border-brand-border rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

const Analytics = () => {
  const { roleMode } = useAuth();
  if (roleMode === 'admin') {
    return <AdminAnalytics />;
  }
  return <SellerAnalytics />;
};

export default Analytics;
