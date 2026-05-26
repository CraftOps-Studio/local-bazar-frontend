import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslate } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { CreditCard, MapPin, User, Mail, Phone, ShoppingCart, ShieldCheck, AlertCircle, Loader2, Minus, Plus } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import apiClient from '../services/api';

const Checkout = () => {
  const { t } = useTranslate();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  // Prefill details
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  // Load cart on component mounting
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const isBuyNow = queryParams.get('buyNow') === 'true';

    if (isBuyNow) {
      const buyNowItem = JSON.parse(localStorage.getItem('buyNowItem') || 'null');
      setCartItems(buyNowItem ? [buyNowItem] : []);
    } else {
      const items = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(items);
    }
  }, []);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryCharge = subtotal > 500 || subtotal === 0 ? 0 : 40;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const total = subtotal + deliveryCharge + tax;

  const handlePaymentSuccess = async (response, shopId) => {
    setLoading(true);
    setError('');
    try {
      // ─── STEP 3: Place the verified order on MongoDB ───
      const orderPayload = {
        shop: shopId,
        items: cartItems.map(item => ({
          product: item.product,
          quantity: item.quantity,
        })),
        shippingAddress: { street, city, state, pincode },
        paymentMethod: 'razorpay',
        paymentDetails: {
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        }
      };

      const orderRes = await apiClient.post('/orders', orderPayload);

      if (orderRes.data?.success) {
        setSuccess(true);
        setPaymentDetails({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
        });
        
        const queryParams = new URLSearchParams(window.location.search);
        const isBuyNow = queryParams.get('buyNow') === 'true';

        if (isBuyNow) {
          localStorage.removeItem('buyNowItem');
        } else {
          // Empty cart locally on checkout completion
          localStorage.removeItem('cart');
          window.dispatchEvent(new Event('cartUpdated'));
        }
      } else {
        setError('Order placement failed on server.');
      }
    } catch (err) {
      console.error('Order placement failed:', err);
      setError(err.response?.data?.message || 'Payment succeeded but order placement failed on store server.');
    } finally {
      setLoading(false);
    }
  };

  const startPayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !phone || !street || !city || !state || !pincode) {
      return setError('Please fill in all shipping and contact details.');
    }

    if (total <= 0 || cartItems.length === 0) {
      return setError('Your basket total or cart contents are invalid.');
    }

    setLoading(true);

    try {
      // Resolve Shop ID from cart
      const shopId = cartItems[0].shop;
      if (!shopId) {
        throw new Error('Could not identify the seller of your products.');
      }

      // ─── STEP 1: Create Razorpay checkout order on backend ───
      const rzpRes = await apiClient.post('/payments/checkout/create-order', {
        amount: total,
      });

      if (!rzpRes.data?.success) {
        throw new Error('Razorpay order creation failed on payment server.');
      }

      const orderData = rzpRes.data.data;

      // ─── STEP 2: Configure Razorpay Standard SDK Options ───
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Local Bazar',
        description: 'Secure checkout transaction',
        order_id: orderData.order_id,
        prefill: {
          name,
          email,
          contact: phone,
        },
        theme: {
          color: '#7c5cfc',
        },
        modal: {
          ondismiss: () => {
            setError('Payment cancelled. You closed the checkout dialog.');
            setLoading(false);
          },
        },
        handler: (response) => handlePaymentSuccess(response, shopId),
      };

      // Open Razorpay Standard Payment Popup
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (resp) {
        setError(`Payment failed. Reason: ${resp.error.description || resp.error.reason}`);
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      console.error('Checkout failed:', err);
      setError(err.response?.data?.message || err.message || 'Razorpay order creation failed.');
      setLoading(false);
    }
  };

  const placeCodOrder = async (e) => {
    e?.preventDefault();
    setError('');

    if (!name || !email || !phone || !street || !city || !state || !pincode) {
      return setError('Please fill in all shipping and contact details.');
    }

    if (total <= 0 || cartItems.length === 0) {
      return setError('Your basket total or cart contents are invalid.');
    }

    setLoading(true);

    try {
      // Resolve Shop ID from cart
      const shopId = cartItems[0].shop;
      if (!shopId) {
        throw new Error('Could not identify the seller of your products.');
      }

      // Create COD order in MongoDB
      const orderPayload = {
        shop: shopId,
        items: cartItems.map(item => ({
          product: item.product,
          quantity: item.quantity,
        })),
        shippingAddress: { street, city, state, pincode },
        paymentMethod: 'cod',
      };

      const orderRes = await apiClient.post('/orders', orderPayload);

      if (orderRes.data?.success) {
        setSuccess(true);
        setPaymentDetails({
          razorpay_payment_id: 'COD_PAYMENT_PENDING',
          razorpay_order_id: 'COD_ORDER_' + orderRes.data.data.order._id.slice(-6).toUpperCase(),
          method: 'cod',
        });
        
        const queryParams = new URLSearchParams(window.location.search);
        const isBuyNow = queryParams.get('buyNow') === 'true';

        if (isBuyNow) {
          localStorage.removeItem('buyNowItem');
        } else {
          // Empty cart locally on checkout completion
          localStorage.removeItem('cart');
          window.dispatchEvent(new Event('cartUpdated'));
        }
      } else {
        setError('COD Order placement failed.');
      }
    } catch (err) {
      console.error('COD Checkout failed:', err);
      setError(err.response?.data?.message || err.message || 'COD Order placement failed.');
    } finally {
      setLoading(false);
    }
  };

  const updateCheckoutQuantity = (productId, change) => {
    const queryParams = new URLSearchParams(window.location.search);
    const isBuyNow = queryParams.get('buyNow') === 'true';

    const updated = cartItems.map((item) => {
      if (item.product === productId) {
        const nextQty = item.quantity + change;
        const maxStock = item.stock !== undefined ? item.stock : 999;
        
        if (nextQty > maxStock) return { ...item, quantity: maxStock };
        return { ...item, quantity: nextQty < 1 ? 1 : nextQty };
      }
      return item;
    });

    setCartItems(updated);

    if (isBuyNow) {
      localStorage.setItem('buyNowItem', JSON.stringify(updated[0]));
    } else {
      localStorage.setItem('cart', JSON.stringify(updated));
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (paymentMethod === 'razorpay') {
      await startPayment(e);
    } else {
      await placeCodOrder(e);
    }
  };

  if (success) {
    /* Payment Success Banner screen */
    return (
      <div className="max-w-md mx-auto py-12 text-center flex flex-col gap-6 relative">
        <div className="absolute top-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -z-10 mx-auto left-0 right-0" />
        
        <div className="glass rounded-3xl p-8 sm:p-10 border border-emerald-500/20 shadow-2xl flex flex-col items-center gap-5">
          <span className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-3xl font-extrabold animate-scaleUp">
            ✓
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-brand-text">
            {paymentDetails?.method === 'cod' ? 'Order Placed Successfully!' : t('successTitle')}
          </h2>
          <p className="text-xs text-brand-muted leading-relaxed font-sans max-w-sm">
            {paymentDetails?.method === 'cod'
              ? 'Thank you! Your cash-on-delivery order has been registered. The local shop has been notified to package your organic products.'
              : 'Thank you! Your transaction completed securely. The local shop has been notified of your order details.'}
          </p>

          {paymentDetails && (
            <div className="w-full bg-brand-surface-2 border border-brand-border rounded-2xl p-4 text-xs font-semibold text-brand-muted flex flex-col gap-2.5 text-left font-sans mt-3">
              <div className="flex justify-between">
                <span>{paymentDetails.method === 'cod' ? 'COD Reference ID' : 'Payment ID'}</span>
                <code className="text-brand-text bg-brand-surface px-2 py-0.5 rounded border border-brand-border">{paymentDetails.razorpay_payment_id}</code>
              </div>
              <div className="flex justify-between">
                <span>Order ID</span>
                <code className="text-brand-text bg-brand-surface px-2 py-0.5 rounded border border-brand-border">{paymentDetails.razorpay_order_id}</code>
              </div>
              <div className="flex justify-between border-t border-brand-border/40 pt-2.5 mt-1 font-bold text-brand-text">
                <span>{paymentDetails.method === 'cod' ? 'Total to Pay' : 'Amount Paid'}</span>
                <span className="text-primary font-black">₹{total}</span>
              </div>
            </div>
          )}

          <Button variant="primary" size="md" className="w-full mt-4" onClick={() => navigate('/storefront')}>
            Back to storefront
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 flex flex-col gap-6 relative">
      
      {/* Dynamic Blur background */}
      <div className="absolute top-[20%] right-[-10%] w-72 h-72 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <CreditCard size={22} className="text-primary" />
          {t('checkout')}
        </h2>
        <p className="text-xs text-brand-muted mt-1">Provide shipping credentials and proceed to secure checkout</p>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/25 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-error animate-fadeIn">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="glass rounded-3xl p-10 text-center border border-brand-border max-w-sm mx-auto my-10 flex flex-col items-center gap-4">
          <span className="text-4xl">🛍️</span>
          <h3 className="font-extrabold text-sm sm:text-base">No active orders</h3>
          <p className="text-xs text-brand-muted leading-relaxed font-sans">
            Please add products into your shopping basket to proceed to checkout.
          </p>
          <Button variant="primary" size="sm" onClick={() => navigate('/storefront')}>
            Explore storefront
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
          
          {/* Shipping Form details */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Contact details card */}
            <div className="glass rounded-3xl p-6 border border-brand-border flex flex-col gap-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 pl-1 select-none">
                <User size={13} /> Customer Info
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  type="text"
                  placeholder="Riya Sharma"
                  icon={User}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="riya@example.com"
                  icon={Mail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Mobile Contact"
                  type="text"
                  placeholder="9876543210"
                  icon={Phone}
                  maxLength="10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  required
                  className="col-span-2 sm:col-span-1"
                />
              </div>
            </div>

            {/* Address details card */}
            <div className="glass rounded-3xl p-6 border border-brand-border flex flex-col gap-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 pl-1 select-none">
                <MapPin size={13} /> Delivery Address
              </h3>

              <Input
                label="Street Address / Locality"
                type="text"
                placeholder="Flat / House No, Street name, LandMark"
                icon={MapPin}
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Input
                  label="City"
                  type="text"
                  placeholder="Chennai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
                <Input
                  label="State"
                  type="text"
                  placeholder="Tamil Nadu"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
                <Input
                  label="Pincode"
                  type="text"
                  maxLength="6"
                  placeholder="600001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            </div>

            {/* Payment Method Selector Card */}
            <div className="glass rounded-3xl p-6 border border-brand-border flex flex-col gap-4 animate-fadeIn">
              <h3 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1.5 pl-1 select-none">
                <CreditCard size={13} /> Choose Payment Method
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all duration-300 select-none active:scale-[0.98]
                    ${paymentMethod === 'razorpay'
                      ? 'bg-primary/10 border-primary text-white font-bold'
                      : 'bg-brand-surface-2 border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-border/80'
                    }
                  `}
                >
                  <CreditCard size={20} className={paymentMethod === 'razorpay' ? 'text-primary animate-pulse' : 'text-brand-muted'} />
                  <span className="text-xs">Pay Online (Razorpay Gateway)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all duration-300 select-none active:scale-[0.98]
                    ${paymentMethod === 'cod'
                      ? 'bg-primary/10 border-primary text-white font-bold'
                      : 'bg-brand-surface-2 border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-border/80'
                    }
                  `}
                >
                  <span className="text-lg">💵</span>
                  <span className="text-xs">Cash on Delivery (COD)</span>
                </button>
              </div>
            </div>

          </div>

          {/* Pricing Box Summary */}
          <div className="w-full lg:w-80 shrink-0 bg-brand-surface border border-brand-border rounded-3xl p-6 glass self-start h-auto flex flex-col gap-6">
            
            <h3 className="font-extrabold text-sm sm:text-base border-b border-brand-border/40 pb-4 flex items-center gap-1.5">
              <ShoppingCart size={15} /> Order Basket
            </h3>

            {/* Mini items catalog */}
            <div className="flex flex-col gap-3 max-h-40 overflow-y-auto no-scrollbar pr-1 border-b border-brand-border/40 pb-4">
              {cartItems.map((item) => (
                <div key={item.product} className="flex justify-between items-center text-xs font-semibold text-brand-muted">
                  <span className="truncate flex-1 pr-3 flex items-center justify-between gap-1.5 min-w-0">
                    <span className="truncate flex-1">{item.name}</span>
                    <div className="flex items-center gap-1.5 bg-brand-surface-2 border border-brand-border rounded-lg p-0.5 scale-90 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateCheckoutQuantity(item.product, -1)}
                        className="p-0.5 hover:bg-brand-surface text-brand-muted hover:text-brand-text rounded transition-colors cursor-pointer"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-[10px] font-bold w-4 text-center select-none text-brand-text">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCheckoutQuantity(item.product, 1)}
                        disabled={item.quantity >= (item.stock !== undefined ? item.stock : 999)}
                        className={`p-0.5 rounded transition-colors cursor-pointer
                          ${item.quantity >= (item.stock !== undefined ? item.stock : 999)
                            ? 'opacity-30 cursor-not-allowed text-brand-muted'
                            : 'hover:bg-brand-surface text-brand-muted hover:text-brand-text'
                          }
                        `}
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  </span>
                  <span className="text-brand-text shrink-0 w-16 text-right">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Total Details */}
            <div className="flex flex-col gap-3.5 text-xs sm:text-sm text-brand-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-brand-text font-bold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="text-brand-text font-bold">{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
              </div>
              <div className="flex justify-between border-b border-brand-border/40 pb-3">
                <span>GST (5%)</span>
                <span className="text-brand-text font-bold">₹{tax}</span>
              </div>
              <div className="flex justify-between text-brand-text text-sm sm:text-base font-extrabold pt-1">
                <span>Total Due</span>
                <span className="text-primary font-black">₹{total}</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 size={16} className="animate-spin" /> Processing order...
                </span>
              ) : (
                paymentMethod === 'cod' ? `💵 Confirm COD Order (₹${total})` : `🔐 Pay Securely ₹${total}`
              )}
            </Button>

            <span className="text-[10px] text-brand-muted text-center font-sans">
              {paymentMethod === 'cod'
                ? '🏠 Pay with cash upon physical delivery. Keep the exact amount ready.'
                : '🔒 SSL Encrypted & Secure checkout processed directly via Razorpay Gateway.'}
            </span>

          </div>

        </form>
      )}

    </div>
  );
};

export default Checkout;
