import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslate } from '../context/LanguageContext';
import { Search, MapPin, Store, ShoppingBag, TrendingUp, ShieldCheck, ChevronRight } from 'lucide-react';
import Button from '../components/common/Button';
import apiClient from '../services/api';

const Landing = () => {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const [searchVal, setSearchVal] = useState('');

  const [featuredShops, setFeaturedShops] = useState([]);
  const [shopsLoading, setShopsLoading] = useState(true);

  const categories = [
    { name: 'Grocery', icon: '🍎', path: '/storefront?category=Grocery' },
    { name: 'Electronics', icon: '⚡', path: '/storefront?category=Electronics' },
    { name: 'Clothing', icon: '👕', path: '/storefront?category=Clothing' },
    { name: 'Bakery', icon: '🍞', path: '/storefront?category=Bakery' },
    { name: 'Handicrafts', icon: '🏺', path: '/storefront?category=Handicrafts' },
    { name: 'Pharmacy', icon: '💊', path: '/storefront?category=Pharmacy' },
  ];

  const mockFeaturedShops = [
    {
      _id: 'shop1',
      name: 'Sharma Grocery & Fruits',
      category: 'Grocery',
      rating: 4.8,
      address: 'Malviya Nagar, Jaipur',
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=400&q=80',
      isVerified: true,
    },
    {
      _id: 'shop2',
      name: 'Chennai Silk & Textiles',
      category: 'Clothing',
      rating: 4.7,
      address: 'T. Nagar, Chennai',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80',
      isVerified: true,
    },
    {
      _id: 'shop3',
      name: 'Krishna Organic Bakery',
      category: 'Bakery',
      rating: 4.9,
      address: 'Connaught Place, New Delhi',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
      isVerified: true,
    },
  ];

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setShopsLoading(true);
        const res = await apiClient.get('/shops');
        if (res.data?.success && Array.isArray(res.data.data.shops) && res.data.data.shops.length > 0) {
          setFeaturedShops(res.data.data.shops.slice(0, 3));
        } else {
          setFeaturedShops(mockFeaturedShops);
        }
      } catch (err) {
        console.warn('Failed to fetch real shops. Loading mock featured list:', err.message);
        setFeaturedShops(mockFeaturedShops);
      } finally {
        setShopsLoading(false);
      }
    };
    fetchShops();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/storefront?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <div className="flex flex-col gap-16 py-4 relative">
      
      {/* ─── HERO SECTION ─── */}
      <section className="text-center py-10 md:py-16 flex flex-col items-center max-w-4xl mx-auto relative z-10">
        
        {/* Glow Blur Accent */}
        <div className="absolute top-0 w-72 h-72 bg-primary/20 rounded-full blur-[100px] pointer-events-none -z-10" />

        <span className="px-3.5 py-1.5 text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 rounded-full mb-6 select-none animate-pulse">
          🎯 Empowering Vocal For Local in India
        </span>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-none mb-6">
          Your Neighborhood Shops, <br />
          <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
            Now Online.
          </span>
        </h1>
        
        <p className="text-sm sm:text-md md:text-lg text-brand-muted max-w-2xl mb-10 leading-relaxed font-sans font-medium">
          Discover, support, and buy directly from nearby groceries, local artisans, apparel markets, and bakeries. Supporting your community has never been simpler.
        </p>

        {/* Big Search Bar */}
        <form onSubmit={handleSearch} className="w-full max-w-xl relative flex flex-col sm:flex-row gap-3 bg-brand-surface border border-brand-border rounded-2xl p-2.5 shadow-2xl glass mb-4">
          <div className="flex-1 flex items-center gap-2 px-3">
            <Search className="text-brand-muted shrink-0" size={18} />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-brand-text placeholder-brand-muted text-sm"
            />
          </div>
          <Button type="submit" size="md" className="sm:w-auto w-full">
            Search Shops
          </Button>
        </form>

        <div className="flex items-center gap-1.5 text-xs text-brand-muted">
          <MapPin size={13} className="text-primary" />
          <span>Showing stores near your location in India</span>
        </div>

      </section>

      {/* ─── QUICK CATEGORIES ─── */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Explore Local Categories</h2>
          <p className="text-xs text-brand-muted">Find exactly what you need from top neighborhood sellers</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={cat.path}
              className="glass glass-hover rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden group"
            >
              <span className="text-3xl filter drop-shadow-md group-hover:scale-110 transition-transform">
                {cat.icon}
              </span>
              <h3 className="font-extrabold text-xs sm:text-sm">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── RECRUITMENT CTA ─── */}
      <section className="grid md:grid-cols-2 gap-6">
        
        {/* Buyer Card */}
        <div className="glass rounded-3xl p-8 border border-brand-border relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div>
            <span className="text-2xl mb-3 block">🛍️</span>
            <h3 className="font-extrabold text-lg sm:text-xl mb-2">Shop from Local Markets</h3>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed mb-6 font-sans">
              Support neighborhood grocery stores, silks, and home products. Secure payments verified by Razorpay.
            </p>
          </div>
          <Link to="/storefront">
            <Button variant="outline" size="sm" icon={ChevronRight} iconPosition="right">
              Explore Storefront
            </Button>
          </Link>
        </div>

        {/* Seller Card */}
        <div className="glass rounded-3xl p-8 border border-primary/20 relative overflow-hidden flex flex-col justify-between min-h-[220px] bg-gradient-to-tr from-primary/5 to-transparent">
          <div>
            <span className="text-2xl mb-3 block">🏪</span>
            <h3 className="font-extrabold text-lg sm:text-xl mb-2">Grow Your Local Store</h3>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed mb-6 font-sans">
              Launch your digital showroom, list products, accept payments online, and manage incoming orders in your local language.
            </p>
          </div>
          <Link to="/shop-register">
            <Button variant="primary" size="sm" icon={ChevronRight} iconPosition="right">
              {t('shopRegister')}
            </Button>
          </Link>
        </div>

      </section>

      {/* ─── FEATURED STORES ─── */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Verified Shops</h2>
            <p className="text-xs text-brand-muted">Top-rated neighborhood businesses certified by Local Bazar</p>
          </div>
          <Link to="/storefront" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
            View All <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredShops.map((shop) => {
            const shopImg = shop.logo?.url || (shop.image || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=400&q=80');
            const shopAddr = shop.address?.street ? `${shop.address.street}, ${shop.address.city}` : (shop.address || 'India');
            return (
              <Link
                key={shop._id}
                to={`/storefront?shopId=${shop._id}`}
                className="glass glass-hover rounded-3xl overflow-hidden flex flex-col group border border-brand-border"
              >
                <div className="relative h-44 overflow-hidden bg-brand-surface-2/45">
                  <img
                    src={shopImg}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-4 left-4 bg-brand-bg/85 backdrop-blur-md text-[10px] font-extrabold px-2.5 py-1.5 rounded-full border border-brand-border flex items-center gap-1 shadow-md">
                    ⭐ {shop.rating || '4.5'}
                  </span>
                  <span className="absolute top-4 right-4 bg-primary text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md shadow-primary/20">
                    {shop.category}
                  </span>
                </div>
                <div className="p-5 flex flex-col gap-2">
                  <h3 className="font-extrabold text-sm sm:text-md text-brand-text truncate flex items-center gap-1.5">
                    {shop.name}
                    {(shop.isVerified || shop.logo?.url) && <span className="text-primary text-xs" title="Verified Seller">✅</span>}
                  </h3>
                  <p className="text-xs text-brand-muted flex items-center gap-1 truncate font-sans">
                    <MapPin size={12} className="text-brand-muted" />
                    {shopAddr}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── BENEFITS GRID ─── */}
      <section className="bg-brand-surface/40 border border-brand-border rounded-3xl p-8 sm:p-10 text-center flex flex-col gap-10">
        <div className="max-w-2xl mx-auto flex flex-col gap-2">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Support local growth</h2>
          <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-sans">
            Local Bazar is built to support local mom-and-pop shops by providing modern digital business tools in their local languages.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          <div className="flex flex-col items-center gap-3 p-4">
            <span className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center">
              <Store size={20} />
            </span>
            <h3 className="font-bold text-xs sm:text-sm">Vocal For Local</h3>
            <p className="text-[11px] text-brand-muted leading-relaxed font-sans">
              Keep neighborhood capital growing within your community by buying directly.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 p-4">
            <span className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center">
              <TrendingUp size={20} />
            </span>
            <h3 className="font-bold text-xs sm:text-sm">Modern Logistics</h3>
            <p className="text-[11px] text-brand-muted leading-relaxed font-sans">
              Instantly monitor orders, customize shop layouts, and manage stocks seamlessly.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 p-4">
            <span className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center">
              <ShieldCheck size={20} />
            </span>
            <h3 className="font-bold text-xs sm:text-sm">Razorpay Checkout</h3>
            <p className="text-[11px] text-brand-muted leading-relaxed font-sans">
              Experience safe, quick transactions with 100% verified server signature security.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;
