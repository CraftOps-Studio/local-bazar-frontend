import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslate } from '../context/LanguageContext';
import { Search, MapPin, ChevronRight, Star, Plus, Loader2, Store } from 'lucide-react';
import apiClient from '../services/api';

// ─── CATEGORIES ───
const CATEGORIES = [
  { name: 'Grocery',     emoji: '🛒', path: '/storefront?category=Grocery' },
  { name: 'Bakery',      emoji: '🍞', path: '/storefront?category=Bakery' },
  { name: 'Tailor',      emoji: '✂️', path: '/storefront?category=Clothing' },
  { name: 'Repair',      emoji: '🔧', path: '/storefront?category=Electronics' },
  { name: 'Pharmacy',    emoji: '💊', path: '/storefront?category=Pharmacy' },
  { name: 'Handicrafts', emoji: '🏺', path: '/storefront?category=Handicrafts' },
];

// ─── GREETING ───
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

// ─── HELPER ───
const formatAddress = (address) => {
  if (!address) return '';
  if (typeof address === 'string') return address;
  const parts = [address.city, address.state].filter(Boolean);
  return parts.join(', ') || address.street || '';
};

// ─── STORE CARD ───
const StoreCard = ({ shop }) => {
  const isOpen = shop.isOpen ?? shop.isActive ?? true;
  const minOrder = shop.minOrder ?? shop.minimumOrderAmount ?? 0;
  const deliveryTime = shop.deliveryTime ?? 30;
  const addressText = shop.address && typeof shop.address === 'object'
    ? formatAddress(shop.address)
    : (shop.address || '');

  return (
    <Link
      to={`/storefront?shopId=${shop._id}`}
      className="block rounded-2xl overflow-hidden flex-shrink-0 w-72 sm:w-auto transition-all duration-200 hover:shadow-md"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="relative h-36 overflow-hidden" style={{ background: 'var(--surface)' }}>
        {shop.logo?.url && <img src={shop.logo.url} alt={shop.name} className="w-full h-full object-cover" />}
        <div className="absolute top-2.5 right-2.5">
          <span
            className="text-[10px] font-bold px-2 py-1 rounded-full"
            style={isOpen ? { background: '#D1FAE5', color: '#065F46' } : { background: '#FEE2E2', color: '#991B1B' }}
          >
            {isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
        <div
          className="absolute bottom-0 left-3 translate-y-1/2 w-12 h-12 rounded-xl overflow-hidden"
          style={{ border: '2px solid var(--card)', background: 'var(--surface)' }}
        >
          {shop.logo?.url && <img src={shop.logo.url} alt="" className="w-full h-full object-cover" />}
        </div>
      </div>

      <div className="pt-8 pb-3 px-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 mr-2">
            <h3 className="font-bold text-sm truncate" style={{ color: 'var(--text)' }}>{shop.name}</h3>
            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
              {shop.category}{addressText ? ` · ${addressText}` : ''}
            </p>
          </div>
          {shop.rating > 0 && (
            <div className="flex items-center gap-1 text-xs font-bold flex-shrink-0" style={{ color: '#F97316' }}>
              <Star size={12} fill="#F97316" /> {shop.rating.toFixed(1)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          {minOrder > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: '#FFF7ED', color: '#F97316' }}>
              🎁 Min ₹{minOrder}
            </span>
          )}
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}>
            🕐 {deliveryTime} min
          </span>
        </div>
      </div>
    </Link>
  );
};

