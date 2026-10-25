import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  PlusCircle,
  MinusCircle,
  History,
  Search,
  Phone,
  Calendar,
  AlertCircle,
  X,
  CreditCard,
  Banknote,
  QrCode,
  FileText,
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
    <div className="space-y-6">
      {/* Title & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <span>Customer Udhaar & Credit Khata</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track customer balances, credit entries, and payment history securely
          </p>
        </div>

        <button
          onClick={() => {
            setCustomerFormError('');
            setIsAddCustomerOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl transition shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Udhaar KPI Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Outstanding Market Udhaar
          </span>
          <div className="text-2xl font-extrabold text-purple-700 font-mono mt-1">
            {formatRupees(totalPendingUdhaar)}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculated dynamically from complete customer debit & credit transactions
          </p>
        </div>
        <div className="text-xs text-slate-600 bg-purple-50 border border-purple-200 px-4 py-3 rounded-xl">
          <p className="font-semibold text-purple-900">100% Reliable Ledger</p>
          <p className="text-purple-700 mt-0.5">
            Balances cannot be manually modified; each rupee has a recorded transaction history.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search customer by name or phone number..."
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

      {/* Customer List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Users className="w-10 h-10 mx-auto mb-2 text-slate-400 opacity-60" />
            <p className="font-semibold text-slate-700">No customers found</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm
                ? 'No customer matched your search query.'
                : 'Click "+ Add New Customer" to register your first khata record.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4 text-right">Outstanding Balance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((customer) => {
                  const balance = getCustomerBalance(customer.id);
                  const hasDues = balance > 0;

                  return (
                    <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {customer.name}
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {customer.phone ? (
                          <a
                            href={`tel:${customer.phone.replace(/[\s-]/g, '')}`}
                            className="inline-flex items-center gap-1 font-mono text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-0.5 rounded-md border border-transparent hover:border-emerald-200 transition"
                            title={`Tap to call: ${customer.phone}`}
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>{customer.phone}</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">No phone</span>
                        )}
                      </td>

                      {/* Outstanding Balance */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-base">
                        <span className={hasDues ? 'text-rose-600' : 'text-emerald-700'}>
                          {formatRupees(balance)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {hasDues ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                            Udhaar Due
                          </span>
                        ) : balance < 0 ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            Advance Paid
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Clear (₹0)
                          </span>
                        )}
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Give Udhaar (+ Credit) */}
                          <button
                            type="button"
                            onClick={() => {
                              setUdhaarError('');
                              setUdhaarAmount('');
                              setUdhaarNote('');
                              setActiveCustomerForUdhaar(customer);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
                            title="Add Udhaar"
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
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                            title="Receive Payment"
                          >
                            - Payment
                          </button>

                          {/* Passbook / History */}
                          <button
                            type="button"
                            onClick={() => setActiveCustomerForPassbook(customer)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                            title="View Transaction History"
                          >
                            <History className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-800">Add New Customer</h3>
              <button
                type="button"
                onClick={() => setIsAddCustomerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="e.g. 9829012345"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-emerald-500 font-mono"
                />
              </div>

              {customerFormError && (
                <p className="text-xs text-rose-500 font-medium">{customerFormError}</p>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Give Udhaar (+ Credit) Modal */}
      {activeCustomerForUdhaar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-rose-800 flex items-center gap-1.5">
                  <PlusCircle className="w-5 h-5 text-rose-600" />
                  <span>Give Udhaar (Credit)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  To: <span className="font-semibold text-slate-800">{activeCustomerForUdhaar.name}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCustomerForUdhaar(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUdhaarSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Udhaar Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={udhaarAmount}
                  onChange={(e) => setUdhaarAmount(e.target.value)}
                  placeholder="e.g. 250"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:bg-white focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Item / Reason Note
                </label>
                <input
                  type="text"
                  value={udhaarNote}
                  onChange={(e) => setUdhaarNote(e.target.value)}
                  placeholder="e.g. Earphones and battery pack"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-rose-500"
                />
              </div>

              {udhaarError && (
                <p className="text-xs text-rose-600 font-medium">{udhaarError}</p>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveCustomerForUdhaar(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-emerald-800 flex items-center gap-1.5">
                  <MinusCircle className="w-5 h-5 text-emerald-600" />
                  <span>Receive Payment</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  From: <span className="font-semibold text-slate-800">{activeCustomerForPayment.name}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveCustomerForPayment(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              {/* Current Dues Display */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                <span className="text-slate-500">Current Outstanding:</span>
                <span className="font-bold font-mono text-rose-700">
                  {formatRupees(getCustomerBalance(activeCustomerForPayment.id))}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Amount Received (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="e.g. 200"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              {/* Payment Mode (Cash vs UPI) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('Cash')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 ${
                      paymentMode === 'Cash'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Cash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('UPI')}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border flex items-center justify-center gap-1.5 ${
                      paymentMode === 'UPI'
                        ? 'bg-blue-50 border-blue-500 text-blue-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>UPI</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="e.g. Partial cash payment"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              {paymentError && (
                <p className="text-xs text-rose-600 font-medium">{paymentError}</p>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveCustomerForPayment(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span>Customer Ledger & Passbook</span>
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  Customer: <span className="font-bold text-slate-800">{activeCustomerForPassbook.name}</span>
                  {activeCustomerForPassbook.phone && (
                    <a
                      href={`tel:${activeCustomerForPassbook.phone.replace(/[\s-]/g, '')}`}
                      className="ml-2 font-mono text-emerald-700 hover:text-emerald-800 underline inline-flex items-center gap-1"
                      title="Tap to call customer"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{activeCustomerForPassbook.phone}</span>
                    </a>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveCustomerForPassbook(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Balance Snapshot */}
            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-purple-900 uppercase tracking-wider">
                Current Net Balance:
              </span>
              <span className="text-xl font-bold font-mono text-purple-900">
                {formatRupees(getCustomerBalance(activeCustomerForPassbook.id))}
              </span>
            </div>

            {/* Transactions List */}
            <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-xl">
              {getUdhaarTransactions(activeCustomerForPassbook.id).length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">No transactions recorded yet</p>
                  <p className="text-xs mt-0.5">
                    Click "+ Udhaar" or "- Payment" to add records to this ledger.
                  </p>
                </div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Note / Mode</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {getUdhaarTransactions(activeCustomerForPassbook.id).map((txn) => {
                      const isCredit = txn.type === 'CREDIT';
                      return (
                        <tr key={txn.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-medium text-slate-600">
                            {formatDateTime(txn.date)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isCredit
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {isCredit ? 'Udhaar Taken' : 'Payment Made'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">
                            {txn.note || '-'}
                            {txn.paymentMode && (
                              <span className="ml-1 text-[10px] text-slate-500 font-medium">
                                ({txn.paymentMode})
                              </span>
                            )}
                          </td>
                          <td
                            className={`py-2.5 px-3 text-right font-mono font-bold ${
                              isCredit ? 'text-rose-600' : 'text-emerald-700'
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
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
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
