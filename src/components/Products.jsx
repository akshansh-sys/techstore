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
  UploadCloud,
  FileText,
  Download,
  Copy,
  Check,
  FileUp,
} from 'lucide-react';
import { formatRupees } from '../utils/formatters';
import ConfirmModal from './ConfirmModal';

const sampleProductsCSV = `Product Name, Category, Purchase Price, Selling Price, Quantity, Min Stock
USB-C Fast Cable 65W, Accessories, 90, 249, 45, 10
Wireless Optical Mouse, Accessories, 280, 599, 30, 5
Mechanical Gaming Keyboard, Peripherals, 850, 1699, 15, 3
SuperBass Bluetooth Speaker, Audio, 550, 1199, 20, 5
Fast Wall Charger 65W GaN, Chargers, 400, 899, 25, 5
Tempered Glass Protector, Mobile, 25, 149, 100, 20`;

function parseProductList(text) {
  if (!text || !text.trim()) return [];
  const trimmed = text.trim();

  // 1. JSON Array support
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item, index) => {
          const name = String(item.name || item.title || item.product || item.itemName || '').trim();
          const category = String(item.category || item.group || 'General').trim();
          const purchasePrice = parseFloat(item.purchasePrice || item.costPrice || item.buyPrice || 0) || 0;
          const sellingPrice = parseFloat(item.sellingPrice || item.price || item.sellPrice || item.rate || 0) || 0;
          const quantity = parseInt(item.quantity || item.stock || item.qty || 10, 10) || 0;
          const minStock = parseInt(item.minStock || item.min || 5, 10) || 5;
          const isValid = Boolean(name && sellingPrice >= 0 && purchasePrice >= 0);

          return {
            id: `row-${index}`,
            name,
            category: category || 'General',
            purchasePrice: Math.max(0, purchasePrice),
            sellingPrice: Math.max(0, sellingPrice),
            quantity: Math.max(0, quantity),
            minStock: Math.max(0, minStock),
            isValid,
            error: !name ? 'Missing name' : (sellingPrice < 0 ? 'Negative price' : null),
          };
        });
      }
    } catch {
      // fallback to line parsing
    }
  }

  // 2. CSV / TSV line-by-line support
  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const results = [];
  let startIndex = 0;

  // Header detection
  const firstLineLower = lines[0].toLowerCase();
  if (
    firstLineLower.includes('name') ||
    firstLineLower.includes('item') ||
    firstLineLower.includes('product') ||
    firstLineLower.includes('price') ||
    firstLineLower.includes('category')
  ) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    let parts;
    if (line.includes('\t')) {
      parts = line.split('\t').map((s) => s.trim().replace(/^["']|["']$/g, ''));
    } else if (line.includes(';')) {
      parts = line.split(';').map((s) => s.trim().replace(/^["']|["']$/g, ''));
    } else {
      parts = line.split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''));
    }

    if (parts.length === 0 || (parts.length === 1 && !parts[0])) continue;

    let name = '';
    let category = 'General';
    let purchasePrice = 0;
    let sellingPrice = 0;
    let quantity = 10;
    let minStock = 5;

    if (parts.length >= 6) {
      name = parts[0];
      category = parts[1] || 'General';
      purchasePrice = parseFloat(parts[2]) || 0;
      sellingPrice = parseFloat(parts[3]) || 0;
      quantity = parseInt(parts[4], 10) || 0;
      minStock = parseInt(parts[5], 10) || 5;
    } else if (parts.length === 5) {
      name = parts[0];
      category = parts[1] || 'General';
      purchasePrice = parseFloat(parts[2]) || 0;
      sellingPrice = parseFloat(parts[3]) || 0;
      quantity = parseInt(parts[4], 10) || 0;
    } else if (parts.length === 4) {
      if (!isNaN(parseFloat(parts[1]))) {
        name = parts[0];
        purchasePrice = parseFloat(parts[1]) || 0;
        sellingPrice = parseFloat(parts[2]) || 0;
        quantity = parseInt(parts[3], 10) || 0;
      } else {
        name = parts[0];
        category = parts[1] || 'General';
        sellingPrice = parseFloat(parts[2]) || 0;
        quantity = parseInt(parts[3], 10) || 0;
      }
    } else if (parts.length === 3) {
      name = parts[0];
      sellingPrice = parseFloat(parts[1]) || 0;
      quantity = parseInt(parts[2], 10) || 0;
    } else if (parts.length === 2) {
      name = parts[0];
      sellingPrice = parseFloat(parts[1]) || 0;
    } else if (parts.length === 1) {
      name = parts[0];
    }

    const isValid = Boolean(name && name.trim().length > 0 && sellingPrice >= 0);
    results.push({
      id: `row-${i}`,
      name: name.trim(),
      category: (category || 'General').trim(),
      purchasePrice: Math.max(0, purchasePrice),
      sellingPrice: Math.max(0, sellingPrice),
      quantity: Math.max(0, quantity),
      minStock: Math.max(0, minStock),
      isValid,
      error: !name ? 'Missing name' : null,
    });
  }

  return results;
}

export default function Products({
  products,
  onSaveProduct,
  onBulkSaveProducts,
  onDeleteProduct,
  showToast,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  // Bulk Import state
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkActiveTab, setBulkActiveTab] = useState('paste'); // 'paste' | 'file'
  const [bulkInputText, setBulkInputText] = useState('');
  const [bulkFileName, setBulkFileName] = useState('');
  const [parsedProducts, setParsedProducts] = useState([]);
  const [hasCopiedSample, setHasCopiedSample] = useState(false);

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

  // Bulk Import Handlers
  const handleOpenBulkModal = () => {
    setIsBulkModalOpen(true);
    setBulkActiveTab('paste');
    setBulkInputText('');
    setBulkFileName('');
    setParsedProducts([]);
    setHasCopiedSample(false);
  };

  const handleBulkTextChange = (text) => {
    setBulkInputText(text);
    const parsed = parseProductList(text);
    setParsedProducts(parsed);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setBulkInputText(content);
        const parsed = parseProductList(content);
        setParsedProducts(parsed);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const blob = new Blob([sampleProductsCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'techstore_products_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded sample products CSV template!', 'info');
  };

  const handleCopySample = () => {
    navigator.clipboard.writeText(sampleProductsCSV);
    setHasCopiedSample(true);
    showToast('Sample template copied to clipboard!', 'info');
    setTimeout(() => setHasCopiedSample(false), 2500);
  };

  const handleExecuteBulkImport = () => {
    const validItems = parsedProducts.filter((p) => p.isValid);
    if (validItems.length === 0) {
      showToast('No valid products to import. Please check your data.', 'error');
      return;
    }

    try {
      if (onBulkSaveProducts) {
        onBulkSaveProducts(validItems);
      } else {
        validItems.forEach((item) => onSaveProduct(item));
      }

      showToast(`Successfully imported ${validItems.length} products!`, 'success');
      setIsBulkModalOpen(false);
      setBulkInputText('');
      setParsedProducts([]);
    } catch (err) {
      showToast(err.message || 'Error importing products', 'error');
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
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#dfe7e0] uppercase">
              Products
            </h2>
            <span className="text-xs sm:text-sm font-mono font-bold bg-white/[0.06] text-[#dfe7e0] px-3 py-0.5 rounded-full border border-white/10">
              {products.length}
            </span>
          </div>
          <p className="text-sm text-[#78837c] font-mono mt-1">
            Manage stock inventory, selling prices & profit margins
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleOpenBulkModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 btn-secondary font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-md active:scale-95 shrink-0"
            title="Upload CSV / JSON or paste a list of products"
          >
            <UploadCloud className="w-4 h-4 text-[#c9a24a]" />
            <span>Bulk Upload</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 btn-vermilion font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Item</span>
          </button>
        </div>
      </div>

      {/* Stock Health Summary Badges */}
      <div className="grid grid-cols-3 gap-3 p-4 kage-card text-xs">
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] shrink-0"></div>
          <div>
            <span className="text-[#78837c] text-xs font-mono uppercase tracking-wider block font-semibold">In Stock</span>
            <span className="font-extrabold font-mono text-emerald-300 text-lg sm:text-xl">{inStockCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5a3c] shadow-[0_0_8px_#ff5a3c] shrink-0"></div>
          <div>
            <span className="text-[#78837c] text-xs font-mono uppercase tracking-wider block font-semibold">Low Stock</span>
            <span className="font-extrabold font-mono text-amber-300 text-lg sm:text-xl">{lowStockCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#e0231c] shadow-[0_0_8px_#e0231c] shrink-0"></div>
          <div>
            <span className="text-[#78837c] text-xs font-mono uppercase tracking-wider block font-semibold">Out of Stock</span>
            <span className="font-extrabold font-mono text-red-400 text-lg sm:text-xl">{outOfStockCount}</span>
          </div>
        </div>
      </div>

      {/* Search Bar & Category Filter Pills */}
      <div className="space-y-3.5">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78837c]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by title or category..."
            className="w-full pl-11 pr-10 py-3 bg-black/50 border border-white/10 rounded-xl text-base text-[#dfe7e0] placeholder-[#78837c] focus:outline-none focus:border-[#e0231c] focus:ring-1 focus:ring-[#e0231c]/50 transition shadow-inner"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#78837c] hover:text-[#dfe7e0] p-1.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills Slider */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono whitespace-nowrap transition-all duration-150 shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#e0231c] text-white border border-[#ff5a3c]/30 shadow-md shadow-red-950/40 font-bold'
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
            <Package className="w-14 h-14 mx-auto mb-3 opacity-30 text-[#dfe7e0]" />
            <p className="font-bold text-base text-[#dfe7e0]">No products match your search</p>
            <p className="text-sm text-[#78837c] mt-1.5 max-w-sm mx-auto">
              {searchTerm
                ? 'Try a different keyword or reset category filter.'
                : 'Click "+ Add New Item" above to register items to your inventory.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/50 border-b border-white/10 text-xs font-mono uppercase tracking-[0.15em] text-[#78837c]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Item Name</th>
                  <th className="py-3.5 px-4 font-bold">Category</th>
                  <th className="py-3.5 px-4 text-right font-bold">Purchase Rate</th>
                  <th className="py-3.5 px-4 text-right font-bold">Selling Price</th>
                  <th className="py-3.5 px-4 text-right font-bold">Gross Margin</th>
                  <th className="py-3.5 px-4 text-center font-bold">Available Stock</th>
                  <th className="py-3.5 px-4 text-center font-bold">Status</th>
                  <th className="py-3.5 px-4 text-right font-bold">Actions</th>
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
                        <div className="font-bold text-sm sm:text-base text-[#dfe7e0] leading-snug">
                          {product.name}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 bg-black/40 text-[#aab4ad] font-mono text-xs rounded border border-white/5">
                          {product.category || 'General'}
                        </span>
                      </td>

                      {/* Purchase Price */}
                      <td className="py-3.5 px-4 text-right font-mono text-xs sm:text-sm text-[#78837c]">
                        {formatRupees(product.purchasePrice)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3.5 px-4 text-right font-mono font-extrabold text-sm sm:text-base text-[#c9a24a]">
                        {formatRupees(product.sellingPrice)}
                      </td>

                      {/* Gross Margin */}
                      <td className="py-3.5 px-4 text-right font-mono text-xs sm:text-sm font-bold">
                        <span className={margin >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {margin >= 0 ? `+${formatRupees(margin)}` : formatRupees(margin)}
                        </span>
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-[#dfe7e0]">
                        <span className="text-base">{product.quantity}</span>
                        <span className="text-xs text-[#78837c] block font-normal font-mono">
                          Min: {product.minStock}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-red-950/60 text-red-300 border border-red-500/30 font-bold">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30 font-bold">
                            <AlertTriangle className="w-3.5 h-3.5 text-[#ff5a3c]" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 font-bold">
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(product)}
                            className="p-2 text-[#78837c] hover:text-[#dfe7e0] hover:bg-white/[0.08] rounded-lg transition"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(product)}
                            className="p-2 text-[#78837c] hover:text-red-400 hover:bg-red-950/30 rounded-lg transition"
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

      {/* Bulk Product Upload Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="bg-[#0a0e12] rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-[0_10px_40px_rgba(0,0,0,0.9)] border border-white/15 my-4 sm:my-8 max-h-[92vh] overflow-y-auto animate-scale-up space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-950/40 text-[#c9a24a] border border-amber-600/30">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-[#dfe7e0] uppercase tracking-wide">
                    Bulk Product Import
                  </h3>
                  <p className="text-[11px] text-[#78837c] font-mono mt-0.5">
                    Directly upload or paste a list of items to add to inventory
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="p-1.5 text-[#78837c] hover:text-[#dfe7e0] hover:bg-white/[0.08] rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Format Helpers */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[11px] font-semibold text-[#dfe7e0] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#c9a24a]" />
                  Accepted Format (CSV / Excel / JSON)
                </span>
                <span className="text-[10px] text-[#78837c] font-mono block">
                  Name, Category, Purchase Price, Selling Price, Quantity, Min Stock
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopySample}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-mono text-[#dfe7e0] border border-white/10 transition active:scale-95"
                  title="Copy sample data to clipboard"
                >
                  {hasCopiedSample ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#78837c]" />
                      <span>Copy Format</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[11px] font-mono text-[#dfe7e0] border border-white/10 transition active:scale-95"
                  title="Download .csv template"
                >
                  <Download className="w-3.5 h-3.5 text-[#c9a24a]" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>

            {/* Input Method Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <button
                type="button"
                onClick={() => setBulkActiveTab('paste')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  bulkActiveTab === 'paste'
                    ? 'bg-[#e0231c] text-white font-bold shadow-md shadow-red-950/50'
                    : 'text-[#78837c] hover:text-[#dfe7e0] hover:bg-white/[0.04]'
                }`}
              >
                Paste Product List
              </button>
              <button
                type="button"
                onClick={() => setBulkActiveTab('file')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  bulkActiveTab === 'file'
                    ? 'bg-[#e0231c] text-white font-bold shadow-md shadow-red-950/50'
                    : 'text-[#78837c] hover:text-[#dfe7e0] hover:bg-white/[0.04]'
                }`}
              >
                Upload File (.csv / .json)
              </button>
            </div>

            {/* Tab 1: Paste Input */}
            {bulkActiveTab === 'paste' && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#aab4ad]">
                  Paste Product Rows (One per line)
                </label>
                <textarea
                  rows={6}
                  value={bulkInputText}
                  onChange={(e) => handleBulkTextChange(e.target.value)}
                  placeholder={`USB-C Fast Cable, Accessories, 90, 249, 45, 10\nWireless Mouse, Accessories, 280, 599, 30, 5\nMechanical Keyboard, Peripherals, 850, 1699, 15, 3`}
                  className="w-full p-3 bg-black/60 border border-white/15 rounded-xl text-xs font-mono text-[#dfe7e0] placeholder-[#5a645e] focus:outline-none focus:border-[#e0231c] focus:ring-1 focus:ring-[#e0231c]/50 transition leading-relaxed"
                />
              </div>
            )}

            {/* Tab 2: File Upload */}
            {bulkActiveTab === 'file' && (
              <div className="space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#aab4ad]">
                  Select CSV or JSON file from your computer
                </label>
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 hover:border-[#e0231c]/60 rounded-xl cursor-pointer bg-black/40 hover:bg-white/[0.02] transition-colors group">
                  <FileUp className="w-8 h-8 text-[#78837c] group-hover:text-[#c9a24a] transition-colors mb-2" />
                  <span className="text-xs font-semibold text-[#dfe7e0]">
                    {bulkFileName ? bulkFileName : 'Click or Drag file to upload'}
                  </span>
                  <span className="text-[10px] text-[#78837c] font-mono mt-1">
                    Supports .csv, .json, or .txt
                  </span>
                  <input
                    type="file"
                    accept=".csv, .json, .txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Live Parsing Preview Section */}
            {parsedProducts.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#78837c]">
                      Parsed Preview:
                    </span>
                    <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-600/30">
                      {parsedProducts.filter((p) => p.isValid).length} Ready to Import
                    </span>
                    {parsedProducts.filter((p) => !p.isValid).length > 0 && (
                      <span className="text-[11px] font-mono font-bold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-600/30">
                        {parsedProducts.filter((p) => !p.isValid).length} Incomplete
                      </span>
                    )}
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto overflow-x-auto rounded-xl border border-white/10 bg-black/50">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead className="bg-black/60 border-b border-white/10 text-[9px] font-mono uppercase tracking-wider text-[#78837c] sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Item Name</th>
                        <th className="py-2 px-3">Category</th>
                        <th className="py-2 px-3 text-right">Buy Rate</th>
                        <th className="py-2 px-3 text-right">Sell Price</th>
                        <th className="py-2 px-3 text-center">Stock</th>
                        <th className="py-2 px-3 text-right">Margin</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                      {parsedProducts.map((item, idx) => {
                        const margin = item.sellingPrice - item.purchasePrice;
                        return (
                          <tr
                            key={item.id || idx}
                            className={item.isValid ? 'hover:bg-white/[0.02]' : 'bg-rose-950/20'}
                          >
                            <td className="py-2 px-3 font-medium text-[#dfe7e0]">
                              {item.name || <span className="text-rose-400 italic">Empty Name</span>}
                            </td>
                            <td className="py-2 px-3 text-[#aab4ad]">
                              {item.category}
                            </td>
                            <td className="py-2 px-3 text-right text-[#78837c]">
                              {formatRupees(item.purchasePrice)}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-[#c9a24a]">
                              {formatRupees(item.sellingPrice)}
                            </td>
                            <td className="py-2 px-3 text-center text-[#dfe7e0]">
                              {item.quantity}
                            </td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-400">
                              +{formatRupees(margin)}
                            </td>
                            <td className="py-2 px-3 text-center">
                              {item.isValid ? (
                                <span className="text-[9px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                  Valid
                                </span>
                              ) : (
                                <span className="text-[9px] text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-500/30">
                                  {item.error || 'Error'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2.5 text-xs font-mono text-[#aab4ad] hover:text-[#dfe7e0] bg-white/[0.04] hover:bg-white/[0.08] rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkImport}
                disabled={parsedProducts.filter((p) => p.isValid).length === 0}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white btn-vermilion rounded-xl shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <UploadCloud className="w-4 h-4" />
                <span>
                  Import {parsedProducts.filter((p) => p.isValid).length} Products
                </span>
              </button>
            </div>
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
