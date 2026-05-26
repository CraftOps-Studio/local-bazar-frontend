import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useTranslate } from '../context/LanguageContext';
import { Search, MapPin, Store, SlidersHorizontal, ShoppingCart, ShoppingBag, Star, AlertCircle, ShieldCheck } from 'lucide-react';
import LoadingSkeleton, { CardSkeleton } from '../components/common/LoadingSkeleton';
import Button from '../components/common/Button';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';

const Storefront = () => {
  const { t } = useTranslate();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(3000);
  
  const categories = ['All', 'Grocery', 'Electronics', 'Clothing', 'Bakery', 'Handicrafts', 'Pharmacy'];

  // Sync search query from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('search') || '';
    const cat = params.get('category') || '';
    setSearchTerm(query);
    if (cat) setCategory(cat);
  }, [location.search]);

  // Fetch products (from DB, falling back to beautiful rich mock products if not matching)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const queryParams = [];
        if (searchTerm) queryParams.push(`keyword=${encodeURIComponent(searchTerm)}`);
        if (category && category !== 'All') queryParams.push(`category=${encodeURIComponent(category)}`);
        if (minPrice > 0) queryParams.push(`price[gte]=${minPrice}`);
        if (maxPrice < 3000) queryParams.push(`price[lte]=${maxPrice}`);
        
        const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
        const res = await apiClient.get(`/products${queryString}`);
        
        if (res.data?.success && Array.isArray(res.data.data.products)) {
          setProducts(res.data.data.products);
        } else {
          setProducts(getMockProducts());
        }
      } catch (err) {
        console.warn('API Product fetch failed. Loading mock data catalog:', err.message);
        setProducts(getMockProducts());
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, category, minPrice, maxPrice]);

  // Local add to cart state trigger (cart is persisted inside localStorage)
  const [cartSuccessId, setCartSuccessId] = useState(null);
  
  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Redirect unauthenticated guest to login
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    
    // Fetch active cart
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((item) => item.product === product._id);
    
    if (existing) {
      if (existing.quantity >= product.stock) {
        return; // reached inventory limit
      }
      existing.quantity += 1;
    } else {
      cart.push({
        product: product._id,
        name: product.name,
        price: product.discountPrice || product.price,
        image: product.images?.[0]?.url || product.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format',
        quantity: 1,
        shop: product.shop?._id || product.shop,
        stock: product.stock,
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Trigger localized visual chip pulse success alert
    setCartSuccessId(product._id);
    setTimeout(() => setCartSuccessId(null), 1500);

    // Dispatch custom event to notify MainLayout navbar header of cart changes
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleBuyNow = (product, e) => {
    e.preventDefault();
    e.stopPropagation();

    // Isolate this single product for immediate checkout
    const singleItem = {
      product: product._id,
      name: product.name,
      price: product.discountPrice || product.price,
      image: product.images?.[0]?.url || product.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format',
      quantity: 1,
      shop: product.shop?._id || product.shop,
      stock: product.stock,
    };

    localStorage.setItem('buyNowItem', JSON.stringify(singleItem));

    // Redirect unauthenticated guest to login
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout', search: '?buyNow=true' } } });
      return;
    }

    // Route straight to payment
    navigate('/checkout?buyNow=true');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 py-4 relative">
      
      {/* ─── FILTERS SIDEBAR PANELS ─── */}
      <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-6 bg-brand-surface border border-brand-border rounded-3xl p-6 glass self-start h-auto sticky lg:top-24 z-20">
        
        <div className="flex items-center gap-2 border-b border-brand-border/40 pb-4">
          <SlidersHorizontal size={17} className="text-primary" />
          <h2 className="font-extrabold text-sm sm:text-base tracking-tight">Filters & Sorting</h2>
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider select-none">
            Categories
          </span>
          <div className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar">
            {categories.map((cat) => {
              const displayCat = cat === 'All' ? '' : cat;
              const isSelected = category === displayCat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(displayCat)}
                  className={`
                    px-4 py-2 text-xs font-bold rounded-xl border text-left shrink-0 select-none cursor-pointer transition-all duration-200
                    ${isSelected
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-brand-surface-2 border-brand-border text-brand-muted hover:border-brand-border/80 hover:text-brand-text'
                    }
                  `}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Slider */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider select-none">
            Price Range
          </span>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="3000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-brand-surface-2 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex items-center justify-between text-xs font-semibold text-brand-muted">
              <span>₹0</span>
              <span className="text-primary font-bold">Up to ₹{maxPrice}</span>
            </div>
          </div>
        </div>

      </aside>

      {/* ─── STORES & PRODUCTS LISTINGS ─── */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Dynamic header info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-border/40 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Explore Fresh Stock</h2>
            <p className="text-xs text-brand-muted">Supporting local markets, directly delivered to your door</p>
          </div>
          
          {/* Quick search input */}
          <div className="relative w-full sm:w-64 shrink-0">
            <input
              type="text"
              placeholder="Filter products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-surface-2 border border-brand-border rounded-xl py-2 pl-4 pr-10 outline-none text-xs"
            />
            <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="glass rounded-3xl p-10 text-center flex flex-col items-center gap-4 border border-brand-border max-w-md mx-auto my-10">
            <span className="text-4xl">🍎</span>
            <h3 className="font-extrabold text-sm sm:text-base">No Products Found</h3>
            <p className="text-xs text-brand-muted leading-relaxed font-sans">
              We couldn't find any products matching your active filters. Try adjusting your category sorting or price slider.
            </p>
            <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setCategory(''); setMaxPrice(3000); }}>
              Reset All Filters
            </Button>
          </div>
        ) : (
          /* Products Grid list */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const discounted = product.discountPrice && product.discountPrice < product.price;
              const cartSuccess = cartSuccessId === product._id;
              
              return (
                <div
                  key={product._id}
                  className="glass glass-hover rounded-3xl overflow-hidden flex flex-col group border border-brand-border"
                >
                  {/* Image wrapper */}
                  <div className="relative h-44 overflow-hidden bg-brand-surface-2/40">
                    <img
                      src={product.images?.[0]?.url || product.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {discounted && (
                      <span className="absolute top-4 left-4 bg-gradient-to-r from-error to-rose-600 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md animate-pulse">
                        {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% Off
                      </span>
                    )}
                    <span className="absolute top-4 right-4 bg-brand-bg/80 backdrop-blur-md text-brand-muted text-[9px] font-extrabold px-2.5 py-1 rounded-full border border-brand-border flex items-center gap-1 shadow-md">
                      📦 {product.unit || 'units'}
                    </span>
                  </div>

                  {/* Core details */}
                  <div className="p-5 flex flex-col gap-4 flex-1 justify-between">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-primary uppercase tracking-widest">
                        <span>{product.category}</span>
                        <span className="flex items-center gap-0.5 text-yellow-400">
                          ⭐ {product.rating || '4.5'}
                        </span>
                      </div>
                      
                      <h3 className="font-extrabold text-sm sm:text-md text-brand-text truncate group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      
                      <p className="text-xs text-brand-muted line-clamp-2 leading-relaxed font-sans">
                        {product.description}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col gap-3 pt-3 border-t border-brand-border/30 mt-auto">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          {discounted ? (
                            <>
                              <span className="text-md font-extrabold text-brand-text">₹{product.discountPrice}</span>
                              <span className="text-[10px] text-brand-muted line-through">₹{product.price}</span>
                            </>
                          ) : (
                            <span className="text-md font-extrabold text-brand-text">₹{product.price}</span>
                          )}
                        </div>
                        <span className="text-[10px] text-brand-muted font-sans font-medium">
                          Qty: {product.stock > 100 ? '100+' : product.stock}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={cartSuccess ? ShieldCheck : ShoppingCart}
                          onClick={(e) => handleAddToCart(product, e)}
                          className={`w-full py-2 text-[11px] transition-all duration-300 ${cartSuccess ? 'border-success text-success bg-success/5 font-bold' : 'text-slate-300'}`}
                        >
                          {cartSuccess ? t('addedToCart') : t('addToCart')}
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => handleBuyNow(product, e)}
                          className="w-full py-2 text-[11px] font-bold shadow-md shadow-primary/25 bg-gradient-to-r from-primary to-violet-500 hover:from-primary-hover"
                        >
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};

// Beautiful mock products representing local Indian goods
const getMockProducts = () => [
  {
    _id: 'mock1',
    name: 'Ratnagiri Alphonso Mangoes',
    description: 'Fresh handpicked Alphonso mangoes direct from farm orchards in Maharashtra.',
    price: 650,
    discountPrice: 499,
    category: 'Grocery',
    unit: '1 kg',
    rating: 4.9,
    images: ['https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=400&q=80'],
  },
  {
    _id: 'mock2',
    name: 'Handcrafted Clay Diyas & Pots',
    description: 'Traditional organic clay kitchen pots and diyas sculpted by Jaipur artisans.',
    price: 350,
    discountPrice: 280,
    category: 'Handicrafts',
    unit: '5 units',
    rating: 4.8,
    images: ['https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&w=400&q=80'],
  },
  {
    _id: 'mock3',
    name: 'Pure organic Cardamom Tea Spice',
    description: 'Whole aromatic cardamom pods dried organically in local Kerala spices estate.',
    price: 250,
    discountPrice: 220,
    category: 'Grocery',
    unit: '100g',
    rating: 4.7,
    images: ['https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=400&q=80'],
  },
  {
    _id: 'mock4',
    name: 'Hand-woven Pure Khadi Cotton Shirt',
    description: 'Comfortable breathable pure cotton Khadi fabric shirt woven by state cooperatives.',
    price: 1200,
    discountPrice: 999,
    category: 'Clothing',
    unit: '1 unit',
    rating: 4.6,
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80'],
  },
  {
    _id: 'mock5',
    name: 'Whole Grain Sourdough Millet Bread',
    description: 'Healthy millet flour sourdough bread freshly baked in wood-fired ovens.',
    price: 180,
    discountPrice: 150,
    category: 'Bakery',
    unit: '400g',
    rating: 4.9,
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80'],
  },
  {
    _id: 'mock6',
    name: 'Natural Neem & Tulsi Herbal Soap',
    description: 'Handmade organic bathing bars made with neem, tulsi extracts and virgin coconut oil.',
    price: 120,
    discountPrice: 99,
    category: 'Pharmacy',
    unit: '2 bars',
    rating: 4.8,
    images: ['https://images.unsplash.com/photo-1607006342411-91f14846747d?auto=format&fit=crop&w=400&q=80'],
  },
];

export default Storefront;
