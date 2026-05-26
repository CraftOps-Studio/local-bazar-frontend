import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslate } from '../context/LanguageContext';
import { ShoppingCart, Trash2, ArrowRight, Minus, Plus, ShoppingBag, Tag } from 'lucide-react';
import Button from '../components/common/Button';

const Cart = () => {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage
  useEffect(() => {
    const loadCart = () => {
      const items = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(items);
    };
    
    loadCart();
    
    // Add custom event listener to listen for updates
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);

  const updateQuantity = (productId, change) => {
    const updated = cartItems.map((item) => {
      if (item.product === productId) {
        const nextQty = item.quantity + change;
        const maxStock = item.stock !== undefined ? item.stock : 999;
        
        if (nextQty > maxStock) {
          return { ...item, quantity: maxStock };
        }
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

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryCharge = subtotal > 500 || subtotal === 0 ? 0 : 40;
  const tax = Math.round(subtotal * 0.05); // 5% CGST/SGST
  const total = subtotal + deliveryCharge + tax;

  return (
    <div className="py-4 flex flex-col gap-6">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <ShoppingCart size={22} className="text-primary" />
          {t('cart')}
        </h2>
        <p className="text-xs text-brand-muted mt-1">Review your basket items and pricing summary</p>
      </div>

      {cartItems.length === 0 ? (
        /* Empty Cart State */
        <div className="glass rounded-3xl p-10 sm:p-14 text-center border border-brand-border flex flex-col items-center gap-4 max-w-md mx-auto my-12 shadow-xl">
          <span className="text-5xl animate-bounce">🛒</span>
          <h3 className="font-extrabold text-sm sm:text-base">Your Cart is Empty</h3>
          <p className="text-xs text-brand-muted leading-relaxed font-sans max-w-xs">
            Looks like you haven't added any fresh local goods to your basket yet.
          </p>
          <Link to="/storefront">
            <Button variant="primary" size="md">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        /* Active Cart Layout */
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Items List */}
          <div className="flex-1 flex flex-col gap-4">
            {cartItems.map((item) => (
              <div
                key={item.product}
                className="glass rounded-2xl p-4 sm:p-5 border border-brand-border flex items-center gap-4 hover:border-brand-border/80 transition-all duration-200"
              >
                {/* Thumb */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-brand-surface-2 border border-brand-border shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col gap-1 sm:gap-2">
                  <h4 className="font-extrabold text-xs sm:text-sm text-brand-text truncate">
                    {item.name}
                  </h4>
                  <span className="text-xs font-bold text-primary">₹{item.price}</span>
                </div>

                {/* Adjuster */}
                <div className="flex items-center gap-2 bg-brand-surface-2 border border-brand-border rounded-xl p-1 shrink-0">
                  <button
                    onClick={() => updateQuantity(item.product, -1)}
                    className="p-1 hover:bg-brand-surface text-brand-muted hover:text-brand-text rounded-lg transition-colors cursor-pointer"
                  >
                    <Minus size={13} />
                  </button>
                  <span className="text-xs font-bold w-6 text-center select-none">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product, 1)}
                    disabled={item.quantity >= (item.stock !== undefined ? item.stock : 999)}
                    className={`p-1 rounded-lg transition-colors cursor-pointer
                      ${item.quantity >= (item.stock !== undefined ? item.stock : 999)
                        ? 'opacity-30 cursor-not-allowed text-brand-muted hover:bg-transparent'
                        : 'hover:bg-brand-surface text-brand-muted hover:text-brand-text'
                      }
                    `}
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Price Total */}
                <span className="hidden sm:block text-sm font-extrabold text-brand-text shrink-0 w-20 text-right">
                  ₹{item.price * item.quantity}
                </span>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.product)}
                  className="p-2 border border-transparent hover:border-brand-border/40 hover:bg-brand-surface-2 text-brand-muted hover:text-error rounded-xl transition-all cursor-pointer shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {/* Pricing Summary Sidepanel */}
          <div className="w-full lg:w-80 shrink-0 bg-brand-surface border border-brand-border rounded-3xl p-6 glass self-start h-auto flex flex-col gap-6">
            
            <h3 className="font-extrabold text-sm sm:text-base border-b border-brand-border/40 pb-4">
              Order Summary
            </h3>

            {/* Calculations items */}
            <div className="flex flex-col gap-3 text-xs sm:text-sm text-brand-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-brand-text font-bold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="text-brand-text font-bold">
                  {deliveryCharge === 0 ? <span className="text-success font-extrabold">FREE</span> : `₹${deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="text-brand-text font-bold">₹{tax}</span>
              </div>
              
              {deliveryCharge > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-start gap-2 mt-1 text-[11px] text-primary animate-fadeIn font-sans">
                  <Tag size={14} className="shrink-0 mt-0.5" />
                  <span>Add ₹{500 - subtotal} more of local goods for **FREE Delivery**!</span>
                </div>
              )}

              <div className="border-t border-brand-border/40 my-2 pt-3 flex justify-between text-brand-text text-sm sm:text-base font-extrabold">
                <span>Total Amount</span>
                <span className="text-primary font-black">₹{total}</span>
              </div>
            </div>

            {/* Button */}
            <Link to="/checkout" className="w-full">
              <Button
                variant="primary"
                size="md"
                icon={ArrowRight}
                iconPosition="right"
                className="w-full justify-between"
              >
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
