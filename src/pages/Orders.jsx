import React, { useState, useEffect } from 'react';
import { useTranslate } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import {
  ClipboardList, ShoppingBag, Truck, MapPin,
  Calendar, Loader2, AlertCircle
} from 'lucide-react';
import apiClient from '../services/api';

const Orders = () => {
  const { t } = useTranslate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/orders/my-orders');
      if (res.data?.success) setOrders(res.data.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch customer orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancellingOrder) return;
    try {
      setCancelLoading(true);
      const res = await apiClient.patch(`/orders/${cancellingOrder.orderId}/cancel`, {
        reason: cancelReason || 'Cancelled by customer',
      });
      if (res.data?.success) {
        setOrders(orders.map((o) =>
          o._id === cancellingOrder.orderId
            ? { ...o, orderStatus: 'cancelled', cancellationReason: cancelReason || 'Cancelled by customer' }
            : o
        ));
        setCancellingOrder(null);
        setCancelReason('');
      }
    } catch (err) {
      console.error('Failed to cancel order:', err.message);
      alert(err.response?.data?.message || 'Could not cancel the order.');
    } finally {
      setCancelLoading(false);
    }
  };

  useEffect(() => { fetchMyOrders(); }, []);

  const getStatusStepIndex = (status) => {
    const steps = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    return steps.indexOf(status);
  };

  const statusTexts = {
    pending: 'Order Placed',
    confirmed: 'Confirmed by Seller',
    preparing: 'Items Preparing',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  };

  const stepLabels = [
    { label: 'Placed', desc: 'Order received' },
    { label: 'Accepted', desc: 'Seller accepted' },
    { label: 'Prepared', desc: 'Items packed' },
    { label: 'Dispatched', desc: 'On the way' },
    { label: 'Delivered', desc: 'Complete' },
  ];

  const paymentBadgeStyle = (status) => status === 'paid'
    ? { background: '#ECFDF5', color: '#065F46', border: '1px solid #6EE7B7' }
    : { background: '#FFFBEB', color: '#92400E', border: '1px solid #FCD34D' };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 size={32} className="animate-spin" style={{ color: '#F97316' }} />
        <p className="text-xs font-semibold uppercase tracking-wider animate-pulse" style={{ color: 'var(--text-muted)' }}>
          Loading your orders...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 flex flex-col gap-6 animate-slideUp">

      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <ClipboardList size={22} style={{ color: '#F97316' }} />
          My Orders
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Track your deliveries and view order receipts.
        </p>
      </div>

      {orders.length === 0 ? (
        <div
          className="rounded-3xl p-12 text-center max-w-md mx-auto my-12 flex flex-col items-center gap-4"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
        >
          <span className="text-4xl">📦</span>
          <h3 className="font-extrabold text-sm sm:text-base" style={{ color: 'var(--text)' }}>No orders placed yet</h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Support your nearby shopkeepers by placing your first order today!
          </p>
          <Link to="/storefront">
            <button
              className="px-5 py-2.5 text-white text-xs font-bold rounded-xl transition-all active:scale-[0.98]"
              style={{ background: '#F97316' }}
            >
              Browse Local Catalogue
            </button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {orders.map((order) => {
            const currentStep = getStatusStepIndex(order.orderStatus);
            const isCancelled = order.orderStatus === 'cancelled';
            const createdDate = new Date(order.createdAt).toLocaleDateString(undefined, {
              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
            });

            return (
              <div
                key={order._id}
                className="rounded-3xl overflow-hidden"
                style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
              >

                {/* Order Header */}
                <div
                  className="px-5 py-4 flex flex-col sm:flex-row justify-between gap-4 text-xs"
                  style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
                >
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Order ID</span>
                      <span className="font-extrabold text-sm" style={{ color: 'var(--text)' }}>
                        #{order.orderNumber || order._id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Placed On</span>
                      <span className="font-semibold flex items-center gap-1" style={{ color: 'var(--text)' }}>
                        <Calendar size={12} style={{ color: '#F97316' }} />
                        {createdDate}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Store</span>
                      <span className="font-bold" style={{ color: '#F97316' }}>
                        🏪 {order.shop?.name || 'Local Seller'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-2">
                    <div className="flex flex-col sm:items-end gap-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Total Paid</span>
                      <span className="font-black text-sm" style={{ color: '#F97316' }}>
                        ₹{order.pricing?.total?.toLocaleString('en-IN') || '0'}
                      </span>
                    </div>
                    <span
                      className="px-2.5 py-0.5 text-[9px] font-extrabold rounded-md uppercase tracking-wider"
                      style={paymentBadgeStyle(order.paymentStatus)}
                    >
                      {order.paymentMethod === 'razorpay' ? '💳 Online' : '💵 COD'} — {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Tracking */}
                <div className="p-5 sm:p-6 flex flex-col gap-5" style={{ borderBottom: '1px solid var(--border)' }}>
                  {isCancelled ? (
                    <div
                      className="rounded-2xl p-4 flex items-start gap-3 text-xs"
                      style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B' }}
                    >
                      <AlertCircle size={18} className="shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-sm block">Order Cancelled</span>
                        <p className="text-[11px] mt-1 leading-relaxed" style={{ color: '#B91C1C' }}>
                          Reason: {order.cancellationReason || 'Standard cancellation.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {/* Active status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <Truck size={14} className="animate-pulse" style={{ color: '#F97316' }} />
                          <span style={{ color: 'var(--text-secondary)' }}>Status: </span>
                          <span className="font-black uppercase tracking-wide" style={{ color: '#F97316' }}>
                            {statusTexts[order.orderStatus] || order.orderStatus}
                          </span>
                        </div>
                        {['pending', 'confirmed'].includes(order.orderStatus) && (
                          <button
                            onClick={() => setCancellingOrder({
                              orderId: order._id,
                              orderNumber: order.orderNumber || order._id.slice(-6).toUpperCase(),
                            })}
                            className="w-fit py-1.5 px-3 rounded-lg text-[10px] font-extrabold tracking-wider uppercase transition-all cursor-pointer"
                            style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>

                      {/* Desktop stepper */}
                      <div className="hidden sm:flex items-center justify-between w-full text-center relative py-4">
                        <div className="absolute top-1/2 left-0 right-0 h-1 rounded-full -translate-y-1/2 -z-10" style={{ background: 'var(--surface)' }} />
                        <div
                          className="absolute top-1/2 left-0 h-1 -translate-y-1/2 -z-10 rounded-full transition-all duration-700"
                          style={{ width: `${(Math.max(0, currentStep) / 4) * 100}%`, background: '#F97316' }}
                        />
                        {stepLabels.map((step, idx) => {
                          const isCompleted = idx <= currentStep;
                          const isActive = idx === currentStep;
                          return (
                            <div key={idx} className="flex flex-col items-center gap-2 w-24">
                              <span
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300"
                                style={isCompleted
                                  ? { background: '#F97316', borderColor: '#F97316', color: 'white', boxShadow: '0 2px 8px rgba(249,115,22,0.3)' }
                                  : { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }
                                }
                              >
                                {isCompleted ? '✓' : idx + 1}
                              </span>
                              <div className="flex flex-col">
                                <span className="text-[11px] font-extrabold tracking-tight" style={{ color: isCompleted ? 'var(--text)' : 'var(--text-muted)' }}>
                                  {step.label}
                                </span>
                                <span className="text-[9px] mt-0.5 leading-none" style={{ color: 'var(--text-muted)' }}>
                                  {step.desc}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Mobile stepper */}
                      <div className="flex sm:hidden flex-col gap-3 pl-1">
                        {stepLabels.map((step, idx) => {
                          const isCompleted = idx <= currentStep;
                          return (
                            <div key={idx} className="flex items-center gap-3.5">
                              <span
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0"
                                style={isCompleted
                                  ? { background: '#F97316', borderColor: '#F97316', color: 'white' }
                                  : { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }
                                }
                              >
                                {isCompleted ? '✓' : idx + 1}
                              </span>
                              <div className="flex flex-col">
                                <span className="text-xs font-extrabold leading-none" style={{ color: isCompleted ? 'var(--text)' : 'var(--text-muted)' }}>
                                  {step.label}
                                </span>
                                <span className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{step.desc}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="p-5 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider block mb-3" style={{ color: 'var(--text-muted)' }}>
                    Items in Order
                  </span>
                  <div className="flex flex-col gap-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                          >
                            {item.image
                              ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              : <ShoppingBag size={14} style={{ color: 'var(--text-muted)' }} />
                            }
                          </div>
                          <div>
                            <span className="font-bold block" style={{ color: 'var(--text)' }}>{item.name}</span>
                            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>₹{item.price} each</span>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-0.5">
                          <span className="font-bold" style={{ color: 'var(--text)' }}>×{item.quantity}</span>
                          <span className="font-extrabold" style={{ color: '#F97316' }}>₹{item.price * item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.shippingAddress && (
                    <div className="mt-4 pt-4 text-[10px] flex items-start gap-1.5 leading-normal" style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                      <MapPin size={13} className="shrink-0 mt-0.5" style={{ color: '#F97316' }} />
                      <span>
                        Delivering to:{' '}
                        <strong style={{ color: 'var(--text)' }}>
                          {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
          <div
            className="rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl flex flex-col items-center text-center gap-5"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#FEF2F2', color: '#DC2626' }}>
              <AlertCircle size={28} />
            </div>
            <div>
              <h3 className="text-lg font-black" style={{ color: 'var(--text)' }}>Cancel Your Order?</h3>
              <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Are you sure you want to cancel <strong style={{ color: 'var(--text)' }}>Order #{cancellingOrder.orderNumber}</strong>? This cannot be undone.
              </p>
            </div>
            <div className="w-full text-left flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider pl-1" style={{ color: 'var(--text-muted)' }}>
                Reason (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="E.g., Ordered wrong items, found elsewhere..."
                rows={3}
                className="w-full rounded-xl p-3 outline-none text-xs resize-none transition-all"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </div>
            <div className="flex w-full gap-3">
              <button
                disabled={cancelLoading}
                onClick={() => { setCancellingOrder(null); setCancelReason(''); }}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
              >
                Keep Order
              </button>
              <button
                disabled={cancelLoading}
                onClick={handleCancelOrder}
                className="flex-1 py-3 px-4 rounded-xl text-white text-xs font-bold transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                style={{ background: '#DC2626' }}
              >
                {cancelLoading ? (
                  <><Loader2 size={14} className="animate-spin" /> Cancelling...</>
                ) : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
