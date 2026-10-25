import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Search,
  IndianRupee,
  CreditCard,
  Banknote,
  QrCode,
  Info,
  X,
  Sparkles,
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

    // Set as active selection too
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

    // Check existing quantity already in cart
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

    // Reset selection input
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

    if (isSubmitting) return; // Prevent double submission
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
      // Reset form
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
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-emerald-600" />
          <span>Billing Counter (POS)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Search items with instant recommendations, add to cart, and generate printable bills
        </p>
      </div>

      {/* Error alert if any */}
      {errorMessage && (
        <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMessage}</div>
          <button
            onClick={() => setErrorMessage('')}
            className="text-xs text-rose-500 hover:text-rose-800"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Selector & Recommendations (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center justify-between">
              <span>Find & Select Product</span>
              <span className="text-xs font-normal text-slate-500">
                {products.length} registered
              </span>
            </h3>

            {/* Smart Search with Recommendations Dropdown */}
            <div className="relative mb-3" ref={searchContainerRef}>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Search Product (with Recommendations)
              </label>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={productSearch}
                  onFocus={() => setShowRecommendations(true)}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowRecommendations(true);
                  }}
                  placeholder="Type product name (e.g. Earphones, Cable, Atta)..."
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />

                {productSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setProductSearch('');
                      setSelectedProductId('');
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Recommendations Floating Popover */}
              {showRecommendations && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl z-30 max-h-72 overflow-y-auto divide-y divide-slate-100">
                  <div className="px-3 py-1.5 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex justify-between items-center sticky top-0 border-b border-slate-100">
                    <span className="flex items-center gap-1 text-emerald-700">
                      <Sparkles className="w-3 h-3" />
                      {trimmedSearch ? 'Recommendations' : 'Suggested In-Stock Items'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Click to select or tap + to add
                    </span>
                  </div>

                  {recommendedProducts.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No products matching "{productSearch}"
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
                          className={`p-2.5 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                            isSelected ? 'bg-emerald-50/70 border-l-4 border-emerald-600' : ''
                          }`}
                        >
                          <div className="flex-1 pr-2">
                            <div className="font-semibold text-xs text-slate-900 leading-tight">
                              {p.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-slate-500 px-1.5 py-0.2 bg-slate-100 rounded">
                                {p.category || 'General'}
                              </span>
                              <span
                                className={`text-[10px] font-medium ${
                                  isOutOfStock
                                    ? 'text-rose-600 font-bold'
                                    : isLowStock
                                    ? 'text-amber-600 font-semibold'
                                    : 'text-emerald-700'
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

                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-slate-900">
                              ₹{p.sellingPrice}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleQuickAdd(p, e)}
                              disabled={isOutOfStock}
                              title="Add 1 directly to cart"
                              className="px-2 py-1 text-xs font-bold bg-emerald-100 hover:bg-emerald-600 hover:text-white text-emerald-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed rounded-lg transition flex items-center gap-0.5 shadow-xs"
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

            {/* Product Dropdown Selection (Alternative selector) */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Or Choose from All Items List
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-emerald-500"
                >
                  <option value="">-- Choose a product from list --</option>
                  {availableProducts.map((p) => (
                    <option
                      key={p.id}
                      value={p.id}
                      disabled={p.quantity <= 0}
                    >
                      {p.name} — ₹{p.sellingPrice} ({p.quantity <= 0 ? 'OUT OF STOCK' : `${p.quantity} in stock`})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Product Preview Card */}
              {selectedProduct && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{selectedProduct.name}</span>
                    <span className="text-emerald-800 font-mono text-sm">
                      ₹{selectedProduct.sellingPrice}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Available in Stock:</span>
                    <span
                      className={`font-bold font-mono ${
                        selectedProduct.quantity <= selectedProduct.minStock
                          ? 'text-amber-700'
                          : 'text-slate-800'
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Custom Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedProduct ? selectedProduct.quantity : 999}
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(e.target.value)}
                    disabled={!selectedProduct || selectedProduct.quantity <= 0}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:bg-white focus:border-emerald-500 disabled:opacity-50"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!selectedProduct || selectedProduct.quantity <= 0}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Bill</span>
                </button>
              </div>
            </div>
          </div>

          {/* Customer & Payment Options Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800">Customer & Payment Mode</h3>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Name (Optional)
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Walk-in Customer"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-emerald-500"
              />
              {customers.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <span className="text-[10px] text-slate-400 self-center">Frequent:</span>
                  {customers.slice(0, 3).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCustomerName(c.name)}
                      className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Mode Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Method <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Cash')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition ${
                    paymentMethod === 'Cash'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>Cash</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition ${
                    paymentMethod === 'UPI'
                      ? 'bg-blue-50 border-blue-500 text-blue-800 ring-1 ring-blue-500'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-blue-600" />
                  <span>UPI / QR</span>
                </button>
              </div>

              {/* UPI Notice */}
              {paymentMethod === 'UPI' && (
                <div className="mt-2.5 p-2.5 bg-blue-50/80 border border-blue-200 rounded-xl text-[11px] text-blue-800 flex items-start gap-2 leading-relaxed">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Note:</strong> Selecting UPI records the payment mode on the receipt. Please check your UPI app (PhonePe, GPay, Paytm) to verify funds before completing the sale.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Bill / Cart Summary (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col min-h-[460px]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-800">Current Cart</h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono font-semibold">
                  {totalItemCount} items
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto max-h-[320px]">
              {cart.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="font-medium text-sm text-slate-600">Cart is empty</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Type a product name on the left to see instant recommendations and click "+ Add" to add items.
                  </p>
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="text-left pb-2 font-semibold">Product</th>
                      <th className="text-center pb-2 font-semibold">Rate</th>
                      <th className="text-center pb-2 font-semibold">Quantity</th>
                      <th className="text-right pb-2 font-semibold">Total</th>
                      <th className="pb-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cart.map((item) => (
                      <tr key={item.productId} className="hover:bg-slate-50/50">
                        {/* Name */}
                        <td className="py-2.5 font-medium text-slate-800 max-w-[150px] truncate">
                          {item.name}
                        </td>

                        {/* Rate */}
                        <td className="py-2.5 text-center font-mono text-slate-600">
                          ₹{item.price}
                        </td>

                        {/* Quantity Controls */}
                        <td className="py-2.5 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQuantity(item.productId, -1)}
                              className="w-5 h-5 flex items-center justify-center font-bold text-slate-600 hover:bg-white rounded transition"
                              title="Decrease"
                            >
                              -
                            </button>
                            <span className="w-6 text-center font-bold font-mono text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQuantity(item.productId, 1)}
                              className="w-5 h-5 flex items-center justify-center font-bold text-slate-600 hover:bg-white rounded transition"
                              title="Increase"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Item Total */}
                        <td className="py-2.5 text-right font-bold text-slate-900 font-mono">
                          {formatRupees(item.total)}
                        </td>

                        {/* Remove */}
                        <td className="py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(item.productId)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
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
            <div className="mt-auto pt-4 border-t border-slate-200 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Customer:</span>
                  <span className="font-semibold text-slate-800">
                    {customerName.trim() || 'Walk-in Customer'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Payment Method:</span>
                  <span className="font-bold text-emerald-700">{paymentMethod}</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                  <span className="text-sm font-bold text-slate-800">Final Bill Amount:</span>
                  <span className="text-2xl font-extrabold text-emerald-700 font-mono">
                    {formatRupees(cartTotal)}
                  </span>
                </div>
              </div>

              {/* Complete Sale Button */}
              <button
                type="button"
                onClick={handleCompleteSale}
                disabled={cart.length === 0 || isSubmitting}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{isSubmitting ? 'Processing Bill...' : 'Complete Sale & Print Bill'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
