import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  PlusCircle,
  MinusCircle,
  History,
  Search,
  Phone,
  AlertCircle,
  X,
  Banknote,
  QrCode,
  FileText,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { formatRupees, formatDateTime } from '../utils/formatters';
import {
  getCustomerBalance,
  getUdhaarTransactions,
} from '../services/dataService';

export default function CustomerUdhaar({
  customers,
  onSaveCustomer,
  onRecordUdhaar,
  onRecordPayment,
  showToast,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [activeCustomerForUdhaar, setActiveCustomerForUdhaar] = useState(null);
  const [activeCustomerForPayment, setActiveCustomerForPayment] = useState(null);
  const [activeCustomerForPassbook, setActiveCustomerForPassbook] = useState(null);

  // Add Customer Form
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [customerFormError, setCustomerFormError] = useState('');

  // Udhaar Entry Form
  const [udhaarAmount, setUdhaarAmount] = useState('');
  const [udhaarNote, setUdhaarNote] = useState('');
  const [udhaarError, setUdhaarError] = useState('');

  // Payment Entry Form
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash'); // 'Cash' | 'UPI'
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentError, setPaymentError] = useState('');

  // Total pending udhaar across all customers
  const totalPendingUdhaar = customers.reduce((sum, c) => {
    const bal = getCustomerBalance(c.id);
    return bal > 0 ? sum + bal : sum;
  }, 0);

  const customersWithDues = customers.filter((c) => getCustomerBalance(c.id) > 0).length;

  // Filter customers by search
  const filteredCustomers = customers.filter((c) => {
    const query = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      (c.phone && c.phone.includes(query))
    );
  });

  // Handle Add Customer Submit
  const handleAddCustomerSubmit = (e) => {
    e.preventDefault();
    setCustomerFormError('');
    if (!newCustomerName.trim()) {
      setCustomerFormError('Customer name is required.');
      return;
    }

    try {
      onSaveCustomer({
        name: newCustomerName.trim(),
        phone: newCustomerPhone.trim(),
      });
      setNewCustomerName('');
      setNewCustomerPhone('');
      setIsAddCustomerOpen(false);
      showToast('Customer added successfully!', 'success');
    } catch (err) {
      setCustomerFormError(err.message || 'Error saving customer.');
    }
  };

  // Handle Give Udhaar Submit
  const handleUdhaarSubmit = (e) => {
    e.preventDefault();
    setUdhaarError('');
    const amt = parseFloat(udhaarAmount);
    if (isNaN(amt) || amt <= 0) {
      setUdhaarError('Please enter a valid amount greater than ₹0.');
      return;
    }

    try {
      onRecordUdhaar({
        customerId: activeCustomerForUdhaar.id,
        amount: amt,
        note: udhaarNote.trim() || 'Udhaar purchase',
      });
      setUdhaarAmount('');
      setUdhaarNote('');
      setActiveCustomerForUdhaar(null);
      showToast(`Recorded Udhaar of ₹${amt} for ${activeCustomerForUdhaar.name}`, 'success');
    } catch (err) {
      setUdhaarError(err.message || 'Failed to record udhaar.');
    }
  };

  // Handle Receive Payment Submit
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setPaymentError('');
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      setPaymentError('Payment amount must be greater than ₹0.');
      return;
    }

    try {
      onRecordPayment({
        customerId: activeCustomerForPayment.id,
        amount: amt,
        paymentMode,
        note: paymentNote.trim() || 'Payment received',
      });
      setPaymentAmount('');
      setPaymentNote('');
      setPaymentMode('Cash');
      setActiveCustomerForPayment(null);
      showToast(`Received payment of ₹${amt} from ${activeCustomerForPayment.name}`, 'success');
    } catch (err) {
      setPaymentError(err.message || 'Failed to record payment.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#dfe7e0]">
      {/* Title & Add Customer Button */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#dfe7e0] uppercase">
              Customer Udhaar
            </h2>
            <span className="text-xs sm:text-sm font-mono font-bold bg-white/[0.06] text-[#dfe7e0] px-3 py-0.5 rounded-full border border-white/10">
              {customers.length} Accounts
            </span>
          </div>
          <p className="text-sm text-[#78837c] font-mono mt-1">
            Track customer credit balances, record repayments, and view passbook audit logs
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setCustomerFormError('');
            setIsAddCustomerOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 btn-vermilion font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg active:scale-95 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Account</span>
        </button>
      </div>

      {/* Udhaar KPI Banner */}
      <div className="kage-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <span className="text-xs font-mono uppercase tracking-[0.15em] text-[#78837c] block font-semibold">
            Total Outstanding Market Udhaar
          </span>
          <div className="text-3xl sm:text-4xl font-black text-[#c9a24a] font-mono tracking-tight drop-shadow-sm">
            {formatRupees(totalPendingUdhaar)}
          </div>
          <p className="text-sm text-[#aab4ad]">
            Pending across <span className="font-extrabold text-[#dfe7e0] font-mono">{customersWithDues}</span> customers with active balances.
          </p>
        </div>

        <div className="p-4 bg-black/50 border border-white/10 rounded-xl text-xs sm:text-sm text-[#aab4ad] flex items-start gap-3 max-w-md shadow-inner">
          <ShieldCheck className="w-5 h-5 text-[#c9a24a] shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            <strong className="text-[#dfe7e0]">Immutable Ledger:</strong> Balances cannot be manually rewritten; each rupee is strictly calculated from chronological debits and credits.
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78837c]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search customer by name or phone number..."
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

      {/* Customer List */}
      <div className="kage-card overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-[#78837c]">
            <Users className="w-14 h-14 mx-auto mb-3 opacity-30 text-[#dfe7e0]" />
            <p className="font-bold text-base text-[#dfe7e0]">No Accounts Found</p>
            <p className="text-sm text-[#78837c] mt-1.5 max-w-sm mx-auto">
              {searchTerm
                ? 'No customer matched your search query.'
                : 'Click "+ Add New Account" above to register your first customer ledger.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/50 border-b border-white/10 text-xs font-mono uppercase tracking-[0.15em] text-[#78837c]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Customer Name</th>
                  <th className="py-3.5 px-4 font-bold">Phone Number</th>
                  <th className="py-3.5 px-4 text-right font-bold">Outstanding Balance</th>
                  <th className="py-3.5 px-4 text-center font-bold">Status</th>
                  <th className="py-3.5 px-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCustomers.map((customer) => {
                  const balance = getCustomerBalance(customer.id);
                  const hasDues = balance > 0;

                  return (
                    <tr key={customer.id} className="hover:bg-white/[0.03] transition-colors duration-100">
                      {/* Name */}
                      <td className="py-3.5 px-4 font-bold text-sm sm:text-base text-[#dfe7e0]">
                        {customer.name}
                      </td>

                      {/* Clickable Phone (tel:) - Only if entered by user */}
                      <td className="py-3.5 px-4">
                        {customer.phone && customer.phone.trim() ? (
                          <a
                            href={`tel:${customer.phone.replace(/[\s-]/g, '')}`}
                            className="inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm text-[#aab4ad] hover:text-[#dfe7e0] bg-white/[0.03] hover:bg-white/[0.08] px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
                            title={`Tap to call: ${customer.phone}`}
                          >
                            <Phone className="w-3.5 h-3.5 text-[#c9a24a]" />
                            <span>{customer.phone}</span>
                          </a>
                        ) : (
                          <span className="text-[#78837c] font-mono text-xs">—</span>
                        )}
                      </td>

                      {/* Outstanding Balance */}
                      <td className="py-3.5 px-4 text-right font-mono font-black text-base sm:text-lg">
                        <span className={hasDues ? 'text-[#ff5a3c]' : 'text-emerald-400'}>
                          {formatRupees(balance)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {hasDues ? (
                          <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-red-950/60 text-red-300 border border-red-500/30 font-bold">
                            Udhaar Due
                          </span>
                        ) : balance < 0 ? (
                          <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-blue-950/60 text-blue-300 border border-blue-500/30 font-bold">
                            Advance Paid
                          </span>
                        ) : (
                          <span className="text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 font-bold">
                            Clear (₹0)
                          </span>
                        )}
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {/* Give Udhaar (+ Credit) */}
                          <button
                            type="button"
                            onClick={() => {
                              setUdhaarError('');
                              setUdhaarAmount('');
                              setUdhaarNote('');
                              setActiveCustomerForUdhaar(customer);
                            }}
                            className="px-3 py-1.5 text-xs font-mono font-bold text-red-300 bg-red-950/40 hover:bg-red-950/70 border border-red-500/30 rounded-lg transition active:scale-95"
                            title="Add Credit / Udhaar"
                          >
                            + Udhaar
                          </button>

                          {/* Receive Payment (- Credit) */}
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentError('');
                              setPaymentAmount('');
                              setPaymentNote('');
                              setPaymentMode('Cash');
                              setActiveCustomerForPayment(customer);
                            }}
                            className="px-3 py-1.5 text-xs font-mono font-bold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/30 rounded-lg transition active:scale-95"
                            title="Receive Payment"
                          >
                            - Payment
                          </button>

                          {/* Passbook / History */}
                          <button
                            type="button"
                            onClick={() => setActiveCustomerForPassbook(customer)}
                            className="p-2 text-[#78837c] hover:text-[#dfe7e0] hover:bg-white/[0.08] rounded-lg transition active:scale-95"
                            title="View Passbook & Statement"
                          >
                            <History className="w-4 h-4 text-[#c9a24a]" />
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

      {/* Modal 1: Add Customer Modal */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0a0e12] rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-white/15 animate-scale-up">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <h3 className="font-bold text-sm uppercase tracking-wide text-[#dfe7e0] flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#e0231c]" />
                <span>Add Customer Account</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddCustomerOpen(false)}
                className="p-1 text-[#78837c] hover:text-[#dfe7e0] rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1">
                  Customer Name <span className="text-[#e0231c]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-white/15 rounded-xl text-sm text-[#dfe7e0] placeholder-[#78837c] focus:outline-none focus:border-[#e0231c]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="e.g. 9829012345"
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-white/15 rounded-xl text-sm text-[#dfe7e0] placeholder-[#78837c] focus:outline-none focus:border-[#e0231c] font-mono"
                />
              </div>

              {customerFormError && (
                <p className="text-xs text-red-400 font-medium">{customerFormError}</p>
              )}

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-4 py-2 text-xs font-mono text-[#aab4ad] hover:text-[#dfe7e0] bg-white/[0.04] rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white btn-vermilion rounded-xl shadow-md active:scale-95"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Give Udhaar (+ Credit) Modal */}
      {activeCustomerForUdhaar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0a0e12] rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-white/15 animate-scale-up">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wide text-red-300 flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-[#e0231c]" />
                  <span>Give Udhaar (Debit)</span>
                </h3>
                <p className="text-xs text-[#aab4ad] mt-0.5">
                  To: <span className="font-bold text-[#dfe7e0]">{activeCustomerForUdhaar.name}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCustomerForUdhaar(null)}
                className="p-1 text-[#78837c] hover:text-[#dfe7e0] rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUdhaarSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1">
                  Udhaar Amount (₹) <span className="text-[#e0231c]">*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={udhaarAmount}
                  onChange={(e) => setUdhaarAmount(e.target.value)}
                  placeholder="e.g. 450"
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-white/15 rounded-xl text-sm font-mono text-[#ff5a3c] placeholder-[#78837c] focus:outline-none focus:border-[#e0231c]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1">
                  Item / Reason Note
                </label>
                <input
                  type="text"
                  value={udhaarNote}
                  onChange={(e) => setUdhaarNote(e.target.value)}
                  placeholder="e.g. Rice and edible oil"
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-white/15 rounded-xl text-sm text-[#dfe7e0] placeholder-[#78837c] focus:outline-none focus:border-[#e0231c]"
                />
              </div>

              {udhaarError && (
                <p className="text-xs text-red-400 font-medium">{udhaarError}</p>
              )}

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveCustomerForUdhaar(null)}
                  className="px-4 py-2 text-xs font-mono text-[#aab4ad] hover:text-[#dfe7e0] bg-white/[0.04] rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white btn-vermilion rounded-xl shadow-md active:scale-95"
                >
                  Record Udhaar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Receive Payment (- Credit) Modal */}
      {activeCustomerForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0a0e12] rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-white/15 animate-scale-up">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wide text-emerald-300 flex items-center gap-1.5">
                  <MinusCircle className="w-4 h-4 text-emerald-400" />
                  <span>Receive Payment</span>
                </h3>
                <p className="text-xs text-[#aab4ad] mt-0.5">
                  From: <span className="font-bold text-[#dfe7e0]">{activeCustomerForPayment.name}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCustomerForPayment(null)}
                className="p-1 text-[#78837c] hover:text-[#dfe7e0] rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              {/* Current Dues Display */}
              <div className="p-3 bg-black/50 border border-white/10 rounded-xl flex justify-between items-center text-xs font-mono">
                <span className="text-[#78837c]">Current Dues:</span>
                <span className="font-bold text-[#ff5a3c] text-sm">
                  {formatRupees(getCustomerBalance(activeCustomerForPayment.id))}
                </span>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1">
                  Payment Received (₹) <span className="text-[#e0231c]">*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="e.g. 200"
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-white/15 rounded-xl text-sm font-mono text-emerald-300 placeholder-[#78837c] focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1">
                  Payment Mode
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('Cash')}
                    className={`py-2 px-3 text-xs font-mono font-bold rounded-xl border flex items-center justify-center gap-1.5 transition ${
                      paymentMode === 'Cash'
                        ? 'bg-[#e0231c]/20 border-[#e0231c] text-white shadow-xs'
                        : 'bg-black/40 border-white/10 text-[#78837c] hover:text-[#dfe7e0]'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5 text-[#c9a24a]" />
                    <span>Cash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('UPI')}
                    className={`py-2 px-3 text-xs font-mono font-bold rounded-xl border flex items-center justify-center gap-1.5 transition ${
                      paymentMode === 'UPI'
                        ? 'bg-blue-950/40 border-blue-500 text-blue-200 shadow-xs'
                        : 'bg-black/40 border-white/10 text-[#78837c] hover:text-[#dfe7e0]'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5 text-blue-400" />
                    <span>UPI</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#aab4ad] mb-1">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="e.g. Partial cash payment"
                  className="w-full px-3.5 py-2.5 bg-black/50 border border-white/15 rounded-xl text-sm text-[#dfe7e0] placeholder-[#78837c] focus:outline-none focus:border-emerald-500"
                />
              </div>

              {paymentError && (
                <p className="text-xs text-red-400 font-medium">{paymentError}</p>
              )}

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveCustomerForPayment(null)}
                  className="px-4 py-2 text-xs font-mono text-[#aab4ad] hover:text-[#dfe7e0] bg-white/[0.04] rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white btn-vermilion rounded-xl shadow-md active:scale-95"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Passbook / Full Transaction Ledger Modal */}
      {activeCustomerForPassbook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="bg-[#0a0e12] rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-white/15 my-4 sm:my-8 max-h-[92vh] overflow-y-auto animate-scale-up">
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/10">
              <div>
                <h3 className="font-bold text-sm uppercase tracking-wide text-[#dfe7e0] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#c9a24a]" />
                  <span>Customer Ledger & Passbook</span>
                </h3>
                <div className="text-xs text-[#aab4ad] mt-1 font-mono">
                  Customer: <span className="font-bold text-[#dfe7e0]">{activeCustomerForPassbook.name}</span>
                  {activeCustomerForPassbook.phone && (
                    <a
                      href={`tel:${activeCustomerForPassbook.phone.replace(/[\s-]/g, '')}`}
                      className="ml-2 text-[#c9a24a] hover:underline inline-flex items-center gap-1"
                      title="Tap to call customer"
                    >
                      <Phone className="w-3 h-3 text-[#c9a24a]" />
                      <span>{activeCustomerForPassbook.phone}</span>
                    </a>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveCustomerForPassbook(null)}
                className="p-1 text-[#78837c] hover:text-[#dfe7e0] rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Balance Snapshot */}
            <div className="p-4 bg-black/50 border border-white/10 rounded-2xl flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-[#aab4ad]">
                Net Outstanding Balance:
              </span>
              <span className="text-xl sm:text-2xl font-bold font-mono text-[#c9a24a]">
                {formatRupees(getCustomerBalance(activeCustomerForPassbook.id))}
              </span>
            </div>

            {/* Transactions List */}
            <div className="max-h-80 overflow-y-auto border border-white/10 rounded-xl">
              {getUdhaarTransactions(activeCustomerForPassbook.id).length === 0 ? (
                <div className="p-10 text-center text-[#78837c]">
                  <History className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#dfe7e0]" />
                  <p className="text-sm font-bold text-[#dfe7e0]">No Transactions Recorded</p>
                  <p className="text-xs text-[#78837c] mt-1">
                    Click "+ Udhaar" or "- Payment" to add records to this ledger.
                  </p>
                </div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead className="bg-black/60 text-[#78837c] font-mono text-[9px] uppercase tracking-[0.2em] border-b border-white/10 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Note / Mode</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {getUdhaarTransactions(activeCustomerForPassbook.id).map((txn) => {
                      const isCredit = txn.type === 'CREDIT';
                      return (
                        <tr key={txn.id} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 font-mono text-[#78837c]">
                            {formatDateTime(txn.date)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider ${
                                isCredit
                                  ? 'bg-red-950/60 text-red-300 border border-red-500/30'
                                  : 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {isCredit ? 'Udhaar Taken' : 'Payment Made'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-[#aab4ad]">
                            {txn.note || '-'}
                            {txn.paymentMode && (
                              <span className="ml-1 text-[10px] text-[#78837c] font-mono">
                                ({txn.paymentMode})
                              </span>
                            )}
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right font-mono font-bold ${
                              isCredit ? 'text-red-400' : 'text-emerald-400'
                            }`}
                          >
                            {isCredit ? `+ ${formatRupees(txn.amount)}` : `- ${formatRupees(txn.amount)}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex justify-end pt-4 mt-2">
              <button
                type="button"
                onClick={() => setActiveCustomerForPassbook(null)}
                className="px-5 py-2.5 text-xs font-mono font-bold text-[#dfe7e0] bg-white/[0.06] hover:bg-white/[0.12] rounded-xl transition active:scale-95"
              >
                Close Passbook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
