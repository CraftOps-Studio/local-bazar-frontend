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

  // Fetch products from backend API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const queryParams = [];
        const params = new URLSearchParams(location.search);
        const shopId = params.get('shopId');
        
        if (shopId) queryParams.push(`shop=${shopId}`);
        if (searchTerm) queryParams.push(`keyword=${encodeURIComponent(searchTerm)}`);
        if (category && category !== 'All') queryParams.push(`category=${encodeURIComponent(category)}`);
        if (minPrice > 0) queryParams.push(`price[gte]=${minPrice}`);
        if (maxPrice < 3000) queryParams.push(`price[lte]=${maxPrice}`);
        
        const queryString = queryParams.length ? `?${queryParams.join('&')}` : '';
        
        // If filtering by shop, use the shop-specific endpoint
        const endpoint = shopId
          ? `/products/shop/${shopId}${queryString.replace(`?shop=${shopId}`, '').replace(`&shop=${shopId}`, '')}`
          : `/products${queryString}`;
          
        const res = await apiClient.get(endpoint);
        
        if (res.data?.success && Array.isArray(res.data.data.products)) {
          setProducts(res.data.data.products);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err.message);
        setError('Failed to load products. Please check your connection and try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, category, minPrice, maxPrice, location.search]);

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
      <aside
        className="w-full lg:w-64 shrink-0 flex flex-col gap-6 rounded-3xl p-6 self-start h-auto sticky lg:top-24 z-20"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
      >
        
        <div className="flex items-center gap-2 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <SlidersHorizontal size={17} style={{ color: '#F97316' }} />
          <h2 className="font-extrabold text-sm sm:text-base tracking-tight" style={{ color: 'var(--text)' }}>Filters & Sorting</h2>
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider select-none" style={{ color: 'var(--text-muted)' }}>
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
                  className="px-4 py-2 text-xs font-bold rounded-xl border text-left shrink-0 select-none cursor-pointer transition-all duration-200"
                  style={isSelected
                    ? { background: 'rgba(249,115,22,0.08)', borderColor: '#F97316', color: '#F97316' }
                    : { background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                  }
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Slider */}
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider select-none" style={{ color: 'var(--text-muted)' }}>
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
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
              style={{ background: 'var(--surface-2)' }}
            />
            <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              <span>₹0</span>
              <span className="font-bold" style={{ color: '#F97316' }}>Up to ₹{maxPrice}</span>
            </div>
          </div>
        </div>

      </aside>

      {/* ─── STORES & PRODUCTS LISTINGS ─── */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Dynamic header info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text)' }}>Explore Fresh Stock</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Supporting local markets, directly delivered to your door</p>
          </div>
          
          {/* Quick search input */}
          <div className="relative w-full sm:w-64 shrink-0">
            <input
              type="text"
              placeholder="Filter products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl py-2 pl-4 pr-10 outline-none text-xs"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl p-10 text-center flex flex-col items-center gap-4 max-w-md mx-auto my-10" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <span className="text-4xl">⚠️</span>
            <h3 className="font-extrabold text-sm sm:text-base" style={{ color: 'var(--text)' }}>Connection Error</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{error}</p>
            <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setCategory(''); setMaxPrice(3000); }}>
              Reset Filters
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-3xl p-10 text-center flex flex-col items-center gap-4 max-w-md mx-auto my-10" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <span className="text-4xl">🍎</span>
            <h3 className="font-extrabold text-sm sm:text-base" style={{ color: 'var(--text)' }}>No Products Found</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              We couldn't find any products matching your filters. Try adjusting the category or price range.
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
                  className="rounded-3xl overflow-hidden flex flex-col group transition-all duration-200 hover:shadow-md"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
                >
                  {/* Image wrapper */}
                  <div className="relative h-44 overflow-hidden" style={{ background: 'var(--surface)' }}>
                    <img
                      src={product.images?.[0]?.url || product.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {discounted && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% Off
                      </span>
                    )}
                    <span
                      className="absolute top-3 right-3 text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1"
                      style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--text-secondary)', backdropFilter: 'blur(4px)' }}
                    >
                      📦 {product.unit || 'unit'}
                    </span>
                  </div>

                  {/* Core details */}
                  <div className="p-4 flex flex-col gap-3 flex-1 justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span style={{ color: '#F97316' }}>{product.category}</span>
                        <span className="flex items-center gap-0.5" style={{ color: '#F59E0B' }}>⭐ {product.rating || '4.5'}</span>
                      </div>
                      <h3 className="font-bold text-sm truncate transition-colors" style={{ color: 'var(--text)' }}>
                        {product.name}
                      </h3>
                      <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        {product.description}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col gap-3 pt-3 mt-auto" style={{ borderTop: '1px solid var(--border)' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          {discounted ? (
                            <>
                              <span className="font-extrabold text-sm" style={{ color: 'var(--text)' }}>₹{product.discountPrice}</span>
                              <span className="text-[10px] line-through" style={{ color: 'var(--text-muted)' }}>₹{product.price}</span>
                            </>
                          ) : (
                            <span className="font-extrabold text-sm" style={{ color: 'var(--text)' }}>₹{product.price}</span>
                          )}
                        </div>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          In stock: {product.stock > 100 ? '100+' : product.stock}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 w-full">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={cartSuccess ? ShieldCheck : ShoppingCart}
                          onClick={(e) => handleAddToCart(product, e)}
                          className={`w-full py-2 text-[11px] transition-all duration-300 ${cartSuccess ? 'font-bold' : ''}`}
                          style={cartSuccess ? { borderColor: '#22C55E', color: '#22C55E' } : {}}
                        >
                          {cartSuccess ? t('addedToCart') : t('addToCart')}
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => handleBuyNow(product, e)}
                          className="w-full py-2 text-[11px] font-bold"
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

export default Storefront;
