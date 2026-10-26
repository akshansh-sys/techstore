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
import { LandingPageFrame } from './shaders/landing-pages/LandingPageFrame';

import {
  getProducts,
  saveProduct,
  deleteProduct,
  bulkSaveProducts,
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
  // Theme State ('dark' | 'light')
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('techstore_theme') || 'dark';
  });

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => getLocalUser());

  // Navigation: 'dashboard' | 'products' | 'billing' | 'udhaar'
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

  // Global keyboard shortcuts [1]-[4]
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }
      if (e.key === '1') setActiveSection('dashboard');
      else if (e.key === '2') setActiveSection('products');
      else if (e.key === '3') setActiveSection('billing');
      else if (e.key === '4') setActiveSection('udhaar');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync theme with document attribute & storage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('techstore_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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

  const handleBulkSaveProducts = (productsList) => {
    const saved = bulkSaveProducts(productsList);
    refreshData();
    return saved;
  };

  const handleDeleteProduct = (productId) => {
    deleteProduct(productId);
    refreshData();
  };

  // Billing Actions
  const handleCompleteSale = (billData) => {
    const newBill = createBill(billData);
    refreshData();
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

  // Check if valid section is selected
  const isValidSection = ['dashboard', 'products', 'billing', 'udhaar'].includes(activeSection);

  return (
    <div className="min-h-screen bg-[#05070a] text-[#dfe7e0] relative selection:bg-[#e0231c] selection:text-white overflow-x-hidden max-w-full">
      {/* 1. Authentic Kage Three.js 3D Background Layer (Optimized for maximum speed) */}
      <LandingPageFrame
        title="Kage 3D Temple Sanctuary"
        sourceUrl="/landing-pages/kage.html?q=low&dpr=1&shadow=0"
        backgroundCanvasSelector="#gl"
        backgroundVisualSelector="#vignette, #grain"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: theme === 'dark' ? 0.68 : 0.22,
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* 2. Atmospheric Vignette Overlay */}
      <div className="kage-vignette" />

      {/* 3. Main Application Content (z-10) */}
      <div className="relative z-10 min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
        {/* If user is not authenticated, show Kage Login & Registration Portal */}
        {!currentUser ? (
          <>
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />
            <Toast toast={toast} onClose={() => setToast(null)} />
          </>
        ) : (
          <>
            {/* Top Header Navigation */}
            <Header
              onClearData={() => setIsResetConfirmOpen(true)}
              currentUser={currentUser}
              onLogout={handleLogout}
              onNavigate={(sec) => setActiveSection(sec)}
              activeSection={activeSection}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />

            <div className="flex-1 flex max-w-7xl w-full mx-auto min-w-0">
              {/* Desktop Sidebar Navigation */}
              <Sidebar
                activeSection={activeSection}
                onSelectSection={(sec) => setActiveSection(sec)}
              />

              {/* Main Content Area: Temple Pavilions */}
              <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-full min-w-0 overflow-x-hidden">
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
                    onBulkSaveProducts={handleBulkSaveProducts}
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

            {/* Feedback Toast Notifications */}
            <Toast toast={toast} onClose={() => setToast(null)} />
          </>
        )}
      </div>
    </div>
  );
}
