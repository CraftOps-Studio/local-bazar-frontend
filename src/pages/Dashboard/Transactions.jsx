import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  DollarSign, Search, Calendar, CreditCard, Landmark, 
  Loader2, RefreshCcw
} from 'lucide-react';
import apiClient from '../../services/api';

const Transactions = () => {
  const { shop } = useOutletContext();
  const { roleMode } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [filterMethod, setFilterMethod] = useState('all'); // all, razorpay, cod
  const [filterStatus, setFilterStatus] = useState('all'); // all, paid, pending, refunded

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const url = roleMode === 'admin' ? '/orders' : `/orders/shop/${shop?._id}`;
      
      // If we are in merchant view, wait until the shop object is fully fetched
      if (roleMode !== 'admin' && !shop?._id) {
        setLoading(false);
        return;
      }

      const res = await apiClient.get(url);
      if (res.data?.success) {
        setOrders(res.data.data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [shop?._id, roleMode]);

  // Aggregate Stats
  const totalCollections = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

  const onlineRazorpayPaid = orders
    .filter(o => o.paymentStatus === 'paid' && o.paymentMethod === 'razorpay')
    .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

  const cashCodPaid = orders
    .filter(o => o.paymentStatus === 'paid' && o.paymentMethod === 'cod')
    .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

  const pendingCodCollections = orders
    .filter(o => o.paymentStatus === 'pending' && o.paymentMethod === 'cod' && o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

  // Filters
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      (o.orderNumber && o.orderNumber.toLowerCase().includes(searchVal.toLowerCase())) ||
      (o.customer?.name && o.customer.name.toLowerCase().includes(searchVal.toLowerCase())) ||
      (o.shop?.name && o.shop.name.toLowerCase().includes(searchVal.toLowerCase())) ||
      (o.payment?.razorpayPaymentId && o.payment.razorpayPaymentId.toLowerCase().includes(searchVal.toLowerCase()));

    const matchesMethod = filterMethod === 'all' || o.paymentMethod === filterMethod;
    const matchesStatus = filterStatus === 'all' || o.paymentStatus === filterStatus;

    return matchesSearch && matchesMethod && matchesStatus;
  });

  const isAdmin = roleMode === 'admin';

  return (
    <div className="flex flex-col gap-8 relative font-sans animate-fadeIn">
      
      {/* Background neon blur accent */}
      <div className="absolute top-[10%] right-[-15%] w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border/40 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
            <DollarSign size={22} className="text-primary" />
            {isAdmin ? 'Platform Transactions & Earnings' : 'Shop Earnings & Payments'}
          </h2>
          <p className="text-xs text-brand-muted mt-1">
            {isAdmin 
              ? 'Monitor platform-wide online razorpay settlements, cash order logs, and merchant transaction records.'
              : 'Audit your incoming transfers, oversee online Razorpay transactions, and trace Cash on Delivery payouts.'
            }
          </p>
        </div>
        <button
          onClick={fetchTransactions}
          className="w-fit flex items-center gap-1.5 py-2 px-4 rounded-xl border border-brand-border text-xs font-bold text-brand-muted hover:text-brand-text hover:bg-brand-surface-2/40 transition-all select-none cursor-pointer"
        >
          <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh Registry
        </button>
      </div>

      {/* Transaction Aggregate Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Earnings */}
        <div className="glass rounded-3xl p-5 border border-brand-border bg-gradient-to-tr from-emerald-500/5 to-transparent relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {isAdmin ? 'Total Platform Revenue' : 'Total Received Earnings'}
          </span>
          <span className="text-2xl font-black text-emerald-400 mt-2 font-mono">
            ₹{totalCollections.toLocaleString('en-IN')}
          </span>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-border/40">
            <span className="text-[9px] text-brand-muted">Fully Confirmed Settlements</span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">100%</span>
          </div>
        </div>

        {/* Razorpay Online Credits */}
        <div className="glass rounded-3xl p-5 border border-brand-border bg-gradient-to-tr from-primary/5 to-transparent relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Razorpay Online Paid</span>
          <span className="text-2xl font-black text-primary mt-2 font-mono">
            ₹{onlineRazorpayPaid.toLocaleString('en-IN')}
          </span>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-border/40">
            <span className="text-[9px] text-brand-muted">Direct Bank Deposits</span>
            <span className="text-[9.5px] text-primary flex items-center gap-1 font-bold"><CreditCard size={11} /> Online</span>
          </div>
        </div>

        {/* COD cash payouts */}
        <div className="glass rounded-3xl p-5 border border-brand-border bg-gradient-to-tr from-amber-500/5 to-transparent relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">COD Cash Collected</span>
          <span className="text-2xl font-black text-amber-400 mt-2 font-mono">
            ₹{cashCodPaid.toLocaleString('en-IN')}
          </span>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-border/40">
            <span className="text-[9px] text-brand-muted">Hand-to-Hand Delivery Cash</span>
            <span className="text-[9.5px] text-amber-400 flex items-center gap-1 font-bold"><Landmark size={11} /> COD</span>
          </div>
        </div>

        {/* Pending Cash Receivables */}
        <div className="glass rounded-3xl p-5 border border-brand-border bg-gradient-to-tr from-yellow-500/5 to-transparent relative overflow-hidden flex flex-col justify-between min-h-[120px]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending COD Receivables</span>
          <span className="text-2xl font-black text-yellow-400 mt-2 font-mono">
            ₹{pendingCodCollections.toLocaleString('en-IN')}
          </span>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-border/40">
            <span className="text-[9px] text-brand-muted">Outstanding cash on arrival</span>
            <span className="text-[10px] text-yellow-400 font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">Receivable</span>
          </div>
        </div>

      </div>

      {/* Filter and registry Controls */}
      <div className="glass rounded-3xl border border-brand-border overflow-hidden shadow-xl">
        <div className="p-6 bg-brand-surface-2/20 border-b border-brand-border/40 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={isAdmin ? "Search by Order ID, customer, shop name, Razorpay ID..." : "Search by Order ID, customer, Razorpay ID..."}
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-brand-surface-2 border border-brand-border rounded-xl py-2 pl-4 pr-10 outline-none text-xs text-brand-text placeholder-brand-muted"
            />
            <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
          </div>

          {/* Earning Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Method Select */}
            <div className="flex items-center gap-1.5 bg-brand-surface-2 border border-brand-border rounded-xl px-3 py-1.5 text-xs">
              <span className="text-[10px] text-brand-muted font-bold uppercase">Method:</span>
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer text-brand-text font-bold text-[11px]"
              >
                <option value="all" className="bg-[#0A1E3F]">All Methods</option>
                <option value="razorpay" className="bg-[#0A1E3F]">Online (Razorpay)</option>
                <option value="cod" className="bg-[#0A1E3F]">Cash on Delivery</option>
              </select>
            </div>

            {/* Status Select */}
            <div className="flex items-center gap-1.5 bg-brand-surface-2 border border-brand-border rounded-xl px-3 py-1.5 text-xs">
              <span className="text-[10px] text-brand-muted font-bold uppercase">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer text-brand-text font-bold text-[11px]"
              >
                <option value="all" className="bg-[#0A1E3F]">All Statuses</option>
                <option value="paid" className="bg-[#0A1E3F]">Success / Paid</option>
                <option value="pending" className="bg-[#0A1E3F]">Pending Collection</option>
                <option value="failed" className="bg-[#0A1E3F]">Failed</option>
                <option value="refunded" className="bg-[#0A1E3F]">Refunded</option>
              </select>
            </div>
          </div>

        </div>

        {/* Ledger Registry Table */}
        <div className="overflow-x-auto w-full no-scrollbar">
          {loading && orders.length === 0 ? (
            <div className="flex items-center justify-center py-12 gap-2">
              <Loader2 size={18} className="animate-spin text-primary" />
              <span className="text-xs text-brand-muted font-medium">Fetching transactions history...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-brand-muted text-xs">
              No transactions recorded matching your search / filter.
            </div>
          ) : (
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b border-brand-border/40 text-[10px] font-bold text-brand-muted uppercase tracking-wider bg-brand-surface-2/10">
                  <th className="px-6 py-4">Transaction Ref / Date</th>
                  <th className="px-6 py-4">Order Link</th>
                  {isAdmin && <th className="px-6 py-4">Merchant Shop</th>}
                  <th className="px-6 py-4">Payer / Customer</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Transfer Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/20 text-xs">
                {filteredOrders.map((ord) => {
                  const paymentDate = ord.payment?.paidAt 
                    ? new Date(ord.payment.paidAt) 
                    : new Date(ord.createdAt);
                    
                  const formattedDate = paymentDate.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={ord._id} className="hover:bg-brand-surface-2/10 transition-all align-middle">
                      
                      {/* Transaction reference and Timestamp */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-extrabold text-brand-text truncate max-w-[160px] font-mono">
                            {ord.payment?.razorpayPaymentId || `COD-${ord._id.slice(-6).toUpperCase()}`}
                          </span>
                          <span className="text-[10px] text-brand-muted flex items-center gap-1">
                            <Calendar size={10} />
                            {formattedDate}
                          </span>
                        </div>
                      </td>

                      {/* Linked Order ID */}
                      <td className="px-6 py-4">
                        <span className="font-extrabold text-primary select-all">
                          {ord.orderNumber || ord._id.slice(-6).toUpperCase()}
                        </span>
                      </td>

                      {/* Merchant Shop (Admin view only) */}
                      {isAdmin && (
                        <td className="px-6 py-4">
                          <span className="font-bold text-primary flex items-center gap-1">
                            🏪 {ord.shop?.name || 'Local Seller'}
                          </span>
                        </td>
                      )}

                      {/* Payer/Customer Information */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-brand-text">
                            {ord.customer?.name || 'Guest Customer'}
                          </span>
                          {ord.customer?.phone && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {ord.customer.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Payment Method Badge */}
                      <td className="px-6 py-4">
                        <span className="text-[10px] text-brand-text font-bold uppercase tracking-wider font-mono">
                          {ord.paymentMethod === 'razorpay' ? '💳 Razorpay' : '💵 Cash (COD)'}
                        </span>
                      </td>

                      {/* Transfer Amount */}
                      <td className="px-6 py-4">
                        <span className="font-black text-brand-text text-sm font-mono">
                          ₹{ord.pricing?.total?.toLocaleString('en-IN') || '0'}
                        </span>
                      </td>

                      {/* Settlement Payment Status */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider border select-none ${
                          ord.paymentStatus === 'paid' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : ord.paymentStatus === 'failed' 
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            : ord.paymentStatus === 'refunded'
                            ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                            : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                        }`}>
                          {ord.paymentStatus === 'paid' ? 'Success' : ord.paymentStatus}
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};

export default Transactions;
