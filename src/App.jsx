import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Billing from './components/Billing';
import CustomerUdhaar from './components/CustomerUdhaar';
import ReceiptModal from './components/ReceiptModal';
import Toast from './components/Toast';
import ConfirmModal from './components/ConfirmModal';
import LoginPage from './components/LoginPage';
import NotFound from './components/NotFound';
import KageExperience from './components/KageExperience';

import {
  getProducts,
  saveProduct,
  deleteProduct,
  createBill,
  getCustomers,
  saveCustomer,
  recordUdhaarDebit,
  recordUdhaarPayment,
  getDashboardStats,
  clearAllData,
} from './services/dataService';

import { getLocalUser, logoutUser } from './services/supabaseClient';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => getLocalUser());
  const [isGuestExploring, setIsGuestExploring] = useState(false);

  // Navigation: 'dashboard' | 'products' | 'billing' | 'udhaar' | 'experience'
  const [activeSection, setActiveSection] = useState('dashboard');

  // Application Data States
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    todaySales: 0,
    todayBillCount: 0,
    totalProducts: 0,
    lowStockCount: 0,
    lowStockProducts: [],
    recentBills: [],
    totalPendingUdhaar: 0,
    totalCustomers: 0,
  });

  // Modal & Feedback States
  const [activeReceiptBill, setActiveReceiptBill] = useState(null);
  const [toast, setToast] = useState(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Helper to show temporary toasts
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  // Central function to refresh data from localStorage
  const refreshData = useCallback(() => {
    const loadedProducts = getProducts();
    const loadedCustomers = getCustomers();
    const stats = getDashboardStats();

    setProducts(loadedProducts);
    setCustomers(loadedCustomers);
    setDashboardStats(stats);
  }, []);

  // Global keyboard shortcuts [1]-[5]
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }
      if (e.key === '1') setActiveSection('dashboard');
      else if (e.key === '2') setActiveSection('products');
      else if (e.key === '3') setActiveSection('billing');
      else if (e.key === '4') setActiveSection('udhaar');
      else if (e.key === '5') setActiveSection('experience');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initial load on component mount
  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
  }, [currentUser, refreshData]);

  // Auth Handlers
  const handleLoginSuccess = () => {
    const user = getLocalUser();
    setCurrentUser(user);
    refreshData();
    showToast(`Welcome back, ${user.shopName || user.email}!`, 'success');
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    showToast('You have been logged out safely.', 'info');
  };

  // Product Actions
  const handleSaveProduct = (productData) => {
    saveProduct(productData);
    refreshData();
  };

  const handleDeleteProduct = (productId) => {
    deleteProduct(productId);
    refreshData();
  };

  // Billing Actions
  const handleCompleteSale = (billData) => {
    const newBill = createBill(billData);
    refreshData();
    // Automatically pop open the printable receipt modal
    setActiveReceiptBill(newBill);
    return newBill;
  };

  // Customer & Udhaar Actions
  const handleSaveCustomer = (customerData) => {
    const newCust = saveCustomer(customerData);
    refreshData();
    return newCust;
  };

  const handleRecordUdhaar = (udhaarData) => {
    const txn = recordUdhaarDebit(udhaarData);
    refreshData();
    return txn;
  };

  const handleRecordPayment = (paymentData) => {
    const txn = recordUdhaarPayment(paymentData);
    refreshData();
    return txn;
  };

  // Reset Storage Handler
  const handleClearAllData = () => {
    clearAllData();
    refreshData();
    setIsResetConfirmOpen(false);
    showToast('All stored records cleared.', 'info');
  };

  // If user is not authenticated, show Login & Registration Page or Guest 3D Experience
  if (!currentUser) {
    if (isGuestExploring) {
      return (
        <KageExperience
          onBack={() => setIsGuestExploring(false)}
          onNavigate={(sec) => {
            setIsGuestExploring(false);
            setActiveSection(sec);
          }}
        />
      );
    }

    return (
      <>
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onExploreExperience={() => setIsGuestExploring(true)}
        />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  // Check if valid section is selected
  const isValidSection = ['dashboard', 'products', 'billing', 'udhaar', 'experience'].includes(activeSection);

  // If in full 3D experience mode
  if (activeSection === 'experience') {
    return (
      <KageExperience
        onBack={() => setActiveSection('dashboard')}
        onNavigate={(sec) => setActiveSection(sec)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Header Navigation */}
      <Header
        onClearData={() => setIsResetConfirmOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onNavigate={(sec) => setActiveSection(sec)}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar Navigation */}
        <Sidebar
          activeSection={activeSection}
          onSelectSection={(sec) => setActiveSection(sec)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-full overflow-hidden">
          {activeSection === 'dashboard' && (
            <Dashboard
              stats={dashboardStats}
              onNavigate={(section) => setActiveSection(section)}
              onViewBill={(bill) => setActiveReceiptBill(bill)}
              storeName={currentUser?.shopName}
            />
          )}

          {activeSection === 'products' && (
            <Products
              products={products}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              showToast={showToast}
            />
          )}

          {activeSection === 'billing' && (
            <Billing
              products={products}
              customers={customers}
              onCompleteSale={handleCompleteSale}
              showToast={showToast}
            />
          )}

          {activeSection === 'udhaar' && (
            <CustomerUdhaar
              customers={customers}
              onSaveCustomer={handleSaveCustomer}
              onRecordUdhaar={handleRecordUdhaar}
              onRecordPayment={handleRecordPayment}
              showToast={showToast}
            />
          )}

          {/* 404 Custom Fallback */}
          {!isValidSection && (
            <NotFound onNavigate={(sec) => setActiveSection(sec)} />
          )}
        </main>
      </div>

      {/* Footer with Working Links */}
      <Footer
        onNavigate={(sec) => setActiveSection(sec)}
        currentUser={currentUser}
      />

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeSection={activeSection}
        onSelectSection={(sec) => setActiveSection(sec)}
      />

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(activeReceiptBill)}
        bill={activeReceiptBill}
        onClose={() => setActiveReceiptBill(null)}
        storeName={currentUser?.shopName}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset Store Records?"
        message="This will erase all products, sales history, customer records, and udhaar ledgers stored in this browser."
        confirmText="Yes, Reset Everything"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={handleClearAllData}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* User Feedback Toast Notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
