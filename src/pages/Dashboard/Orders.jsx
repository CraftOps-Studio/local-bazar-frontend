import React, { useState, useEffect } from 'react';
import { useTranslate } from '../../context/LanguageContext';
import { useOutletContext } from 'react-router-dom';
import { 
  ClipboardList, Search, Info, ShieldCheck, 
  Loader2, User, Phone, MapPin, DollarSign, Calendar 
} from 'lucide-react';
import apiClient from '../../services/api';

const Orders = () => {
  const { t } = useTranslate();
  const { shop } = useOutletContext();

  const [orders, setOrders] = useState([]);
  const [deliveryAgents, setDeliveryAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // stores order._id currently updating
  const [codCheckOrder, setCodCheckOrder] = useState(null); // { orderId, newStatus, total }

  const fetchOrders = async () => {
    if (!shop?._id) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/orders/shop/${shop._id}`);
      if (res.data?.success) {
        setOrders(res.data.data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveryAgents = async () => {
    try {
      const res = await apiClient.get('/users/delivery-agents');
      if (res.data?.success) {
        setDeliveryAgents(res.data.data.agents || []);
      }
    } catch (err) {
      console.error('Failed to fetch delivery agents:', err.message);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchDeliveryAgents();
  }, [shop?._id]);

  const handleAssignPartner = async (orderId, agentId) => {
    try {
      setActionLoading(orderId);
      const order = orders.find(o => o._id === orderId);
      const res = await apiClient.patch(`/orders/${orderId}/status`, {
        status: order.orderStatus,
        deliveryPartner: agentId || null,
        note: agentId ? 'Assigned a delivery agent' : 'Removed delivery agent'
      });
      if (res.data?.success) {
        const selectedAgent = deliveryAgents.find(a => a._id === agentId) || null;
        setOrders(orders.map(o => o._id === orderId 
          ? { 
              ...o, 
              deliveryPartner: selectedAgent,
              deliveryStatus: agentId ? 'NEW' : undefined 
            } 
          : o
        ));
      }
    } catch (err) {
      console.error('Failed to assign agent:', err.message);
      alert('Could not update delivery assignment.');
    } finally {
      setActionLoading(null);
    }
  };

  const executeStatusPatch = async (orderId, newStatus, paymentStatusOverride = null) => {
    let patchPayload = {
      status: newStatus,
      note: `Updated via Seller Portal to ${newStatus}`
    };

    if (paymentStatusOverride) {
      patchPayload.paymentStatus = paymentStatusOverride;
    }

    try {
      setActionLoading(orderId);
      const res = await apiClient.patch(`/orders/${orderId}/status`, patchPayload);
      if (res.data?.success) {
        // Update local state instantly
        setOrders(orders.map(o => o._id === orderId 
          ? { 
              ...o, 
              orderStatus: newStatus, 
              paymentStatus: patchPayload.paymentStatus || o.paymentStatus 
            } 
          : o
        ));
      }
    } catch (err) {
      console.error('Failed to patch order status:', err.message);
      alert(err.response?.data?.message || 'Could not update order status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    const order = orders.find(o => o._id === orderId);

    if (newStatus === 'delivered' && order?.paymentMethod === 'cod' && order?.paymentStatus !== 'paid') {
      setCodCheckOrder({
        orderId,
        newStatus,
        total: order.pricing?.total,
        orderNumber: order.orderNumber || order._id.slice(-6).toUpperCase(),
        customerName: order.customer?.name || 'Guest User'
      });
      return;
    }

    await executeStatusPatch(orderId, newStatus);
  };

  const handleConfirmCodCollection = async () => {
    if (!codCheckOrder) return;
    const { orderId, newStatus } = codCheckOrder;
    setCodCheckOrder(null);
    await executeStatusPatch(orderId, newStatus, 'paid');
  };

  const statusBadges = {
    pending: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    confirmed: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    preparing: 'bg-primary/10 border-primary/20 text-primary',
    out_for_delivery: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    delivered: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    cancelled: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    refunded: 'bg-gray-500/10 border-gray-500/20 text-gray-400',
  };

  const allowedTransitions = {
    pending: [
      { status: 'confirmed', label: 'Confirm Order' },
      { status: 'cancelled', label: 'Cancel Order' }
    ],
    confirmed: [
      { status: 'preparing', label: 'Start Preparing' },
      { status: 'cancelled', label: 'Cancel Order' }
    ],
    preparing: [
      { status: 'out_for_delivery', label: 'Send Out for Delivery' },
      { status: 'cancelled', label: 'Cancel Order' }
    ],
    out_for_delivery: [
      { status: 'delivered', label: 'Deliver Order' }
    ],
    delivered: [],
    cancelled: [],
    refunded: [],
  };

  const filteredOrders = orders.filter((o) =>
    (o.orderNumber && o.orderNumber.toLowerCase().includes(searchVal.toLowerCase())) ||
    (o.customer?.name && o.customer.name.toLowerCase().includes(searchVal.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-border/40 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
            <ClipboardList size={22} className="text-primary" />
            Customer Orders
          </h2>
          <p className="text-xs text-brand-muted mt-1 font-sans">
            Manage outgoing orders, adjust delivery timelines, and verify dispatch states.
          </p>
        </div>
      </div>

      {/* Orders filter & search */}
      <div className="glass rounded-3xl border border-brand-border overflow-hidden">
        <div className="px-6 py-4 bg-brand-surface-2/20 border-b border-brand-border/40 flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by Order ID or customer name..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-brand-surface-2 border border-brand-border rounded-xl py-2 pl-4 pr-10 outline-none text-xs text-brand-text placeholder-brand-muted"
            />
            <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
          </div>
        </div>

        <div className="overflow-x-auto w-full no-scrollbar">
          {loading && orders.length === 0 ? (
            <div className="flex items-center justify-center py-12 gap-2">
              <Loader2 size={18} className="animate-spin text-primary" />
              <span className="text-xs text-brand-muted font-sans font-medium">Fetching active shipments...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-brand-muted text-xs font-sans">
              No orders found matching your search.
            </div>
          ) : (
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b border-brand-border/40 text-[10px] font-bold text-brand-muted uppercase tracking-wider bg-brand-surface-2/10">
                  <th className="px-6 py-4">Order Details</th>
                  <th className="px-6 py-4">Buyer Info</th>
                  <th className="px-6 py-4">Delivery Address</th>
                  <th className="px-6 py-4">Cart summary</th>
                  <th className="px-6 py-4">Pricing</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Delivery Agent</th>
                  <th className="px-6 py-4 text-center">Fulfill Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/20 text-xs">
                {filteredOrders.map((ord) => {
                  const transitions = allowedTransitions[ord.orderStatus] || [];
                  const createdDate = new Date(ord.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={ord._id} className="hover:bg-brand-surface-2/10 transition-all align-top">
                      
                      {/* Order Number & Date */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-extrabold text-brand-text">
                            {ord.orderNumber || ord._id.slice(-6).toUpperCase()}
                          </span>
                          <span className="text-[10px] text-brand-muted flex items-center gap-1">
                            <Calendar size={10} />
                            {createdDate}
                          </span>
                        </div>
                      </td>

                      {/* Buyer Details */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-brand-text flex items-center gap-1">
                            <User size={11} className="text-brand-muted" />
                            {ord.customer?.name || 'Guest User'}
                          </span>
                          {ord.customer?.phone && (
                            <span className="text-[10px] text-brand-muted flex items-center gap-1 font-mono">
                              <Phone size={11} />
                              {ord.customer.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Delivery Address */}
                      <td className="px-6 py-4 max-w-[180px]">
                        <div className="text-brand-muted text-[10px] flex gap-1 leading-normal">
                          <MapPin size={12} className="shrink-0 text-brand-muted/75" />
                          <span>
                            {ord.shippingAddress?.street}, {ord.shippingAddress?.city}, {ord.shippingAddress?.pincode}
                          </span>
                        </div>
                      </td>

                      {/* Cart Summary */}
                      <td className="px-6 py-4 max-w-[200px]">
                        <div className="flex flex-col gap-1">
                          {ord.items.map((item, idx) => (
                            <span key={idx} className="text-brand-muted text-[10px] truncate block">
                              {item.quantity}x <strong className="text-brand-text">{item.name}</strong> (₹{item.price})
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="px-6 py-4 font-bold text-primary">
                        <div className="flex flex-col">
                          <span>₹{ord.pricing?.total?.toLocaleString('en-IN') || '0'}</span>
                          {ord.pricing?.deliveryCharge > 0 && (
                            <span className="text-[9px] text-brand-muted font-sans font-medium">
                              (incl. ₹{ord.pricing.deliveryCharge} delivery)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Payment Mode & Status */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-brand-text font-bold uppercase tracking-wider font-mono">
                            {ord.paymentMethod === 'razorpay' ? '💳 Razorpay' : '💵 Cash (COD)'}
                          </span>
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded border w-fit uppercase select-none ${
                            ord.paymentStatus === 'paid' 
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                              : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                          }`}>
                            {ord.paymentStatus}
                          </span>
                        </div>
                      </td>

                      {/* Order Status Badge */}
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider border select-none ${statusBadges[ord.orderStatus] || 'text-brand-muted border-brand-border'}`}>
                          {ord.orderStatus}
                        </span>
                      </td>

                      {/* Delivery Agent Assignment Selector */}
                      <td className="px-6 py-4 min-w-[160px]">
                        <div className="flex flex-col gap-1.5">
                          {ord.deliveryPartner ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-white flex items-center gap-1 text-xs">
                                🛵 {ord.deliveryPartner.name}
                              </span>
                              {ord.deliveryStatus && (
                                <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded w-fit select-none">
                                  {ord.deliveryStatus.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 italic text-[10px]">Unassigned</span>
                          )}
                          
                          <select
                            value={ord.deliveryPartner?._id || ''}
                            onChange={(e) => handleAssignPartner(ord._id, e.target.value)}
                            disabled={['delivered', 'cancelled', 'refunded'].includes(ord.orderStatus)}
                            className="bg-[#071630] border border-white/5 focus:border-primary/50 rounded-lg px-2 py-1 text-[10px] text-white outline-none cursor-pointer max-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                          >
                            <option value="">— Assign Rider —</option>
                            {deliveryAgents.map(agent => (
                              <option key={agent._id} value={agent._id}>
                                {agent.name} {agent.vehicleType ? `(${agent.vehicleType})` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Fulfill Action Selectors */}
                      <td className="px-6 py-4 text-center">
                        {actionLoading === ord._id ? (
                          <div className="flex items-center justify-center">
                            <Loader2 size={16} className="animate-spin text-primary" />
                          </div>
                        ) : transitions.length === 0 ? (
                          <span className="text-[10px] text-brand-muted font-bold tracking-wide italic">
                            Fulfillment Complete
                          </span>
                        ) : (
                          <div className="flex flex-col gap-1.5 w-36 mx-auto">
                            {transitions.map((transition) => (
                              <button
                                key={transition.status}
                                onClick={() => handleUpdateStatus(ord._id, transition.status)}
                                className={`
                                  py-1.5 px-2.5 border rounded-lg text-[10px] font-bold select-none cursor-pointer tracking-wider uppercase transition-all duration-150 active:scale-[0.98]
                                  ${transition.status === 'cancelled'
                                    ? 'bg-rose-500/5 border-rose-500/20 text-rose-400 hover:bg-rose-500/10'
                                    : 'bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 hover:border-primary/40'
                                  }
                                `}
                              >
                                {transition.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Premium Glassmorphic COD Cash Collection Modal Overlay */}
      {codCheckOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg/80 backdrop-blur-md transition-all duration-200">
          <div className="glass rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl relative border border-brand-border flex flex-col items-center text-center gap-6 bg-brand-surface/95">
            {/* Glowing Icon Container */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign size={32} />
            </div>

            {/* Modal Content */}
            <div className="flex flex-col gap-1.5">
              <h3 className="text-xl font-black text-brand-text">
                Confirm Cash Collection
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed font-sans mt-1">
                You are marking Cash on Delivery (COD) <strong className="text-brand-text">Order #{codCheckOrder.orderNumber}</strong> for <strong className="text-brand-text">{codCheckOrder.customerName}</strong> as <strong className="text-emerald-400">Delivered</strong>.
              </p>
            </div>

            {/* Total Collected Highlight */}
            <div className="w-full bg-brand-surface-2/50 border border-brand-border rounded-2xl p-4 flex flex-col gap-1 items-center">
              <span className="text-[10px] text-brand-muted uppercase font-bold tracking-wider">Amount to Collect in Cash</span>
              <span className="text-3xl font-black text-primary font-mono">
                ₹{codCheckOrder.total?.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Warning Note */}
            <p className="text-[10px] text-yellow-500/80 bg-yellow-500/5 border border-yellow-500/15 rounded-xl p-3 text-left leading-normal font-sans">
              ⚠️ <strong>Important</strong>: Only confirm if you have physically received this cash amount. This action will permanently update the order payment status to <strong>Paid</strong> and dispatch status to <strong>Delivered</strong> on the backend.
            </p>

            {/* Actions */}
            <div className="flex w-full gap-3 mt-2">
              <button
                onClick={() => setCodCheckOrder(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-brand-border text-xs font-bold text-brand-muted hover:text-brand-text hover:bg-brand-surface-2/40 transition-all select-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCodCollection}
                className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] select-none cursor-pointer flex items-center justify-center"
              >
                Yes, Cash Collected
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;
