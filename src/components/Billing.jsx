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
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#dfe7e0] uppercase">
              Billing Counter
            </h2>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-950/50 text-red-300 border border-red-500/30">
              POS Ready
            </span>
          </div>
          <p className="text-xs text-[#78837c] font-mono mt-1">
            Search items with auto-recommendations, adjust quantities, and print thermal receipts
          </p>
        </div>

        <div className="text-xs text-[#78837c] font-mono bg-black/40 px-3 py-1.5 rounded-xl border border-white/10 shadow-inner self-start sm:self-auto">
          <span>{products.length} Items Available</span>
        </div>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="flex items-start gap-3 p-3.5 bg-red-950/40 border border-red-500/40 text-red-200 rounded-xl text-xs sm:text-sm animate-fade-in shadow-lg">
          <AlertCircle className="w-5 h-5 text-[#ff5a3c] shrink-0 mt-0.5" />
          <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="text-xs text-red-400 hover:text-red-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Selector & Recommendations */}
        <div className="lg:col-span-5 space-y-4">
          <div className="kage-card p-5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#dfe7e0] mb-3 flex items-center justify-between">
              <span>Find & Select Items</span>
              <span className="text-[10px] font-mono text-[#78837c]">
                Live Search
              </span>
            </h3>

            {/* Smart Search with Recommendations Dropdown */}
            <div className="relative mb-3.5" ref={searchContainerRef}>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#aab4ad] mb-1.5">
                Item Search & Live Recommendations
              </label>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78837c]" />
                <input
                  type="text"
                  value={productSearch}
                  onFocus={() => setShowRecommendations(true)}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowRecommendations(true);
                  }}
                  placeholder="e.g. Earbuds, Charger, Basmati..."
                  className="w-full pl-10 pr-9 py-2.5 bg-black/50 border border-white/15 rounded-xl text-sm text-[#dfe7e0] placeholder-[#78837c] focus:outline-none focus:border-[#e0231c] focus:ring-1 focus:ring-[#e0231c]/50 transition shadow-inner"
                />

                {productSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setProductSearch('');
                      setSelectedProductId('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78837c] hover:text-[#dfe7e0] p-1 rounded-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Recommendations Floating Popover */}
              {showRecommendations && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0a0e12]/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.95)] z-30 max-h-72 overflow-y-auto divide-y divide-white/5 animate-scale-up">
                  <div className="px-3.5 py-2 bg-black/60 text-[9px] font-mono uppercase tracking-widest text-[#78837c] flex justify-between items-center sticky top-0 border-b border-white/10 backdrop-blur-md">
                    <span className="flex items-center gap-1.5 text-red-300">
                      <Sparkles className="w-3 h-3 text-[#e0231c]" />
                      {trimmedSearch ? 'Matching Recommendations' : 'Popular Items'}
                    </span>
                    <span className="text-[9px] text-[#78837c] font-normal">
                      Tap + to add 1 unit
                    </span>
                  </div>

                  {recommendedProducts.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#78837c] font-mono">
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
                          className={`p-3 flex items-center justify-between hover:bg-white/[0.04] transition cursor-pointer ${
                            isSelected ? 'bg-red-950/30 border-l-4 border-[#e0231c]' : ''
                          }`}
                        >
                          <div className="flex-1 pr-3 min-w-0">
                            <div className="font-bold text-xs text-[#dfe7e0] leading-tight truncate">
                              {p.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] font-mono text-[#78837c] px-1.5 py-0.2 bg-black/40 rounded border border-white/5">
                                {p.category || 'General'}
                              </span>
                              <span
                                className={`text-[10px] font-mono ${
                                  isOutOfStock
                                    ? 'text-red-400 font-bold'
                                    : isLowStock
                                    ? 'text-amber-300'
                                    : 'text-emerald-400'
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

                          <div className="flex items-center gap-2.5 shrink-0">
                            <span className="font-mono font-bold text-xs sm:text-sm text-[#c9a24a]">
                              ₹{p.sellingPrice}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleQuickAdd(p, e)}
                              disabled={isOutOfStock}
                              title="Add 1 directly to cart"
                              className="px-2.5 py-1.5 text-xs font-mono font-bold btn-vermilion disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition flex items-center gap-1 active:scale-95"
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
            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-[#aab4ad] mb-1">
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
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-white/15 rounded-xl text-xs sm:text-sm text-[#dfe7e0] focus:outline-none focus:border-[#e0231c] shadow-inner"
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
                <div className="p-3.5 bg-black/50 border border-[#e0231c]/30 rounded-xl text-xs space-y-1.5 animate-fade-in shadow-inner">
                  <div className="flex justify-between items-baseline font-bold text-[#dfe7e0]">
                    <span className="truncate pr-2">{selectedProduct.name}</span>
                    <span className="text-[#c9a24a] font-mono text-sm shrink-0">
                      ₹{selectedProduct.sellingPrice}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#78837c] font-mono text-[11px]">
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
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#aab4ad] mb-1">
                    Custom Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct ? selectedProduct.quantity : 999}
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(e.target.value)}
                    disabled={!selectedProduct || selectedProduct.quantity <= 0}
                    className="w-full px-3.5 py-2 bg-black/50 border border-white/15 rounded-xl text-sm font-mono text-[#dfe7e0] focus:outline-none focus:border-[#e0231c] disabled:opacity-40"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!selectedProduct || selectedProduct.quantity <= 0}
                  className="w-full py-2.5 px-4 btn-vermilion disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Bill</span>
                </button>
              </div>
            </div>
          </div>

          {/* Customer & Payment Options Card */}
          <div className="kage-card p-5 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#dfe7e0]">
              Customer & Payment Mode
            </h3>

            {/* Customer Name */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#aab4ad] mb-1">
                Customer Name (Optional)
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78837c]" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Walk-in Customer"
                  className="w-full pl-9 pr-3 py-2 bg-black/50 border border-white/15 rounded-xl text-sm text-[#dfe7e0] placeholder-[#78837c] focus:outline-none focus:border-[#e0231c]"
                />
              </div>

              {customers.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-[#78837c] font-mono">Frequent:</span>
                  {customers.slice(0, 3).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCustomerName(c.name)}
                      className="text-[10px] font-mono px-2 py-0.5 bg-white/[0.04] hover:bg-white/[0.08] text-[#aab4ad] hover:text-[#dfe7e0] rounded-lg border border-white/10 transition"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Mode Selector */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-[#aab4ad] mb-1.5">
                Payment Method <span className="text-[#e0231c]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-mono uppercase tracking-wider transition-all duration-150 ${
                    paymentMethod === 'Cash'
                      ? 'bg-[#e0231c]/25 border-[#e0231c] text-white shadow-[0_0_15px_rgba(224,35,28,0.2)] font-bold'
                      : 'bg-black/40 border-white/10 text-[#78837c] hover:text-[#dfe7e0]'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-[#c9a24a]" />
                  <span>Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-mono uppercase tracking-wider transition-all duration-150 ${
                    paymentMethod === 'UPI'
                      ? 'bg-blue-950/40 border-blue-500 text-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.2)] font-bold'
                      : 'bg-black/40 border-white/10 text-[#78837c] hover:text-[#dfe7e0]'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-blue-400" />
                  <span>UPI / QR</span>
                </button>
              </div>

              {/* UPI Notice */}
              {paymentMethod === 'UPI' && (
                <div className="mt-2.5 p-3 bg-blue-950/20 border border-blue-500/30 rounded-xl text-[11px] text-blue-200 flex items-start gap-2 leading-relaxed animate-fade-in">
                  <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Soundbox Verification:</strong> Confirm transaction arrival on PhonePe, GPay, or Paytm before finalizing the bill.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Bill / Cart Summary */}
        <div className="lg:col-span-7 space-y-4">
          <div className="kage-card p-5 sm:p-6 flex flex-col min-h-[480px]">
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-white/[0.05] text-[#c9a24a]">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#dfe7e0]">
                  Active Cart Ledger
                </h3>
                <span className="text-xs bg-black/40 text-amber-300 border border-amber-600/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-xs text-red-400 hover:text-red-300 font-mono transition"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto max-h-[340px]">
              {cart.length === 0 ? (
                <div className="py-20 text-center text-[#78837c]">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30 text-[#dfe7e0]" />
                  <p className="font-bold text-sm text-[#dfe7e0]">Cart is Empty</p>
                  <p className="text-xs text-[#78837c] mt-1 max-w-xs mx-auto">
                    Type an item name on the left or tap "+ Add" on recommendations to begin compiling the bill.
                  </p>
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="text-[#78837c] border-b border-white/10 text-[9px] font-mono uppercase tracking-[0.2em]">
                    <tr>
                      <th className="text-left pb-2.5">Product</th>
                      <th className="text-center pb-2.5">Rate</th>
                      <th className="text-center pb-2.5">Qty</th>
                      <th className="text-right pb-2.5">Total</th>
                      <th className="pb-2.5 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {cart.map((item) => (
                      <tr key={item.productId} className="hover:bg-white/[0.03] transition-colors">
                        {/* Name */}
                        <td className="py-3 font-semibold text-[#dfe7e0] max-w-[170px] truncate">
                          {item.name}
                        </td>

                        {/* Rate */}
                        <td className="py-3 text-center font-mono text-[#aab4ad]">
                          ₹{item.price}
                        </td>

                        {/* Quantity Controls */}
                        <td className="py-3 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-black/50 p-0.5 rounded-lg border border-white/10">
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQuantity(item.productId, -1)}
                              className="w-5 h-5 flex items-center justify-center font-bold text-[#aab4ad] hover:text-white hover:bg-white/[0.1] rounded transition active:scale-95"
                              title="Decrease"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-bold font-mono text-[#dfe7e0]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQuantity(item.productId, 1)}
                              className="w-5 h-5 flex items-center justify-center font-bold text-[#aab4ad] hover:text-white hover:bg-white/[0.1] rounded transition active:scale-95"
                              title="Increase"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Item Total */}
                        <td className="py-3 text-right font-bold text-[#c9a24a] font-mono">
                          {formatRupees(item.total)}
                        </td>

                        {/* Remove */}
                        <td className="py-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(item.productId)}
                            className="p-1 text-[#78837c] hover:text-red-400 rounded transition"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Cart Bill Summary & Final Checkout */}
            <div className="mt-auto pt-4 border-t border-white/10 space-y-3">
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-[#aab4ad]">
                  <span>Customer:</span>
                  <span className="font-semibold text-[#dfe7e0]">
                    {customerName.trim() || 'Walk-in Customer'}
                  </span>
                </div>
                <div className="flex justify-between text-[#aab4ad]">
                  <span>Payment Mode:</span>
                  <span className="font-bold text-[#c9a24a]">{paymentMethod}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-white/10">
                  <span className="text-xs uppercase tracking-wider text-[#dfe7e0]">Grand Total:</span>
                  <span className="text-2xl sm:text-3xl font-bold text-[#c9a24a] font-mono">
                    {formatRupees(cartTotal)}
                  </span>
                </div>
              </div>

              {/* Complete Sale Button */}
              <button
                type="button"
                onClick={handleCompleteSale}
                disabled={cart.length === 0 || isSubmitting}
                className="w-full py-4 px-4 btn-vermilion disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 active:scale-95 shadow-lg"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{isSubmitting ? 'Recording Bill...' : 'Complete Sale & Print Bill'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
