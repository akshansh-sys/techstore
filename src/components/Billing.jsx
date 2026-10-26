import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Search,
  IndianRupee,
  Banknote,
  QrCode,
  Info,
  X,
  Sparkles,
  User,
  Receipt,
  UploadCloud,
  Maximize2,
  Edit3,
  Check,
} from 'lucide-react';
import { formatRupees } from '../utils/formatters';

export default function Billing({
  products,
  customers = [],
  onCompleteSale,
  showToast,
}) {
  // Cart state: array of { productId, name, price, quantity, availableStock, total }
  const [cart, setCart] = useState([]);

  // Product Selection Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [productSearch, setProductSearch] = useState('');
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Bill Meta
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // 'Cash' | 'UPI'
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Store UPI QR Code State (Owner's Custom QR & UPI ID)
  const [storeQrImage, setStoreQrImage] = useState(() => localStorage.getItem('techstore_store_qr_code') || '');
  const [storeUpiId, setStoreUpiId] = useState(() => localStorage.getItem('techstore_store_upi_id') || '');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isQrConfigOpen, setIsQrConfigOpen] = useState(false);
  const [tempUpiId, setTempUpiId] = useState('');
  const qrFileInputRef = useRef(null);

  // Ref for handling clicks outside recommendation container
  const searchContainerRef = useRef(null);

  // Close recommendations on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowRecommendations(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Selected product object from inventory
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  // Filter recommendations based on search term
  const trimmedSearch = productSearch.trim().toLowerCase();
  const recommendedProducts = trimmedSearch
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmedSearch) ||
          (p.category && p.category.toLowerCase().includes(trimmedSearch))
      )
    : products.slice(0, 6); // Show top items when search is focused but empty

  // Products available for sale (stock > 0)
  const availableProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(trimmedSearch) ||
      (p.category && p.category.toLowerCase().includes(trimmedSearch));
    return matchesSearch;
  });

  // Calculate Cart Totals
  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // QR Code Source (Uploaded Image or Dynamic UPI QR Code)
  const dynamicUpiUrl = storeUpiId
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(
        `upi://pay?pa=${storeUpiId}&pn=TechStore&am=${cartTotal}&cu=INR`
      )}`
    : '';
  const activeQrSrc = storeQrImage || dynamicUpiUrl;

  // Handle QR image file upload
  const handleQrImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (PNG/JPG/WebP)', 'error');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      showToast('Image size should be under 3MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setStoreQrImage(base64);
      localStorage.setItem('techstore_store_qr_code', base64);
      showToast('Store QR code image uploaded successfully!', 'success');
      setIsQrConfigOpen(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle save custom UPI ID
  const handleSaveUpiId = (e) => {
    e.preventDefault();
    const cleanUpi = tempUpiId.trim();
    setStoreUpiId(cleanUpi);
    localStorage.setItem('techstore_store_upi_id', cleanUpi);
    setIsQrConfigOpen(false);
    showToast(cleanUpi ? `UPI ID set to: ${cleanUpi}` : 'UPI ID cleared', 'success');
  };

  // Remove QR Image
  const handleRemoveQrImage = () => {
    setStoreQrImage('');
    localStorage.removeItem('techstore_store_qr_code');
    showToast('Store QR code image removed', 'info');
  };

  // Select product from recommendation item
  const handleSelectRecommendation = (product) => {
    setSelectedProductId(product.id);
    setSelectedQuantity(1);
    setProductSearch(product.name);
    setShowRecommendations(false);
    setErrorMessage('');
  };

  // Quick 1-click Add to Cart directly from recommendation row
  const handleQuickAdd = (product, e) => {
    if (e) e.stopPropagation();
    setErrorMessage('');

    if (product.quantity <= 0) {
      setErrorMessage(`Cannot add "${product.name}". It is currently out of stock.`);
      return;
    }

    const existingIndex = cart.findIndex((i) => i.productId === product.id);
    const alreadyInCart = existingIndex >= 0 ? cart[existingIndex].quantity : 0;

    if (alreadyInCart + 1 > product.quantity) {
      setErrorMessage(
        `Cannot add more "${product.name}". Available stock is ${product.quantity} (${alreadyInCart} already in bill).`
      );
      return;
    }

    if (existingIndex >= 0) {
      const updatedCart = [...cart];
      const newQty = updatedCart[existingIndex].quantity + 1;
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        quantity: newQty,
        total: newQty * updatedCart[existingIndex].price,
      };
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: product.sellingPrice,
          quantity: 1,
          availableStock: product.quantity,
          total: product.sellingPrice,
        },
      ]);
    }

    setSelectedProductId(product.id);
    showToast(`Added 1x "${product.name}" to bill`, 'success');
  };

  // Add item to cart from quantity input
  const handleAddToCart = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedProduct) {
      setErrorMessage('Please select a product first.');
      return;
    }

    const qty = parseInt(selectedQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setErrorMessage('Please enter a valid quantity of 1 or more.');
      return;
    }

    const existingIndex = cart.findIndex((i) => i.productId === selectedProduct.id);
    const alreadyInCart = existingIndex >= 0 ? cart[existingIndex].quantity : 0;
    const requestedTotalQty = alreadyInCart + qty;

    if (requestedTotalQty > selectedProduct.quantity) {
      setErrorMessage(
        `Cannot add ${qty} more. Available stock is ${selectedProduct.quantity} (${alreadyInCart} already in cart).`
      );
      return;
    }

    if (existingIndex >= 0) {
      const updatedCart = [...cart];
      const newQty = updatedCart[existingIndex].quantity + qty;
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        quantity: newQty,
        total: newQty * updatedCart[existingIndex].price,
      };
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          productId: selectedProduct.id,
          name: selectedProduct.name,
          price: selectedProduct.sellingPrice,
          quantity: qty,
          availableStock: selectedProduct.quantity,
          total: qty * selectedProduct.sellingPrice,
        },
      ]);
    }

    setSelectedProductId('');
    setSelectedQuantity(1);
    setProductSearch('');
    setShowRecommendations(false);
  };

  // Change quantity of item directly in cart
  const handleUpdateCartQuantity = (productId, delta) => {
    setErrorMessage('');
    const updated = cart
      .map((item) => {
        if (item.productId === productId) {
          const productInStock = products.find((p) => p.id === productId);
          const maxStock = productInStock ? productInStock.quantity : item.availableStock;
          const newQty = item.quantity + delta;

          if (newQty <= 0) return null; // remove
          if (newQty > maxStock) {
            setErrorMessage(`Cannot exceed available stock (${maxStock}) for "${item.name}".`);
            return item;
          }

          return {
            ...item,
            quantity: newQty,
            total: newQty * item.price,
          };
        }
        return item;
      })
      .filter(Boolean);

    setCart(updated);
  };

  // Remove item from cart
  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter((item) => item.productId !== productId));
    setErrorMessage('');
  };

  // Clear entire cart
  const handleClearCart = () => {
    setCart([]);
    setErrorMessage('');
  };

  // Handle Complete Sale
  const handleCompleteSale = () => {
    if (cart.length === 0) {
      setErrorMessage('Your cart is empty. Add at least one product to generate a bill.');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const billData = {
        items: cart.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
        })),
        paymentMethod,
        customerName: customerName.trim() || 'Walk-in Customer',
      };

      const completedBill = onCompleteSale(billData);
      setCart([]);
      setCustomerName('');
      setPaymentMethod('Cash');
      showToast(`Bill #${completedBill.billNumber} created successfully!`, 'success');
    } catch (err) {
      setErrorMessage(err.message || 'Error completing sale. Please try again.');
      showToast(err.message || 'Sale failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#dfe7e0]">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#dfe7e0] uppercase">
              Billing Counter
            </h2>
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-red-950/50 text-red-300 border border-red-500/30">
              POS Ready
            </span>
          </div>
          <p className="text-sm text-[#78837c] font-mono mt-1">
            Search items with auto-recommendations, adjust quantities, and print thermal receipts
          </p>
        </div>

        <div className="text-sm text-[#78837c] font-mono bg-black/40 px-3.5 py-2 rounded-xl border border-white/10 shadow-inner self-start sm:self-auto">
          <span><strong className="text-[#dfe7e0]">{products.length}</strong> Items Available</span>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="flex items-start gap-3 p-4 bg-red-950/40 border border-red-500/40 text-red-200 rounded-xl text-sm animate-fade-in shadow-lg">
          <AlertCircle className="w-5 h-5 text-[#ff5a3c] shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="text-sm text-red-400 hover:text-red-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Selector & Recommendations */}
        <div className="lg:col-span-5 space-y-4">
          <div className="kage-card p-5 sm:p-6">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#dfe7e0] mb-3.5 flex items-center justify-between">
              <span>Find & Select Items</span>
              <span className="text-xs font-mono text-[#78837c]">
                Live Search
              </span>
            </h3>

            {/* Smart Search with Recommendations Dropdown */}
            <div className="relative mb-4" ref={searchContainerRef}>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1.5 font-semibold">
                Item Search & Live Recommendations
              </label>

              <div className="relative">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78837c]" />
                <input
                  type="text"
                  value={productSearch}
                  onFocus={() => setShowRecommendations(true)}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowRecommendations(true);
                  }}
                  placeholder="e.g. Earbuds, Charger, Basmati..."
                  className="w-full pl-11 pr-10 py-3 bg-black/50 border border-white/15 rounded-xl text-base text-[#dfe7e0] placeholder-[#78837c] focus:outline-none focus:border-[#e0231c] focus:ring-1 focus:ring-[#e0231c]/50 transition shadow-inner"
                />

                {productSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setProductSearch('');
                      setSelectedProductId('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78837c] hover:text-[#dfe7e0] p-1.5 rounded-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Recommendations Floating Popover */}
              {showRecommendations && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0a0e12]/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.95)] z-30 max-h-72 overflow-y-auto divide-y divide-white/5 animate-scale-up">
                  <div className="px-4 py-2.5 bg-black/60 text-xs font-mono uppercase tracking-wider text-[#78837c] flex justify-between items-center sticky top-0 border-b border-white/10 backdrop-blur-md">
                    <span className="flex items-center gap-1.5 text-red-300 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-[#e0231c]" />
                      {trimmedSearch ? 'Matching Recommendations' : 'Popular Items'}
                    </span>
                    <span className="text-xs text-[#78837c] font-normal">
                      Tap + to add 1 unit
                    </span>
                  </div>

                  {recommendedProducts.length === 0 ? (
                    <div className="p-6 text-center text-sm text-[#78837c] font-mono">
                      No items matching "{productSearch}"
                    </div>
                  ) : (
                    recommendedProducts.slice(0, 8).map((p) => {
                      const isOutOfStock = p.quantity <= 0;
                      const isLowStock = p.quantity <= p.minStock;
                      const isSelected = selectedProductId === p.id;

                      return (
                        <div
                          key={p.id}
                          onClick={() => handleSelectRecommendation(p)}
                          className={`p-3.5 flex items-center justify-between hover:bg-white/[0.04] transition cursor-pointer ${
                            isSelected ? 'bg-red-950/30 border-l-4 border-[#e0231c]' : ''
                          }`}
                        >
                          <div className="flex-1 pr-3 min-w-0">
                            <div className="font-bold text-sm sm:text-base text-[#dfe7e0] leading-snug truncate">
                              {p.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-mono text-[#78837c] px-2 py-0.5 bg-black/40 rounded border border-white/5">
                                {p.category || 'General'}
                              </span>
                              <span
                                className={`text-xs font-mono font-medium ${
                                  isOutOfStock
                                    ? 'text-red-400 font-bold'
                                    : isLowStock
                                    ? 'text-amber-300 font-semibold'
                                    : 'text-emerald-400 font-semibold'
                                }`}
                              >
                                {isOutOfStock
                                  ? 'Out of Stock'
                                  : isLowStock
                                  ? `${p.quantity} left (Low)`
                                  : `${p.quantity} in stock`}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-mono font-extrabold text-sm sm:text-base text-[#c9a24a]">
                              ₹{p.sellingPrice}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleQuickAdd(p, e)}
                              disabled={isOutOfStock}
                              title="Add 1 directly to cart"
                              className="px-3 py-1.5 text-xs font-mono font-bold btn-vermilion disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition flex items-center gap-1 active:scale-95"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Product Dropdown Selection (Fallback) */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1.5 font-semibold">
                  Or Pick Directly from Full Catalog
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    const prod = products.find((p) => p.id === e.target.value);
                    setSelectedProductId(e.target.value);
                    if (prod) setProductSearch(prod.name);
                    setSelectedQuantity(1);
                    setErrorMessage('');
                  }}
                  className="w-full px-4 py-3 bg-black/50 border border-white/15 rounded-xl text-sm sm:text-base text-[#dfe7e0] focus:outline-none focus:border-[#e0231c] shadow-inner"
                >
                  <option value="" className="bg-[#05070a] text-[#78837c]">-- Choose item from list --</option>
                  {availableProducts.map((p) => (
                    <option
                      key={p.id}
                      value={p.id}
                      disabled={p.quantity <= 0}
                      className="bg-[#05070a] text-[#dfe7e0]"
                    >
                      {p.name} — ₹{p.sellingPrice} ({p.quantity <= 0 ? 'OUT OF STOCK' : `${p.quantity} in stock`})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Product Preview Card */}
              {selectedProduct && (
                <div className="p-4 bg-black/50 border border-[#e0231c]/30 rounded-xl space-y-2 animate-fade-in shadow-inner">
                  <div className="flex justify-between items-baseline font-bold text-[#dfe7e0]">
                    <span className="text-sm sm:text-base truncate pr-2">{selectedProduct.name}</span>
                    <span className="text-[#c9a24a] font-mono text-base sm:text-lg font-extrabold shrink-0">
                      ₹{selectedProduct.sellingPrice}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#78837c] font-mono text-xs sm:text-sm">
                    <span>Available In Stock:</span>
                    <span
                      className={`font-bold font-mono ${
                        selectedProduct.quantity <= selectedProduct.minStock
                          ? 'text-amber-400'
                          : 'text-[#dfe7e0]'
                      }`}
                    >
                      {selectedProduct.quantity} units
                    </span>
                  </div>
                </div>
              )}

              {/* Quantity Input */}
              <div className="grid grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1.5 font-semibold">
                    Custom Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct ? selectedProduct.quantity : 999}
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(e.target.value)}
                    disabled={!selectedProduct || selectedProduct.quantity <= 0}
                    className="w-full px-4 py-2.5 bg-black/50 border border-white/15 rounded-xl text-base font-mono text-[#dfe7e0] focus:outline-none focus:border-[#e0231c] disabled:opacity-40"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!selectedProduct || selectedProduct.quantity <= 0}
                  className="w-full py-3 px-4 btn-vermilion disabled:opacity-40 disabled:cursor-not-allowed font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Bill</span>
                </button>
              </div>
            </div>
          </div>

          {/* Customer & Payment Options Card */}
          <div className="kage-card p-5 sm:p-6 space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#dfe7e0]">
              Customer & Payment Mode
            </h3>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1.5 font-semibold">
                Customer Name (Optional)
              </label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78837c]" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Walk-in Customer"
                  className="w-full pl-11 pr-3.5 py-3 bg-black/50 border border-white/15 rounded-xl text-base text-[#dfe7e0] placeholder-[#78837c] focus:outline-none focus:border-[#e0231c]"
                />
              </div>

              {customers.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span className="text-xs text-[#78837c] font-mono">Frequent:</span>
                  {customers.slice(0, 3).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCustomerName(c.name)}
                      className="text-xs font-mono px-2.5 py-1 bg-white/[0.04] hover:bg-white/[0.08] text-[#aab4ad] hover:text-[#dfe7e0] rounded-lg border border-white/10 transition"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Mode Selector */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1.5 font-semibold">
                Payment Method <span className="text-[#e0231c]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash')}
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-sm font-mono uppercase tracking-wider transition-all duration-150 ${
                    paymentMethod === 'Cash'
                      ? 'bg-[#e0231c]/25 border-[#e0231c] text-white shadow-[0_0_15px_rgba(224,35,28,0.2)] font-bold'
                      : 'bg-black/40 border-white/10 text-[#78837c] hover:text-[#dfe7e0]'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-[#c9a24a]" />
                  <span>Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border text-sm font-mono uppercase tracking-wider transition-all duration-150 ${
                    paymentMethod === 'UPI'
                      ? 'bg-blue-950/40 border-blue-500 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.2)] font-bold'
                      : 'bg-black/40 border-white/10 text-[#78837c] hover:text-[#dfe7e0]'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-blue-400" />
                  <span>UPI / QR</span>
                </button>
              </div>

              {/* Store UPI QR Code Section */}
              {paymentMethod === 'UPI' && (
                <div className="mt-3 p-4 bg-gradient-to-b from-[#0a0e14] to-black/80 border border-blue-500/30 rounded-2xl space-y-3.5 shadow-xl animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-blue-950/60 text-blue-400 border border-blue-500/30">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-blue-200">
                          Store Payment QR
                        </h4>
                        <p className="text-[10px] text-[#78837c] font-mono">
                          Customer scans to pay ₹{cartTotal}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {activeQrSrc && (
                        <button
                          type="button"
                          onClick={() => setIsQrModalOpen(true)}
                          className="px-2 py-1 text-xs text-blue-300 hover:text-white bg-blue-950/60 hover:bg-blue-900/60 rounded-lg border border-blue-500/30 transition active:scale-95 flex items-center gap-1 font-mono font-semibold"
                          title="Enlarge QR for customer"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline text-[11px]">Enlarge</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setTempUpiId(storeUpiId);
                          setIsQrConfigOpen(true);
                        }}
                        className="px-2.5 py-1 text-xs font-mono font-bold text-[#aab4ad] hover:text-[#dfe7e0] bg-white/[0.05] hover:bg-white/[0.1] rounded-lg border border-white/10 transition active:scale-95 flex items-center gap-1"
                        title="Upload or Change QR Code"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#c9a24a]" />
                        <span>{activeQrSrc ? 'Edit QR' : 'Upload QR'}</span>
                      </button>
                    </div>
                  </div>

                  {activeQrSrc ? (
                    <div className="flex flex-col items-center justify-center p-3.5 bg-white rounded-xl shadow-lg border border-white/20">
                      <img
                        src={activeQrSrc}
                        alt="Store UPI QR"
                        onClick={() => setIsQrModalOpen(true)}
                        className="w-44 h-44 object-contain rounded-lg cursor-pointer hover:scale-[1.02] transition-transform"
                        title="Click to view large for customer"
                      />
                      <div className="mt-2 text-center text-slate-900">
                        <div className="text-base font-black font-mono tracking-tight text-slate-900">
                          ₹{cartTotal}
                        </div>
                        {storeUpiId && (
                          <div className="text-xs font-mono font-bold text-slate-700">
                            UPI: {storeUpiId}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                          Scan with PhonePe • Google Pay • Paytm • BHIM
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setTempUpiId(storeUpiId);
                        setIsQrConfigOpen(true);
                      }}
                      className="border-2 border-dashed border-white/20 hover:border-blue-400/50 bg-black/40 hover:bg-blue-950/20 p-5 rounded-xl text-center cursor-pointer transition-all duration-200 group"
                    >
                      <UploadCloud className="w-8 h-8 mx-auto text-[#c9a24a] group-hover:scale-110 transition-transform mb-2 opacity-80" />
                      <p className="text-xs font-bold text-[#dfe7e0]">Upload Store QR Code</p>
                      <p className="text-[11px] text-[#78837c] mt-1 max-w-xs mx-auto">
                        Upload your PhonePe / Paytm / GPay QR image so customers can scan and pay directly on screen.
                      </p>
                      <span className="inline-flex items-center gap-1 mt-2.5 px-3 py-1 bg-blue-950/60 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-mono font-bold">
                        + Set Up QR Code
                      </span>
                    </div>
                  )}

                  <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 text-[11px] text-[#aab4ad] flex items-center justify-between">
                    <span>Soundbox verification:</span>
                    <span className="text-emerald-400 font-mono font-bold">Confirm alert before bill</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Bill / Cart Summary */}
        <div className="lg:col-span-7 space-y-4">
          <div className="kage-card p-5 sm:p-6 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-white/[0.05] text-[#c9a24a]">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wider text-[#dfe7e0]">
                  Active Cart Ledger
                </h3>
                <span className="text-xs sm:text-sm bg-black/40 text-amber-300 border border-amber-600/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-xs sm:text-sm text-red-400 hover:text-red-300 font-mono font-semibold transition"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto max-h-[360px]">
              {cart.length === 0 ? (
                <div className="py-20 text-center text-[#78837c]">
                  <ShoppingCart className="w-14 h-14 mx-auto mb-3 opacity-30 text-[#dfe7e0]" />
                  <p className="font-bold text-base text-[#dfe7e0]">Cart is Empty</p>
                  <p className="text-sm text-[#78837c] mt-1.5 max-w-xs mx-auto">
                    Type an item name on the left or tap "+ Add" on recommendations to begin compiling the bill.
                  </p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-[#78837c] border-b border-white/10 text-xs font-mono uppercase tracking-[0.15em]">
                    <tr>
                      <th className="text-left pb-3 font-bold">Product</th>
                      <th className="text-center pb-3 font-bold">Rate</th>
                      <th className="text-center pb-3 font-bold">Qty</th>
                      <th className="text-right pb-3 font-bold">Total</th>
                      <th className="pb-3 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {cart.map((item) => (
                      <tr key={item.productId} className="hover:bg-white/[0.03] transition-colors">
                        {/* Name */}
                        <td className="py-3.5 font-bold text-sm sm:text-base text-[#dfe7e0] max-w-[180px] truncate">
                          {item.name}
                        </td>

                        {/* Rate */}
                        <td className="py-3.5 text-center font-mono font-semibold text-sm sm:text-base text-[#aab4ad]">
                          ₹{item.price}
                        </td>

                        {/* Quantity Controls */}
                        <td className="py-3.5 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-black/50 p-1 rounded-lg border border-white/10">
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQuantity(item.productId, -1)}
                              className="w-7 h-7 flex items-center justify-center font-bold text-sm text-[#aab4ad] hover:text-white hover:bg-white/[0.1] rounded transition active:scale-95"
                              title="Decrease"
                            >
                              -
                            </button>
                            <span className="w-7 text-center font-bold font-mono text-sm sm:text-base text-[#dfe7e0]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQuantity(item.productId, 1)}
                              className="w-7 h-7 flex items-center justify-center font-bold text-sm text-[#aab4ad] hover:text-white hover:bg-white/[0.1] rounded transition active:scale-95"
                              title="Increase"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Item Total */}
                        <td className="py-3.5 text-right font-extrabold text-[#c9a24a] font-mono text-base sm:text-lg">
                          {formatRupees(item.total)}
                        </td>

                        {/* Remove */}
                        <td className="py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(item.productId)}
                            className="p-1.5 text-[#78837c] hover:text-red-400 rounded-lg transition"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Cart Bill Summary & Final Checkout */}
            <div className="mt-auto pt-4 border-t border-white/10 space-y-3.5">
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between text-[#aab4ad]">
                  <span>Customer:</span>
                  <span className="font-bold text-[#dfe7e0]">
                    {customerName.trim() || 'Walk-in Customer'}
                  </span>
                </div>
                <div className="flex justify-between text-[#aab4ad]">
                  <span>Payment Mode:</span>
                  <span className="font-extrabold text-[#c9a24a]">{paymentMethod}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2.5 border-t border-white/10">
                  <span className="text-sm sm:text-base uppercase tracking-wider text-[#dfe7e0] font-bold">Grand Total:</span>
                  <span className="text-3xl sm:text-4xl font-black text-[#c9a24a] font-mono">
                    {formatRupees(cartTotal)}
                  </span>
                </div>
              </div>

              {/* Complete Sale Button */}
              <button
                type="button"
                onClick={handleCompleteSale}
                disabled={cart.length === 0 || isSubmitting}
                className="w-full py-4 px-4 btn-vermilion disabled:opacity-40 disabled:cursor-not-allowed font-black text-sm sm:text-base uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 active:scale-95 shadow-lg"
              >
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>{isSubmitting ? 'Recording Bill...' : 'Complete Sale & Print Bill'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal 1: Customer View Enlarge QR Modal */}
      {isQrModalOpen && activeQrSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0a0e14] border border-blue-500/40 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-scale-up text-center">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-400" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-[#dfe7e0]">
                  Scan to Pay
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="p-1.5 text-[#78837c] hover:text-[#dfe7e0] rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-xl flex flex-col items-center">
              <img
                src={activeQrSrc}
                alt="Store UPI QR Code"
                className="w-64 h-64 object-contain rounded-lg"
              />
              <div className="mt-3 text-center">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500 block">Total Amount</span>
                <span className="text-3xl font-black font-mono text-slate-900">{formatRupees(cartTotal)}</span>
                {storeUpiId && (
                  <p className="text-xs font-mono font-bold text-slate-700 mt-1">UPI: {storeUpiId}</p>
                )}
              </div>
            </div>

            <p className="text-xs text-[#aab4ad] leading-relaxed">
              Customer can scan with <strong>PhonePe, Google Pay, Paytm</strong>, or any UPI app to complete the transaction.
            </p>

            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              className="w-full py-3 btn-vermilion rounded-xl text-xs font-bold uppercase tracking-wider transition active:scale-95"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}

      {/* Modal 2: Store Owner QR Code Configuration Modal */}
      {isQrConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0a0e14] border border-white/15 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#c9a24a]" />
                <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wider text-[#dfe7e0]">
                  Configure Store QR Code
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsQrConfigOpen(false)}
                className="p-1.5 text-[#78837c] hover:text-[#dfe7e0] rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={qrFileInputRef}
              onChange={handleQrImageUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Option 1: Upload QR Image */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] font-semibold">
                1. Upload Store QR Code Image
              </label>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => qrFileInputRef.current?.click()}
                  className="flex-1 py-3 px-4 btn-secondary text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
                >
                  <UploadCloud className="w-4 h-4 text-[#c9a24a]" />
                  <span>{storeQrImage ? 'Replace QR Image' : 'Select QR Image File'}</span>
                </button>
                {storeQrImage && (
                  <button
                    type="button"
                    onClick={handleRemoveQrImage}
                    className="p-3 bg-red-950/40 hover:bg-red-950/70 text-red-300 border border-red-500/30 rounded-xl transition"
                    title="Remove uploaded image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#78837c] font-mono">
                Upload screenshot or photo of your official PhonePe, Paytm, or GPay QR stand.
              </p>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-3 text-[10px] font-mono text-[#78837c] uppercase">Or enter UPI ID</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Option 2: Enter UPI ID */}
            <form onSubmit={handleSaveUpiId} className="space-y-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1.5 font-semibold">
                  2. Store UPI ID / VPA
                </label>
                <input
                  type="text"
                  value={tempUpiId}
                  onChange={(e) => setTempUpiId(e.target.value)}
                  placeholder="e.g. 9828012345@paytm or store@okhdfcbank"
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-white/15 rounded-xl text-sm font-mono text-[#dfe7e0] focus:outline-none focus:border-[#e0231c]"
                />
              </div>

              {/* Preview if active */}
              {activeQrSrc && (
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                  <img src={activeQrSrc} alt="Preview" className="w-14 h-14 bg-white p-1 rounded-lg object-contain shrink-0" />
                  <div className="text-xs">
                    <span className="text-emerald-400 font-bold block font-mono">QR Code Ready</span>
                    <span className="text-[#aab4ad] text-[11px]">Customers can scan and pay right on screen.</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsQrConfigOpen(false)}
                  className="flex-1 py-2.5 px-3 bg-white/[0.04] hover:bg-white/[0.08] text-[#aab4ad] text-xs font-mono font-semibold rounded-xl border border-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 btn-vermilion text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
