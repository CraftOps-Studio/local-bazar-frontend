import React, { useState, useEffect } from 'react';
import { useTranslate } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { 
  ClipboardList, ShoppingBag, Truck, MapPin, 
  IndianRupee, Calendar, Loader2, AlertCircle, ShieldCheck 
} from 'lucide-react';
import apiClient from '../services/api';

const Orders = () => {
  const { t } = useTranslate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/orders/my-orders');
      if (res.data?.success) {
        setOrders(res.data.data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch customer orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const [cancellingOrder, setCancellingOrder] = useState(null); // { orderId, orderNumber }
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const handleCancelOrder = async () => {
    if (!cancellingOrder) return;
    try {
      setCancelLoading(true);
      const res = await apiClient.patch(`/orders/${cancellingOrder.orderId}/cancel`, {
        reason: cancelReason || 'Cancelled by customer'
      });
      if (res.data?.success) {
        // Update order status in local state
        setOrders(orders.map(o => o._id === cancellingOrder.orderId 
          ? { 
              ...o, 
              orderStatus: 'cancelled', 
              cancellationReason: cancelReason || 'Cancelled by customer' 
            } 
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

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const getStatusStepIndex = (status) => {
    const steps = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    return steps.indexOf(status);
  };

  const statusTexts = {
    pending: 'Order Placed',
    confirmed: 'Confirmed by Seller',
    preparing: 'Food/Items Preparing',
    out_for_delivery: 'Dispatched (Out for Delivery)',
    delivered: 'Successfully Delivered',
    cancelled: 'Order Cancelled',
    refunded: 'Payment Refunded',
  };

  const stepLabels = [
    { label: 'Placed', desc: 'Order received' },
    { label: 'Accepted', desc: 'Seller accepted' },
    { label: 'Prepared', desc: 'Items packed' },
    { label: 'Dispatched', desc: 'On the way' },
    { label: 'Delivered', desc: 'Fulfillment complete' }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 size={32} className="animate-spin text-primary" />
        <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider animate-pulse">
          Loading Shipment Timelines...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-4 flex flex-col gap-8 relative">
      
      {/* Background glow accent */}
      <div className="absolute top-[10%] left-[-10%] w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="border-b border-brand-border/40 pb-4">
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <ClipboardList size={22} className="text-primary" />
          My Orders & Shipment Tracking
        </h2>
        <p className="text-xs text-brand-muted mt-1 font-sans">
          Monitor your neighborhood deliveries, track live status history, and view order receipts.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center border border-brand-border max-w-md mx-auto my-12 flex flex-col items-center gap-4">
          <span className="text-4xl">📦</span>
          <h3 className="font-extrabold text-sm sm:text-base">No orders placed yet</h3>
          <p className="text-xs text-brand-muted leading-relaxed font-sans">
            Support your nearby neighborhood shopkeepers by placing your first transaction today!
          </p>
          <Link to="/storefront">
            <button className="px-5 py-2.5 bg-gradient-to-r from-primary to-violet-500 hover:from-primary-hover text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-[0.98]">
              Browse Local Catalogue
            </button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => {
            const currentStep = getStatusStepIndex(order.orderStatus);
            const isCancelled = order.orderStatus === 'cancelled';
            const createdDate = new Date(order.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div 
                key={order._id} 
                className="glass rounded-3xl border border-brand-border/60 overflow-hidden shadow-xl"
              >
                
                {/* Order Header Summary */}
                <div className="px-6 py-5 bg-brand-surface-2/20 border-b border-brand-border/40 flex flex-col sm:flex-row justify-between gap-4 font-sans text-xs">
                  <div className="flex flex-wrap gap-x-6 gap-y-2.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Order ID</span>
                      <span className="font-extrabold text-brand-text text-sm">
                        {order.orderNumber || order._id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Placed On</span>
                      <span className="font-semibold text-brand-text flex items-center gap-1">
                        <Calendar size={12} className="text-primary shrink-0" />
                        {createdDate}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Merchant Store</span>
                      <span className="font-bold text-primary flex items-center gap-1">
                        🏪 {order.shop?.name || 'Local Seller'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2.5">
                    <div className="flex flex-col sm:items-end gap-0.5">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Total Paid</span>
                      <span className="font-black text-primary text-sm">
                        ₹{order.pricing?.total?.toLocaleString('en-IN') || '0'}
                      </span>
                    </div>
                    <span className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-md uppercase tracking-wider border select-none ${
                      order.paymentStatus === 'paid' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                    }`}>
                      {order.paymentMethod === 'razorpay' ? '💳 Online' : '💵 Cash (COD)'} — {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Tracking Progress timeline */}
                <div className="p-6 sm:p-8 border-b border-brand-border/20 flex flex-col gap-6">
                  
                  {isCancelled ? (
                    <div className="bg-rose-500/10 border border-rose-500/25 rounded-2xl p-4 flex items-start gap-3 text-rose-400 font-sans text-xs">
                      <AlertCircle size={18} className="shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-1">
                        <span className="font-extrabold text-sm uppercase tracking-wider">Order Cancelled</span>
                        <p className="text-brand-muted text-[11px] leading-relaxed">
                          This shipment was cancelled by the {order.cancellationReason ? 'customer' : 'seller'}. Reason: {order.cancellationReason || 'Standard cancellation parameter.'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {/* Active Status Banner */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-1 font-sans">
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <Truck size={14} className="text-primary animate-pulse" />
                          <span>Delivery Status: </span>
                          <span className="text-primary font-black uppercase tracking-wider">
                            {statusTexts[order.orderStatus] || order.orderStatus}
                          </span>
                        </div>
                        {['pending', 'confirmed'].includes(order.orderStatus) && (
                          <button
                            onClick={() => setCancellingOrder({
                              orderId: order._id,
                              orderNumber: order.orderNumber || order._id.slice(-6).toUpperCase()
                            })}
                            className="w-fit py-1.5 px-3 border border-rose-500/25 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/40 rounded-lg text-[10px] font-extrabold tracking-wider uppercase transition-all duration-150 active:scale-[0.98] cursor-pointer"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>

                      {/* Desktop Horizontal Stepper */}
                      <div className="hidden sm:flex items-center justify-between w-full font-sans text-center relative py-4">
                        
                        {/* Stepper background line */}
                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-brand-surface-2 -translate-y-1/2 border border-brand-border -z-10 rounded-full" />
                        
                        {/* Stepper active line */}
                        <div 
                          className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-primary to-violet-500 -translate-y-1/2 -z-10 rounded-full transition-all duration-700 ease-out" 
                          style={{ width: `${(Math.max(0, currentStep) / 4) * 100}%` }}
                        />

                        {stepLabels.map((step, idx) => {
                          const isCompleted = idx <= currentStep;
                          const isActive = idx === currentStep;
                          return (
                            <div key={idx} className="flex flex-col items-center gap-2.5 w-24">
                              <span className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300
                                ${isCompleted 
                                  ? 'bg-primary border-primary text-white shadow-md shadow-primary/25' 
                                  : 'bg-brand-surface-2 border-brand-border text-brand-muted'
                                }
                                ${isActive ? 'ring-4 ring-primary/20 scale-115' : ''}
                              `}>
                                {isCompleted ? '✓' : idx + 1}
                              </span>
                              <div className="flex flex-col">
                                <span className={`text-[11px] font-extrabold tracking-tight ${isCompleted ? 'text-brand-text' : 'text-brand-muted'}`}>
                                  {step.label}
                                </span>
                                <span className="text-[9px] text-brand-muted font-normal mt-0.5 leading-none">
                                  {step.desc}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Mobile Vertical Stepper */}
                      <div className="flex sm:hidden flex-col gap-4 font-sans pl-1">
                        {stepLabels.map((step, idx) => {
                          const isCompleted = idx <= currentStep;
                          const isActive = idx === currentStep;
                          return (
                            <div key={idx} className="flex items-center gap-3.5">
                              <span className={`
                                w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0
                                ${isCompleted 
                                  ? 'bg-primary border-primary text-white shadow-md' 
                                  : 'bg-brand-surface-2 border-brand-border text-brand-muted'
                                }
                                ${isActive ? 'ring-4 ring-primary/10 scale-110' : ''}
                              `}>
                                {isCompleted ? '✓' : idx + 1}
                              </span>
                              <div className="flex flex-col">
                                <span className={`text-xs font-extrabold leading-none ${isCompleted ? 'text-brand-text' : 'text-brand-muted'}`}>
                                  {step.label} {isActive && '— Active'}
                                </span>
                                <span className="text-[9px] text-brand-muted mt-0.5 font-normal">
                                  {step.desc}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  )}

                </div>

                {/* Items List Details */}
                <div className="p-6 font-sans text-xs">
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider select-none mb-3 block">
                    Products in Order
                  </span>
                  
                  <div className="flex flex-col gap-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-4 py-2 border-b border-brand-border/20 last:border-b-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand-surface-2 border border-brand-border rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingBag size={14} className="text-brand-muted" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-extrabold text-brand-text">{item.name}</span>
                            <span className="text-[10px] text-brand-muted mt-0.5">₹{item.price} per unit</span>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end gap-0.5 shrink-0">
                          <span className="font-bold text-brand-text">x{item.quantity}</span>
                          <span className="font-extrabold text-primary">₹{item.price * item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Location Brief */}
                  {order.shippingAddress && (
                    <div className="mt-5 pt-5 border-t border-brand-border/30 text-[10px] text-brand-muted flex items-start gap-1.5 leading-normal">
                      <MapPin size={13} className="text-brand-muted/75 shrink-0 mt-0.5" />
                      <span>
                        Delivering to: <strong className="text-brand-text">{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}</strong>
                      </span>
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Premium Glassmorphic Cancel Order Modal Overlay */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-bg/85 backdrop-blur-md transition-all duration-200">
          <div className="glass rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl relative border border-brand-border flex flex-col items-center text-center gap-6 bg-brand-surface/95">
            {/* Glowing Icon Container */}
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AlertCircle size={32} />
            </div>

            {/* Modal Content */}
            <div className="flex flex-col gap-1.5">
              <h3 className="text-xl font-black text-brand-text">
                Cancel Your Order?
              </h3>
              <p className="text-xs text-brand-muted leading-relaxed font-sans mt-1">
                Are you sure you want to cancel <strong className="text-brand-text">Order #{cancellingOrder.orderNumber}</strong>? This action cannot be undone and will restore the merchant's product stock.
              </p>
            </div>

            {/* Reason Input Box */}
            <div className="w-full text-left flex flex-col gap-2">
              <label className="text-[10px] text-brand-muted font-bold uppercase tracking-wider pl-1">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="E.g., Ordered wrong items, delivery delayed, found elsewhere..."
                rows={3}
                className="w-full bg-brand-surface-2 border border-brand-border rounded-xl p-3 outline-none text-xs text-brand-text placeholder-brand-muted resize-none focus:border-rose-500/30 transition-all font-sans"
              />
            </div>

            {/* Actions */}
            <div className="flex w-full gap-3 mt-2">
              <button
                disabled={cancelLoading}
                onClick={() => {
                  setCancellingOrder(null);
                  setCancelReason('');
                }}
                className="flex-1 py-3 px-4 rounded-xl border border-brand-border text-xs font-bold text-brand-muted hover:text-brand-text hover:bg-brand-surface-2/40 transition-all select-none cursor-pointer disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                disabled={cancelLoading}
                onClick={handleCancelOrder}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition-all active:scale-[0.98] select-none cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {cancelLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel Order'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;
