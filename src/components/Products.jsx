import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  IndianRupee,
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

  // Filter products by search query
  const filteredProducts = products.filter((p) => {
    const query = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      (p.category && p.category.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <span>Product Inventory</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your store stock, selling prices, and restock alert levels
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products by name or category..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Package className="w-10 h-10 mx-auto mb-2 text-slate-400 opacity-60" />
            <p className="font-semibold text-slate-700">No products found</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm
                ? 'Try a different search term or clear the search.'
                : 'Click "+ Add New Product" above to add your first product to inventory.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Purchase Price</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-center">Stock Quantity</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => {
                  const isLowStock = product.quantity <= (product.minStock || 5);
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{product.name}</div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-xs text-slate-500">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200">
                          {product.category || 'General'}
                        </span>
                      </td>

                      {/* Purchase Price */}
                      <td className="py-3 px-4 text-right font-mono text-slate-600">
                        {formatRupees(product.purchasePrice)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {formatRupees(product.sellingPrice)}
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                        {product.quantity}
                        <span className="text-[10px] text-slate-400 block font-normal">
                          Min: {product.minStock}
                        </span>
                      </td>

                      {/* Status / Alert */}
                      <td className="py-3 px-4 text-center">
                        {product.quantity === 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                            Out of stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(product)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
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
                  placeholder="e.g. Type-C Fast Charger"
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:bg-white ${
                    formErrors.name ? 'border-rose-400 ring-1 ring-rose-300' : 'border-slate-200 focus:border-emerald-500'
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
                  placeholder="e.g. Cables, Grocery, Audio"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-emerald-500"
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
                    placeholder="e.g. 150"
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm font-mono focus:outline-none focus:bg-white ${
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
                    placeholder="e.g. 220"
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm font-mono focus:outline-none focus:bg-white ${
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
                    placeholder="e.g. 20"
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm font-mono focus:outline-none focus:bg-white ${
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
                    Low Stock Alert Level <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) =>
                      setFormData({ ...formData, minStock: e.target.value })
                    }
                    placeholder="e.g. 5"
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm font-mono focus:outline-none focus:bg-white ${
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
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-sm"
                >
                  {editingProduct ? 'Save Changes' : 'Add Product'}
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