// ─── PRODUCT CARD ───
const ProductCard = ({ product, onAdd }) => (
  <div
    className="rounded-2xl overflow-hidden flex flex-col"
    style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
  >
    <div className="h-32 overflow-hidden" style={{ background: 'var(--surface)' }}>
      <img
        src={product.images?.[0]?.url || product.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80'}
        alt={product.name}
        className="w-full h-full object-cover"
        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80'; }}
      />
    </div>
    <div className="p-3 flex flex-col gap-1.5 flex-1 justify-between">
      <div>
        <h4 className="font-bold text-sm leading-tight" style={{ color: 'var(--text)' }}>{product.name}</h4>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{product.unit || product.weight || ''}</p>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-extrabold text-sm" style={{ color: 'var(--text)' }}>₹{product.discountPrice || product.price}</span>
        <button
          onClick={() => onAdd(product)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all active:scale-95"
          style={{ background: '#F97316' }}
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  </div>
);

// ─── MAIN LANDING ───
const Landing = () => {
  const { t } = useTranslate();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [searchVal, setSearchVal] = useState('');
  const [featuredShops, setFeaturedShops] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [shopsLoading, setShopsLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [addedId, setAddedId] = useState(null);

  const userName = user?.name?.split(' ')[0] || 'there';

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setShopsLoading(true);
        const res = await apiClient.get('/shops');
        if (res.data?.success) {
          setFeaturedShops(res.data.data.shops?.slice(0, 4) || []);
        } else {
          setFeaturedShops([]);
        }
      } catch (err) {
        console.error('Failed to fetch shops:', err.message);
        setFeaturedShops([]);
      } finally {
        setShopsLoading(false);
      }
    };

    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const res = await apiClient.get('/products?limit=4');
        if (res.data?.success) {
          setPopularItems(res.data.data.products?.slice(0, 4) || []);
        } else {
          setPopularItems([]);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err.message);
        setPopularItems([]);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchShops();
    fetchProducts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) navigate(`/storefront?search=${encodeURIComponent(searchVal.trim())}`);
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((i) => i.product === product._id);
    if (existing) { existing.quantity += 1; }
    else {
      cart.push({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url || product.images?.[0],
        quantity: 1,
        shop: product.shop,
        stock: 50,
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    setAddedId(product._id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="flex flex-col gap-8 pb-4 animate-slideUp">

      {/* ─── GREETING HEADER ─── */}
      <section
        className="rounded-3xl p-6 sm:p-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #F97316 0%, #FB923C 50%, #FDBA74 100%)', boxShadow: '0 8px 32px rgba(249,115,22,0.25)' }}
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/90 text-sm font-medium flex items-center gap-1.5">{getGreeting()} 👋</p>
              <h1 className="text-white font-extrabold text-2xl sm:text-3xl mt-1 tracking-tight">
                {isAuthenticated ? userName : 'Welcome!'}
              </h1>
              <p className="text-white/80 text-xs mt-1.5 flex items-center gap-1">
                <MapPin size={12} /> Anna Nagar, Madurai
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-extrabold text-[#F97316] text-lg flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.92)' }}
            >
              {isAuthenticated ? user?.name?.slice(0, 1).toUpperCase() : '🛍'}
            </div>
          </div>
          <form onSubmit={handleSearch} className="mt-5 flex items-center gap-2">
            <div
              className="flex-1 flex items-center gap-2 px-4 py-3 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
            >
              <Search size={16} style={{ color: '#F97316' }} className="shrink-0" />
              <input
                type="text"
                placeholder="Milk, rice, bread..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-sm font-medium"
                style={{ color: '#1B1B1B' }}
              />
            </div>
            {searchVal.trim() && (
              <button
                type="submit"
                className="px-4 py-3 rounded-2xl font-bold text-sm text-white"
                style={{ background: 'rgba(0,0,0,0.2)' }}
              >
                Go
              </button>
            )}
          </form>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-base" style={{ color: 'var(--text)' }}>Categories</h2>
          <Link to="/storefront" className="text-xs font-bold flex items-center gap-1" style={{ color: '#F97316' }}>
            See all <ChevronRight size={13} />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map((cat) => (
            <Link key={cat.name} to={cat.path} className="category-chip flex-shrink-0">
              <span className="text-2xl">{cat.emoji}</span>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── NEARBY STORES ─── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-base" style={{ color: 'var(--text)' }}>Nearby stores</h2>
          <Link to="/storefront" className="text-xs font-bold flex items-center gap-1" style={{ color: '#F97316' }}>
            See all <ChevronRight size={13} />
          </Link>
        </div>

        {shopsLoading ? (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton w-72 h-48 rounded-2xl flex-shrink-0" />
            ))}
          </div>
        ) : featuredShops.length === 0 ? (
          <div
            className="rounded-2xl p-8 flex flex-col items-center gap-3 text-center"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <Store size={32} style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
              No stores available yet. Be the first to list yours!
            </p>
            <Link
              to="/shop-register"
              className="text-xs font-bold px-4 py-2 rounded-xl text-white"
              style={{ background: '#F97316' }}
            >
              Register Your Shop
            </Link>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible">
            {featuredShops.map((shop) => (
              <StoreCard key={shop._id} shop={shop} />
            ))}
          </div>
        )}
      </section>

      {/* ─── POPULAR ITEMS ─── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-extrabold text-base" style={{ color: 'var(--text)' }}>Popular items</h2>
          <Link to="/storefront" className="text-xs font-bold flex items-center gap-1" style={{ color: '#F97316' }}>
            See all <ChevronRight size={13} />
          </Link>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
          </div>
        ) : popularItems.length === 0 ? (
          <div
            className="rounded-2xl p-8 text-center"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
              No products listed yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {popularItems.map((product) => (
              <div key={product._id} className="relative">
                <ProductCard product={product} onAdd={handleAddToCart} />
                {addedId === product._id && (
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-2xl animate-fadeIn"
                    style={{ background: 'rgba(249,115,22,0.12)' }}
                  >
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full text-white" style={{ background: '#F97316' }}>
                      ✓ Added!
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── SELLER CTA ─── */}
      <section
        className="rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
      >
        <div>
          <span className="text-3xl mb-2 block">🏪</span>
          <h3 className="font-extrabold text-base sm:text-lg" style={{ color: 'var(--text)' }}>
            Grow your local store online
          </h3>
          <p className="text-xs sm:text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            List products, accept payments, manage orders — all in one place.
          </p>
        </div>
        <Link
          to="/shop-register"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white text-sm transition-all flex-shrink-0 active:scale-95"
          style={{ background: '#F97316', boxShadow: '0 4px 14px rgba(249,115,22,0.30)' }}
        >
          Start Selling <ChevronRight size={16} />
        </Link>
      </section>

    </div>
  );
};

export default Landing;
