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
    <div className="space-y-6 animate-fade-in">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Product Inventory
            </h2>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
              {products.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage product selling rates, available stock, and profit margins
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm rounded-xl transition-all duration-150 shadow-md hover:shadow-lg active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Stock Health Summary Badges */}
      <div className="grid grid-cols-3 gap-3 p-3 bg-white border border-slate-200/80 rounded-2xl shadow-card text-xs">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-semibold block">In Stock</span>
            <span className="font-bold font-mono text-emerald-800 text-sm">{inStockCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-amber-50/60 border border-amber-100">
          <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-semibold block">Low Stock</span>
            <span className="font-bold font-mono text-amber-800 text-sm">{lowStockCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-rose-50/60 border border-rose-100">
          <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase font-semibold block">Out of Stock</span>
            <span className="font-bold font-mono text-rose-800 text-sm">{outOfStockCount}</span>
          </div>
        </div>
      </div>

      {/* Search Bar & Category Filter Pills */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by title or category..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200/90 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 shadow-2xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1"
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
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all duration-150 shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-slate-300 stroke-[1.5]" />
            <p className="font-bold text-sm text-slate-700">No products match your search</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm
                ? 'Try a different keyword or reset category filter.'
                : 'Click "+ Add New Product" above to register items to your inventory.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Item Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Purchase Price</th>
                  <th className="py-3.5 px-4 text-right">Selling Price</th>
                  <th className="py-3.5 px-4 text-right">Gross Margin</th>
                  <th className="py-3.5 px-4 text-center">Stock Available</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => {
                  const isOutOfStock = product.quantity <= 0;
                  const isLowStock = product.quantity <= (product.minStock || 5);
                  const margin = product.sellingPrice - product.purchasePrice;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/70 transition-colors duration-100"
                    >
                      {/* Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 leading-tight">
                          {product.name}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200/70">
                          {product.category || 'General'}
                        </span>
                      </td>

                      {/* Purchase Price */}
                      <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-500">
                        {formatRupees(product.purchasePrice)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {formatRupees(product.sellingPrice)}
                      </td>

                      {/* Gross Margin */}
                      <td className="py-3.5 px-4 text-right font-mono text-xs font-semibold">
                        <span className={margin >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                          {margin >= 0 ? `+${formatRupees(margin)}` : formatRupees(margin)}
                        </span>
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                        <span className="text-sm">{product.quantity}</span>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          Min: {product.minStock}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
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
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(product)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-slate-200 my-4 sm:my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-slate-900">
                  {editingProduct ? 'Edit Inventory Item' : 'Add New Inventory Item'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Type-C Fast Charging Cable"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:bg-white ${
                    formErrors.name
                      ? 'border-rose-400 ring-1 ring-rose-300'
                      : 'border-slate-200 focus:border-emerald-500'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-xs text-rose-500 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Mobile Accessories, Grocery, Spices"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              {/* Prices Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Purchase Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Purchase Price (₹) <span className="text-rose-500">*</span>
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
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono focus:outline-none focus:bg-white ${
                      formErrors.purchasePrice
                        ? 'border-rose-400 ring-1 ring-rose-300'
                        : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  {formErrors.purchasePrice && (
                    <p className="text-[11px] text-rose-500 mt-1">{formErrors.purchasePrice}</p>
                  )}
                </div>

                {/* Selling Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Selling Price (₹) <span className="text-rose-500">*</span>
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
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono focus:outline-none focus:bg-white ${
                      formErrors.sellingPrice
                        ? 'border-rose-400 ring-1 ring-rose-300'
                        : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  {formErrors.sellingPrice && (
                    <p className="text-[11px] text-rose-500 mt-1">{formErrors.sellingPrice}</p>
                  )}
                </div>
              </div>

              {/* Profit Margin Preview Callout */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
                <span className="text-slate-600 font-medium">Estimated Gross Profit Margin:</span>
                <span className="font-bold font-mono text-emerald-800 text-sm">
                  {formatRupees(calcMargin)}
                </span>
              </div>

              {/* Quantities Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Available Quantity */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Stock Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    placeholder="25"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono focus:outline-none focus:bg-white ${
                      formErrors.quantity
                        ? 'border-rose-400 ring-1 ring-rose-300'
                        : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  {formErrors.quantity && (
                    <p className="text-[11px] text-rose-500 mt-1">{formErrors.quantity}</p>
                  )}
                </div>

                {/* Minimum Stock Level */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Low Stock Alert Min <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) =>
                      setFormData({ ...formData, minStock: e.target.value })
                    }
                    placeholder="5"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-mono focus:outline-none focus:bg-white ${
                      formErrors.minStock
                        ? 'border-rose-400 ring-1 ring-rose-300'
                        : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  {formErrors.minStock && (
                    <p className="text-[11px] text-rose-500 mt-1">{formErrors.minStock}</p>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-md active:scale-95"
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
        title="Delete Product"
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
