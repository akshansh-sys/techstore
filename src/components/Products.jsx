import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  TrendingUp,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { formatRupees } from '../utils/formatters';
import ConfirmModal from './ConfirmModal';

export default function Products({
  products,
  onSaveProduct,
  onDeleteProduct,
  showToast,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'General',
    purchasePrice: '',
    sellingPrice: '',
    quantity: '',
    minStock: '5',
  });
  const [formErrors, setFormErrors] = useState({});

  // Unique Categories from registered products
  const categories = ['All', ...new Set(products.map((p) => p.category || 'General'))].filter(Boolean);

  // Inventory Health Stats
  const inStockCount = products.filter((p) => p.quantity > (p.minStock || 5)).length;
  const lowStockCount = products.filter((p) => p.quantity > 0 && p.quantity <= (p.minStock || 5)).length;
  const outOfStockCount = products.filter((p) => p.quantity <= 0).length;

  // Open modal for Adding a new product
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'General',
      purchasePrice: '',
      sellingPrice: '',
      quantity: '',
      minStock: '5',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open modal for Editing an existing product
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category || 'General',
      purchasePrice: product.purchasePrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      quantity: product.quantity.toString(),
      minStock: (product.minStock || 5).toString(),
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }
    const purchase = parseFloat(formData.purchasePrice);
    if (formData.purchasePrice === '' || isNaN(purchase) || purchase < 0) {
      errors.purchasePrice = 'Enter a valid purchase price (₹0 or more)';
    }
    const selling = parseFloat(formData.sellingPrice);
    if (formData.sellingPrice === '' || isNaN(selling) || selling < 0) {
      errors.sellingPrice = 'Enter a valid selling price (₹0 or more)';
    }
    const qty = parseInt(formData.quantity, 10);
    if (formData.quantity === '' || isNaN(qty) || qty < 0) {
      errors.quantity = 'Available stock must be 0 or more';
    }
    const min = parseInt(formData.minStock, 10);
    if (formData.minStock === '' || isNaN(min) || min < 0) {
      errors.minStock = 'Minimum stock level must be 0 or more';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const productPayload = {
        ...(editingProduct ? { id: editingProduct.id } : {}),
        name: formData.name.trim(),
        category: formData.category.trim() || 'General',
        purchasePrice: parseFloat(formData.purchasePrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        quantity: parseInt(formData.quantity, 10),
        minStock: parseInt(formData.minStock, 10),
      };

      onSaveProduct(productPayload);
      setIsModalOpen(false);
      showToast(
        editingProduct ? 'Product updated successfully!' : 'Product added successfully!',
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Failed to save product', 'error');
    }
  };

  // Delete product action with confirmation
  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    try {
      onDeleteProduct(productToDelete.id);
      showToast(`Deleted "${productToDelete.name}"`, 'success');
    } catch (err) {
      showToast('Error deleting product', 'error');
    } finally {
      setProductToDelete(null);
    }
  };

  // Filter products by search query and category
  const filteredProducts = products.filter((p) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(query) ||
      (p.category && p.category.toLowerCase().includes(query));
    const matchesCategory =
      selectedCategory === 'All' || (p.category || 'General') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate live margin preview in modal
  const calcPurchase = parseFloat(formData.purchasePrice) || 0;
  const calcSelling = parseFloat(formData.sellingPrice) || 0;
  const calcMargin = calcSelling - calcPurchase;

  return (
    <div className="space-y-6 animate-fade-in text-[#dfe7e0]">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#dfe7e0] uppercase">
              Inventory Vault
            </h2>
            <span className="text-xs font-mono font-bold bg-white/[0.06] text-[#dfe7e0] px-2.5 py-0.5 rounded-full border border-white/10">
              {products.length}
            </span>
          </div>
          <p className="text-xs text-[#78837c] font-mono mt-1">
            Manage purchase rates, selling prices, stock levels & profit margins
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 btn-vermilion font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Stock Health Summary Badges */}
      <div className="grid grid-cols-3 gap-3 p-3 kage-card text-xs">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-black/40 border border-white/5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] shrink-0"></div>
          <div>
            <span className="text-[#78837c] text-[9px] font-mono uppercase tracking-wider block">In Stock</span>
            <span className="font-bold font-mono text-emerald-300 text-sm">{inStockCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-black/40 border border-white/5">
          <div className="w-2 h-2 rounded-full bg-[#ff5a3c] shadow-[0_0_8px_#ff5a3c] shrink-0"></div>
          <div>
            <span className="text-[#78837c] text-[9px] font-mono uppercase tracking-wider block">Low Stock</span>
            <span className="font-bold font-mono text-amber-300 text-sm">{lowStockCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-black/40 border border-white/5">
          <div className="w-2 h-2 rounded-full bg-[#e0231c] shadow-[0_0_8px_#e0231c] shrink-0"></div>
          <div>
            <span className="text-[#78837c] text-[9px] font-mono uppercase tracking-wider block">Out of Stock</span>
            <span className="font-bold font-mono text-red-400 text-sm">{outOfStockCount}</span>
          </div>
        </div>
      </div>

      {/* Search Bar & Category Filter Pills */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78837c]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by title or category..."
            className="w-full pl-10 pr-10 py-2.5 bg-black/50 border border-white/10 rounded-xl text-sm text-[#dfe7e0] placeholder-[#78837c] focus:outline-none focus:border-[#e0231c] focus:ring-1 focus:ring-[#e0231c]/50 transition shadow-inner"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#78837c] hover:text-[#dfe7e0] p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills Slider */}
        {categories.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all duration-150 shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#e0231c] text-white border border-[#ff5a3c]/30 shadow-md shadow-red-950/40 font-semibold'
                    : 'bg-black/40 text-[#aab4ad] border border-white/10 hover:text-[#dfe7e0] hover:bg-white/[0.05]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="kage-card overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-[#78837c]">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#dfe7e0]" />
            <p className="font-bold text-sm text-[#dfe7e0]">No products match your search</p>
            <p className="text-xs text-[#78837c] mt-1 max-w-sm mx-auto">
              {searchTerm
                ? 'Try a different keyword or reset category filter.'
                : 'Click "+ Add New Item" above to register items to your inventory.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/50 border-b border-white/10 text-[10px] font-mono uppercase tracking-[0.2em] text-[#78837c]">
                <tr>
                  <th className="py-3.5 px-4">Item Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Purchase Rate</th>
                  <th className="py-3.5 px-4 text-right">Selling Price</th>
                  <th className="py-3.5 px-4 text-right">Gross Margin</th>
                  <th className="py-3.5 px-4 text-center">Available Stock</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((product) => {
                  const isOutOfStock = product.quantity <= 0;
                  const isLowStock = product.quantity <= (product.minStock || 5);
                  const margin = product.sellingPrice - product.purchasePrice;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-white/[0.03] transition-colors duration-100"
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#dfe7e0] leading-tight">
                          {product.name}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-xs">
                        <span className="px-2 py-0.5 bg-black/40 text-[#aab4ad] font-mono text-[10px] rounded border border-white/5">
                          {product.category || 'General'}
                        </span>
                      </td>

                      {/* Purchase Price */}
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-[#78837c]">
                        {formatRupees(product.purchasePrice)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#c9a24a]">
                        {formatRupees(product.sellingPrice)}
                      </td>

                      {/* Gross Margin */}
                      <td className="py-3.5 px-4 text-right font-mono text-xs font-semibold">
                        <span className={margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {margin >= 0 ? `+${formatRupees(margin)}` : formatRupees(margin)}
                        </span>
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[#dfe7e0]">
                        <span className="text-sm">{product.quantity}</span>
                        <span className="text-[10px] text-[#78837c] block font-normal font-mono">
                          Min: {product.minStock}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center text-[9px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-500/30">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
                            <AlertTriangle className="w-3 h-3 text-[#ff5a3c]" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[9px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-500/30">
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 text-[#78837c] hover:text-[#dfe7e0] hover:bg-white/[0.08] rounded-lg transition"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(product)}
                            className="p-1.5 text-[#78837c] hover:text-red-400 hover:bg-red-950/30 rounded-lg transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="bg-[#0a0e12] rounded-2xl max-w-lg w-full p-5 sm:p-7 shadow-[0_10px_40px_rgba(0,0,0,0.9)] border border-white/15 my-4 sm:my-8 max-h-[92vh] overflow-y-auto animate-scale-up">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/[0.06] text-[#e0231c]">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-[#dfe7e0] uppercase tracking-wide">
                  {editingProduct ? 'Edit Vault Item' : 'Register New Item'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#78837c] hover:text-[#dfe7e0] hover:bg-white/[0.08] rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1">
                  Product Name <span className="text-[#e0231c]">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Premium Basmati Rice 5kg"
                  className={`w-full px-3.5 py-2.5 bg-black/50 border rounded-xl text-sm text-[#dfe7e0] placeholder-[#78837c] focus:outline-none focus:bg-black/80 ${
                    formErrors.name
                      ? 'border-red-500 ring-1 ring-red-500/40'
                      : 'border-white/15 focus:border-[#e0231c]'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-xs text-red-400 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Grains, Spices, Mobile Accessories"
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-white/15 rounded-xl text-sm text-[#dfe7e0] placeholder-[#78837c] focus:outline-none focus:border-[#e0231c] focus:bg-black/80"
                />
              </div>

              {/* Prices Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Purchase Price */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1">
                    Purchase Price (₹) <span className="text-[#e0231c]">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.purchasePrice}
                    onChange={(e) =>
                      setFormData({ ...formData, purchasePrice: e.target.value })
                    }
                    placeholder="150"
                    className={`w-full px-3.5 py-2.5 bg-black/50 border rounded-xl text-sm font-mono text-[#dfe7e0] placeholder-[#78837c] focus:outline-none focus:bg-black/80 ${
                      formErrors.purchasePrice
                        ? 'border-red-500 ring-1 ring-red-500/40'
                        : 'border-white/15 focus:border-[#e0231c]'
                    }`}
                  />
                  {formErrors.purchasePrice && (
                    <p className="text-[11px] text-red-400 mt-1">{formErrors.purchasePrice}</p>
                  )}
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1">
                    Selling Price (₹) <span className="text-[#e0231c]">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.sellingPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, sellingPrice: e.target.value })
                    }
                    placeholder="220"
                    className={`w-full px-3.5 py-2.5 bg-black/50 border rounded-xl text-sm font-mono text-[#c9a24a] placeholder-[#78837c] focus:outline-none focus:bg-black/80 ${
                      formErrors.sellingPrice
                        ? 'border-red-500 ring-1 ring-red-500/40'
                        : 'border-white/15 focus:border-[#e0231c]'
                    }`}
                  />
                  {formErrors.sellingPrice && (
                    <p className="text-[11px] text-red-400 mt-1">{formErrors.sellingPrice}</p>
                  )}
                </div>
              </div>

              {/* Profit Margin Preview Callout */}
              <div className="p-3 bg-black/60 border border-white/10 rounded-xl text-xs flex items-center justify-between">
                <span className="text-[#aab4ad] font-mono">Estimated Gross Margin:</span>
                <span className="font-bold font-mono text-[#c9a24a] text-sm">
                  {formatRupees(calcMargin)}
                </span>
              </div>

              {/* Quantities Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Available Quantity */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1">
                    Available Stock <span className="text-[#e0231c]">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    placeholder="25"
                    className={`w-full px-3.5 py-2.5 bg-black/50 border rounded-xl text-sm font-mono text-[#dfe7e0] placeholder-[#78837c] focus:outline-none focus:bg-black/80 ${
                      formErrors.quantity
                        ? 'border-red-500 ring-1 ring-red-500/40'
                        : 'border-white/15 focus:border-[#e0231c]'
                    }`}
                  />
                  {formErrors.quantity && (
                    <p className="text-[11px] text-red-400 mt-1">{formErrors.quantity}</p>
                  )}
                </div>

                {/* Minimum Stock Level */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1">
                    Alert Min Threshold <span className="text-[#e0231c]">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) =>
                      setFormData({ ...formData, minStock: e.target.value })
                    }
                    placeholder="5"
                    className={`w-full px-3.5 py-2.5 bg-black/50 border rounded-xl text-sm font-mono text-[#dfe7e0] placeholder-[#78837c] focus:outline-none focus:bg-black/80 ${
                      formErrors.minStock
                        ? 'border-red-500 ring-1 ring-red-500/40'
                        : 'border-white/15 focus:border-[#e0231c]'
                    }`}
                  />
                  {formErrors.minStock && (
                    <p className="text-[11px] text-red-400 mt-1">{formErrors.minStock}</p>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-mono text-[#aab4ad] hover:text-[#dfe7e0] bg-white/[0.04] hover:bg-white/[0.08] rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white btn-vermilion rounded-xl shadow-md active:scale-95"
                >
                  {editingProduct ? 'Save Changes' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(productToDelete)}
        title="Delete Item"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}
