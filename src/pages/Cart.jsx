import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslate } from '../context/LanguageContext';
import { ShoppingCart, Trash2, ArrowRight, Minus, Plus, Tag } from 'lucide-react';
import Button from '../components/common/Button';

const Cart = () => {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const loadCart = () => {
      const items = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(items);
    };
    loadCart();
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);

  const updateQuantity = (productId, change) => {
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
    localStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (productId) => {
    const filtered = cartItems.filter((item) => item.product !== productId);
    setCartItems(filtered);
    localStorage.setItem('cart', JSON.stringify(filtered));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryCharge = subtotal > 500 || subtotal === 0 ? 0 : 40;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryCharge + tax;

  return (
    <div className="py-4 flex flex-col gap-6 animate-slideUp">

      {/* Page Header */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <ShoppingCart size={22} style={{ color: '#F97316' }} />
          {t('cart')}
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Review your basket items and pricing summary</p>
      </div>

      {cartItems.length === 0 ? (
        <div
          className="rounded-3xl p-10 sm:p-14 text-center flex flex-col items-center gap-4 max-w-md mx-auto my-12"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
        >
          <span className="text-5xl animate-bounce">🛒</span>
          <h3 className="font-extrabold text-sm sm:text-base" style={{ color: 'var(--text)' }}>Your Cart is Empty</h3>
          <p className="text-xs leading-relaxed max-w-xs" style={{ color: 'var(--text-muted)' }}>
            Looks like you haven't added any fresh local goods to your basket yet.
          </p>
          <Link to="/storefront">
            <Button variant="primary" size="md">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Items List */}
          <div className="flex-1 flex flex-col gap-3">
            {cartItems.map((item) => (
              <div
                key={item.product}
                className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200"
                style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
              >
                {/* Thumb */}
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <h4 className="font-bold text-xs sm:text-sm truncate" style={{ color: 'var(--text)' }}>
                    {item.name}
                  </h4>
                  <span className="text-xs font-bold" style={{ color: '#F97316' }}>₹{item.price} each</span>
                </div>

                {/* Qty Adjuster */}
                <div
                  className="flex items-center gap-2 rounded-xl p-1 shrink-0"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <button
                    onClick={() => updateQuantity(item.product, -1)}
                    className="p-1 rounded-lg transition-colors cursor-pointer"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Minus size={13} />
                  </button>
                  <span className="text-xs font-bold w-6 text-center select-none" style={{ color: 'var(--text)' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.product, 1)}
                    disabled={item.quantity >= (item.stock !== undefined ? item.stock : 999)}
                    className="p-1 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Price Total */}
                <span className="hidden sm:block text-sm font-extrabold shrink-0 w-20 text-right" style={{ color: 'var(--text)' }}>
                  ₹{item.price * item.quantity}
                </span>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.product)}
                  className="p-2 rounded-xl transition-all cursor-pointer shrink-0 hover:bg-red-50"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div
            className="w-full lg:w-80 shrink-0 rounded-3xl p-6 self-start flex flex-col gap-5"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
          >
            <h3 className="font-extrabold text-sm sm:text-base pb-4" style={{ color: 'var(--text)', borderBottom: '1px solid var(--border)' }}>
              Order Summary
            </h3>

            <div className="flex flex-col gap-3 text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold" style={{ color: 'var(--text)' }}>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-bold" style={{ color: 'var(--text)' }}>
                  {deliveryCharge === 0 ? <span style={{ color: '#22C55E' }} className="font-extrabold">FREE</span> : `₹${deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="font-bold" style={{ color: 'var(--text)' }}>₹{tax}</span>
              </div>

              {deliveryCharge > 0 && (
                <div
                  className="rounded-xl p-3 flex items-start gap-2 mt-1 text-[11px] animate-fadeIn"
                  style={{ background: '#FFF7ED', border: '1px solid rgba(249,115,22,0.2)', color: '#F97316' }}
                >
                  <Tag size={14} className="shrink-0 mt-0.5" />
                  <span>Add ₹{500 - subtotal} more for <strong>FREE Delivery</strong>!</span>
                </div>
              )}

              <div
                className="pt-3 flex justify-between text-sm sm:text-base font-extrabold"
                style={{ borderTop: '1px solid var(--border)', color: 'var(--text)' }}
              >
                <span>Total Amount</span>
                <span style={{ color: '#F97316' }}>₹{total}</span>
              </div>
            </div>

            <Link to="/checkout" className="w-full">
              <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right" className="w-full justify-between">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
