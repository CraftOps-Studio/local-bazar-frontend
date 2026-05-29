import React, { useState, useEffect } from 'react';
import { useTranslate } from '../../context/LanguageContext';
import { useOutletContext } from 'react-router-dom';
import { 
  ShoppingBag, Plus, Search, MoreVertical, Edit, 
  Trash2, AlertTriangle, Info, Image, ShieldCheck, Loader2 
} from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import apiClient from '../../services/api';

const Products = () => {
  const { t } = useTranslate();
  const { shop } = useOutletContext();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  
  // Form Fields State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('piece');
  const [category, setCategory] = useState('Grocery');
  
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const categories = [
    'Grocery',
    'Electronics',
    'Fashion',
    'Food & Beverages',
    'Home & Garden',
    'Beauty & Health',
    'Sports',
    'Books',
    'Toys',
    'Automotive',
    'Other'
  ];

  const allowedUnits = ['piece', 'kg', 'g', 'litre', 'ml', 'pack', 'dozen', 'pair'];

  const fetchProducts = async () => {
    if (!shop?._id) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/products/shop/${shop._id}`);
      if (res.data?.success) {
        setProducts(res.data.data.products || []);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [shop?._id]);

  const getStockStatus = (qty) => {
    if (qty === 0) return { label: 'Out of stock', color: 'bg-rose-500/10 border-rose-500/20 text-rose-400' };
    if (qty <= 10) return { label: 'Low stock', color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' };
    return { label: 'In stock', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' };
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!name || !description || !price || stock === '') {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (discountPrice && Number(discountPrice) >= Number(price)) {
      setErrorMessage('Discount price must be strictly lower than the standard price.');
      return;
    }

    try {
      setActionLoading(true);

      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('unit', unit);
      formData.append('price', Number(price));
      if (discountPrice) {
        formData.append('discountPrice', Number(discountPrice));
      }
      formData.append('stock', Number(stock));
      formData.append('shop', shop._id);
      
      if (logoFile) {
        formData.append('images', logoFile);
      }

      const res = await apiClient.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        // Refresh products list
        await fetchProducts();
        
        // Reset states
        setName('');
        setDescription('');
        setPrice('');
        setDiscountPrice('');
        setStock('');
        setUnit('piece');
        setCategory('Grocery');
        setLogoFile(null);
        setLogoPreview('');
        
        setModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to create product:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to create product. Check sizes or try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product from your catalogue? This action is irreversible.')) {
      return;
    }
    
    try {
      setLoading(true);
      const res = await apiClient.delete(`/products/${id}`);
      if (res.data?.success) {
        // Fast-filter locally and update
        setProducts(products.filter((p) => p._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete product:', err.message);
      alert(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchVal.toLowerCase()) ||
    p.category.toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-brand-border/40 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black flex items-center gap-2">
            <ShoppingBag size={22} className="text-primary" />
            Active Inventory
          </h2>
          <p className="text-xs text-brand-muted mt-1 font-sans">
            Add new products, adjust pricing, and track catalog items in real time.
          </p>
        </div>

        {shop?.status === 'approved' || shop?.isVerified ? (
          <Button 
            variant="primary" 
            size="sm" 
            icon={Plus} 
            onClick={() => setModalOpen(true)}
            className="shadow-lg shadow-primary/20"
          >
            Add New Product
          </Button>
        ) : (
          <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1.5 rounded-lg text-xs font-bold">
            <AlertTriangle size={14} />
            Pending Approval
          </div>
        )}
      </div>

      {/* Products list grid table wrapper */}
      <div className="glass rounded-3xl border border-brand-border overflow-hidden">
        <div className="px-6 py-4 bg-brand-surface-2/20 border-b border-brand-border/40 flex items-center justify-between gap-4">
          {/* Quick-filter */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search catalog by title or category..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-brand-surface-2 border border-brand-border rounded-xl py-2 pl-4 pr-10 outline-none text-xs text-brand-text"
            />
            <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
          </div>
        </div>

        <div className="overflow-x-auto w-full no-scrollbar">
          {loading && products.length === 0 ? (
            <div className="flex items-center justify-center py-12 gap-2">
              <Loader2 size={18} className="animate-spin text-primary" />
              <span className="text-xs text-brand-muted font-sans font-medium">Fetching catalogue...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-brand-muted text-xs font-sans">
              No products found in your inventory. Add your first item above!
            </div>
          ) : (
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b border-brand-border/40 text-[10px] font-bold text-brand-muted uppercase tracking-wider bg-brand-surface-2/10">
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Unit</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/20 text-xs sm:text-sm">
                {filteredProducts.map((prod) => {
                  const status = getStockStatus(prod.stock);
                  const isDiscounted = prod.discountPrice && prod.discountPrice < prod.price;
                  const itemImg = prod.images && prod.images[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format';
                  
                  return (
                    <tr key={prod._id} className="hover:bg-brand-surface-2/10 transition-all">
                      <td className="px-6 py-3 flex items-center gap-3">
                        <div className="w-11 h-11 bg-brand-surface border border-brand-border rounded-xl overflow-hidden shrink-0">
                          <img src={itemImg} alt={prod.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-extrabold text-brand-text truncate max-w-[180px]">{prod.name}</span>
                      </td>
                      <td className="px-6 py-3 text-brand-muted font-semibold">{prod.category}</td>
                      <td className="px-6 py-3 text-brand-muted text-xs font-mono">{prod.unit}</td>
                      <td className="px-6 py-3">
                        <div className="flex flex-col">
                          {isDiscounted ? (
                            <>
                              <span className="font-bold text-brand-text">₹{prod.discountPrice}</span>
                              <span className="text-[10px] text-brand-muted line-through">₹{prod.price}</span>
                            </>
                          ) : (
                            <span className="font-bold text-brand-text">₹{prod.price}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 font-bold text-brand-text">{prod.stock}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2.5 py-1 text-[9px] font-bold rounded-lg border uppercase tracking-wider select-none ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleDelete(prod._id)}
                            className="p-1.5 bg-brand-surface-2 border border-brand-border hover:border-error hover:text-error rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ─── ADD PRODUCT MODAL ─── */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register Catalog Product" maxWidth="max-w-lg">
        <form onSubmit={handleCreateProduct} className="flex flex-col gap-5">
          
          {errorMessage && (
            <div className="bg-error/10 border border-error/25 rounded-xl p-3 text-xs text-error flex items-center gap-2">
              <AlertTriangle size={14} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="Product Title"
            type="text"
            placeholder="e.g. Alphonso Mangoes"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-brand-muted uppercase tracking-wider pl-1">
              Description
            </label>
            <textarea
              placeholder="Provide organic quality details, dimensions, ingredients, or care rules..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full bg-brand-surface-2 border border-brand-border rounded-xl py-3 px-4 outline-none text-brand-text placeholder-brand-muted text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-brand-muted uppercase tracking-wider pl-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-brand-surface-2 border border-brand-border rounded-xl py-3 px-4 outline-none text-brand-text text-sm focus:border-primary transition-all font-sans"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-brand-surface">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-brand-muted uppercase tracking-wider pl-1">
                Selling Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-brand-surface-2 border border-brand-border rounded-xl py-3 px-4 outline-none text-brand-text text-sm focus:border-primary transition-all font-sans capitalize"
                required
              >
                {allowedUnits.map((u) => (
                  <option key={u} value={u} className="bg-brand-surface">
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3.5">
            <Input
              label="MRP Price (₹)"
              type="number"
              placeholder="650"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <Input
              label="Discount (₹)"
              type="number"
              placeholder="499"
              value={discountPrice}
              onChange={(e) => setDiscountPrice(e.target.value)}
            />
            <Input
              label="In Stock Qty"
              type="number"
              placeholder="100"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
            />
          </div>

          {/* Image preview */}
          <div className="flex items-center gap-4 p-4 bg-brand-surface-2/45 border border-brand-border rounded-xl">
            <div className="w-14 h-14 bg-brand-surface border border-brand-border rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-xl font-bold">
              {logoPreview ? (
                <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Image size={18} className="text-brand-muted" />
              )}
            </div>
            <div className="flex-1 flex flex-col gap-1 w-full">
              <span className="text-xs font-bold text-brand-text">Product Image</span>
              <label className="text-[10px] text-primary hover:underline font-bold cursor-pointer uppercase tracking-wider select-none">
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                Upload Picture
              </label>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            icon={ShieldCheck}
            loading={actionLoading}
            className="w-full mt-2"
          >
            Add Product to Catalogue
          </Button>

        </form>
      </Modal>

    </div>
  );
};

export default Products;
