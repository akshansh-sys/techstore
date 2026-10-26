/**
 * TechStore - Data Service Layer
 * 
 * This module manages all reading and writing to localStorage.
 * Because all database operations are centralized here, you can easily
 * replace this file in the future with API calls to Node.js/Express,
 * MongoDB, PostgreSQL, or any real backend without changing UI components!
 */

import { isTodayInIndia } from '../utils/formatters.js';

// Storage keys in the browser's localStorage
const STORAGE_KEYS = {
  PRODUCTS: 'techstore_products',
  BILLS: 'techstore_bills',
  CUSTOMERS: 'techstore_customers',
  UDHAAR: 'techstore_udhaar_transactions',
  SHOP_PROFILE: 'techstore_shop_profile',
};

// Default Shop Profile (Only displays phone or email if user explicitly enters it)
const DEFAULT_SHOP_PROFILE = {
  name: 'TechStore',
  tagline: 'Retail Terminal & Inventory Ledger',
  phone: '',
  email: '',
  address: '',
  gstin: '',
};

// Helper: Safely read and parse JSON from localStorage
function readStorage(key, defaultValue = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return defaultValue;
  }
}

// Helper: Safely write JSON to localStorage
function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
    return false;
  }
}

// Helper: Generate a unique ID
export function generateId(prefix = 'item') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

// ==========================================
// 1. SHOP PROFILE SERVICES
// ==========================================
export function getShopProfile() {
  const profile = readStorage(STORAGE_KEYS.SHOP_PROFILE, null);
  return profile || DEFAULT_SHOP_PROFILE;
}

export function saveShopProfile(profile) {
  return writeStorage(STORAGE_KEYS.SHOP_PROFILE, profile);
}

// ==========================================
// 2. PRODUCT & INVENTORY SERVICES
// ==========================================

export function getProducts() {
  const products = readStorage(STORAGE_KEYS.PRODUCTS, []);
  // Return sorted alphabetically by name
  return products.sort((a, b) => a.name.localeCompare(b.name));
}

export function getProductById(id) {
  const products = getProducts();
  return products.find((p) => p.id === id) || null;
}

export function saveProduct(productData) {
  const products = getProducts();
  const purchasePrice = parseFloat(productData.purchasePrice) || 0;
  const sellingPrice = parseFloat(productData.sellingPrice) || 0;
  const quantity = parseInt(productData.quantity, 10) || 0;
  const minStock = parseInt(productData.minStock, 10) || 0;

  // Validation
  if (!productData.name || productData.name.trim() === '') {
    throw new Error('Product name is required.');
  }
  if (purchasePrice < 0) {
    throw new Error('Purchase price cannot be negative.');
  }
  if (sellingPrice < 0) {
    throw new Error('Selling price cannot be negative.');
  }
  if (quantity < 0) {
    throw new Error('Available stock quantity cannot be negative.');
  }
  if (minStock < 0) {
    throw new Error('Minimum stock warning level cannot be negative.');
  }

  const cleanProduct = {
    id: productData.id || generateId('prod'),
    name: productData.name.trim(),
    category: (productData.category || 'General').trim(),
    purchasePrice,
    sellingPrice,
    quantity,
    minStock,
    updatedAt: new Date().toISOString(),
  };

  const existingIndex = products.findIndex((p) => p.id === cleanProduct.id);
  if (existingIndex >= 0) {
    // Edit existing product
    products[existingIndex] = cleanProduct;
  } else {
    // Add new product
    products.push(cleanProduct);
  }

  writeStorage(STORAGE_KEYS.PRODUCTS, products);
  return cleanProduct;
}

export function deleteProduct(productId) {
  const products = getProducts();
  const filtered = products.filter((p) => p.id !== productId);
  writeStorage(STORAGE_KEYS.PRODUCTS, filtered);
  return true;
}

export function bulkSaveProducts(productsList) {
  if (!Array.isArray(productsList) || productsList.length === 0) {
    return [];
  }
  const products = getProducts();
  const saved = [];
  const now = new Date().toISOString();

  for (const item of productsList) {
    if (!item.name || !item.name.trim()) continue;

    const purchasePrice = Math.max(0, parseFloat(item.purchasePrice) || 0);
    const sellingPrice = Math.max(0, parseFloat(item.sellingPrice) || 0);
    const quantity = Math.max(0, parseInt(item.quantity, 10) || 0);
    const minStock = Math.max(0, parseInt(item.minStock, 10) || 5);

    const cleanProduct = {
      id: item.id || generateId('prod'),
      name: item.name.trim(),
      category: (item.category || 'General').trim(),
      purchasePrice,
      sellingPrice,
      quantity,
      minStock,
      updatedAt: now,
    };

    // If product with matching ID or same name exists, update it
    const existingIndex = products.findIndex(
      (p) => (item.id && p.id === item.id) || p.name.trim().toLowerCase() === cleanProduct.name.toLowerCase()
    );

    if (existingIndex >= 0) {
      cleanProduct.id = products[existingIndex].id;
      products[existingIndex] = cleanProduct;
    } else {
      products.push(cleanProduct);
    }
    saved.push(cleanProduct);
  }

  writeStorage(STORAGE_KEYS.PRODUCTS, products);
  return saved;
}

// ==========================================
// 3. BILLING & SALES SERVICES
// ==========================================

export function getBills() {
  const bills = readStorage(STORAGE_KEYS.BILLS, []);
  // Return newest first
  return bills.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Creates a new bill and atomically reduces product inventory.
 * Guarantees that stock is reduced exactly once.
 */
export function createBill({ items, paymentMethod = 'Cash', customerName = '', notes = '' }) {
  if (!items || items.length === 0) {
    throw new Error('Cannot create an empty bill. Please add at least one item.');
  }

  const products = getProducts();
  const productMap = new Map(products.map((p) => [p.id, p]));

  // First pass: Validate stock availability for all items
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new Error(`Product "${item.name}" was not found in inventory.`);
    }
    if (item.quantity <= 0) {
      throw new Error(`Invalid quantity for "${item.name}". Must be at least 1.`);
    }
    if (item.quantity > product.quantity) {
      throw new Error(
        `Insufficient stock for "${product.name}". Available: ${product.quantity}, Requested: ${item.quantity}`
      );
    }
  }

  // Second pass: Calculate totals and deduct stock
  let subtotal = 0;
  const processedItems = items.map((item) => {
    const product = productMap.get(item.productId);
    const itemTotal = Number(product.sellingPrice) * Number(item.quantity);
    subtotal += itemTotal;

    // Deduct stock exactly once
    product.quantity -= Number(item.quantity);
    product.updatedAt = new Date().toISOString();

    return {
      productId: product.id,
      name: product.name,
      price: product.sellingPrice,
      quantity: Number(item.quantity),
      total: itemTotal,
    };
  });

  // Save updated product quantities to localStorage
  writeStorage(STORAGE_KEYS.PRODUCTS, Array.from(productMap.values()));

  // Generate unique readable bill number (e.g. TS-20261024-0012)
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const billNumber = `TS-${todayStr}-${randomSuffix}`;

  const newBill = {
    id: generateId('bill'),
    billNumber,
    date: new Date().toISOString(),
    items: processedItems,
    itemCount: processedItems.reduce((acc, curr) => acc + curr.quantity, 0),
    totalAmount: subtotal,
    paymentMethod, // 'Cash' | 'UPI'
    customerName: customerName.trim() || 'Walk-in Customer',
    notes: notes.trim(),
  };

  const currentBills = getBills();
  currentBills.unshift(newBill);
  writeStorage(STORAGE_KEYS.BILLS, currentBills);

  return newBill;
}

// ==========================================
// 4. CUSTOMER & UDHAAR (CREDIT) SERVICES
// ==========================================

export function getCustomers() {
  const customers = readStorage(STORAGE_KEYS.CUSTOMERS, []);
  return customers.sort((a, b) => a.name.localeCompare(b.name));
}

export function saveCustomer({ id, name, phone }) {
  if (!name || name.trim() === '') {
    throw new Error('Customer name is required.');
  }

  const customers = getCustomers();
  const cleanCustomer = {
    id: id || generateId('cust'),
    name: name.trim(),
    phone: (phone || '').trim(),
    createdAt: new Date().toISOString(),
  };

  const existingIndex = customers.findIndex((c) => c.id === cleanCustomer.id);
  if (existingIndex >= 0) {
    customers[existingIndex] = {
      ...customers[existingIndex],
      name: cleanCustomer.name,
      phone: cleanCustomer.phone,
    };
  } else {
    customers.push(cleanCustomer);
  }

  writeStorage(STORAGE_KEYS.CUSTOMERS, customers);
  return cleanCustomer;
}

export function getUdhaarTransactions(customerId = null) {
  const transactions = readStorage(STORAGE_KEYS.UDHAAR, []);
  const filtered = customerId
    ? transactions.filter((t) => t.customerId === customerId)
    : transactions;

  // Newest transactions first
  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Calculates a customer's outstanding balance dynamically from transaction history.
 * Balance = Total Udhaar (CREDIT) Given - Total Payments (PAYMENT) Received
 * Positive balance means the customer OWES money to the shop.
 */
export function getCustomerBalance(customerId) {
  const transactions = getUdhaarTransactions(customerId);
  return transactions.reduce((balance, txn) => {
    if (txn.type === 'CREDIT') {
      return balance + Number(txn.amount);
    } else if (txn.type === 'PAYMENT') {
      return balance - Number(txn.amount);
    }
    return balance;
  }, 0);
}

/**
 * Records an Udhaar transaction (Customer takes goods on credit)
 */
export function recordUdhaarDebit({ customerId, amount, note }) {
  const parsedAmount = parseFloat(amount);
  if (!customerId) throw new Error('Customer is required.');
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    throw new Error('Udhaar amount must be a positive number greater than 0.');
  }

  const transaction = {
    id: generateId('udhaar'),
    customerId,
    type: 'CREDIT', // Customer owes more
    amount: parsedAmount,
    note: (note || 'Udhaar purchase').trim(),
    date: new Date().toISOString(),
  };

  const allTransactions = readStorage(STORAGE_KEYS.UDHAAR, []);
  allTransactions.unshift(transaction);
  writeStorage(STORAGE_KEYS.UDHAAR, allTransactions);

  return transaction;
}

/**
 * Records a Payment transaction (Customer pays back partial or full amount)
 */
export function recordUdhaarPayment({ customerId, amount, note, paymentMode = 'Cash' }) {
  const parsedAmount = parseFloat(amount);
  if (!customerId) throw new Error('Customer is required.');
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    throw new Error('Payment amount must be greater than 0.');
  }

  const transaction = {
    id: generateId('udhaar'),
    customerId,
    type: 'PAYMENT', // Customer paid back
    amount: parsedAmount,
    paymentMode, // 'Cash' | 'UPI'
    note: (note || 'Payment received').trim(),
    date: new Date().toISOString(),
  };

  const allTransactions = readStorage(STORAGE_KEYS.UDHAAR, []);
  allTransactions.unshift(transaction);
  writeStorage(STORAGE_KEYS.UDHAAR, allTransactions);

  return transaction;
}

// ==========================================
// 5. DASHBOARD SUMMARY STATS
// ==========================================

export function getDashboardStats() {
  const products = getProducts();
  const bills = getBills();
  const customers = getCustomers();

  // 1. Today's total sales
  const todayBills = bills.filter((b) => isTodayInIndia(b.date));
  const todaySales = todayBills.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);

  // 2. Total number of products
  const totalProducts = products.length;

  // 3. Low stock product count (where available quantity <= minimum stock)
  const lowStockProducts = products.filter((p) => p.quantity <= p.minStock);
  const lowStockCount = lowStockProducts.length;

  // 4. Recent bills (latest 5)
  const recentBills = bills.slice(0, 5);

  // 5. Total outstanding Udhaar across all customers
  let totalPendingUdhaar = 0;
  customers.forEach((c) => {
    const bal = getCustomerBalance(c.id);
    if (bal > 0) totalPendingUdhaar += bal;
  });

  return {
    todaySales,
    todayBillCount: todayBills.length,
    totalProducts,
    lowStockCount,
    lowStockProducts: lowStockProducts.slice(0, 5),
    recentBills,
    totalPendingUdhaar,
    totalCustomers: customers.length,
  };
}

// ==========================================
// 6. SAMPLE DATA FOR TESTING & RESET
// ==========================================

export function loadSampleData() {
  const sampleProducts = [
    {
      id: 'prod_1',
      name: 'Boat BassHeads 100 Earphones',
      category: 'Audio',
      purchasePrice: 249,
      sellingPrice: 399,
      quantity: 18,
      minStock: 5,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod_2',
      name: 'Type-C Fast Charging Cable (1m)',
      category: 'Cables',
      purchasePrice: 90,
      sellingPrice: 199,
      quantity: 4,
      minStock: 10,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod_3',
      name: 'SanDisk 64GB Ultra microSD Card',
      category: 'Storage',
      purchasePrice: 420,
      sellingPrice: 599,
      quantity: 12,
      minStock: 5,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod_4',
      name: 'Portronics 20W USB-C Adapter',
      category: 'Chargers',
      purchasePrice: 350,
      sellingPrice: 499,
      quantity: 2,
      minStock: 5,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod_5',
      name: 'Wireless Bluetooth Mouse',
      category: 'Computer Accessories',
      purchasePrice: 280,
      sellingPrice: 450,
      quantity: 9,
      minStock: 4,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod_6',
      name: 'Duracell AA Batteries (Pack of 4)',
      category: 'Batteries',
      purchasePrice: 130,
      sellingPrice: 170,
      quantity: 25,
      minStock: 8,
      updatedAt: new Date().toISOString(),
    },
  ];

  const sampleCustomers = [
    {
      id: 'cust_1',
      name: 'Ramesh Sharma',
      phone: '',
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: 'cust_2',
      name: 'Pooja Verma',
      phone: '',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'cust_3',
      name: 'Amit Patel',
      phone: '',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ];

  const sampleUdhaar = [
    {
      id: 'udh_1',
      customerId: 'cust_1',
      type: 'CREDIT',
      amount: 450,
      note: 'Took Wireless Mouse on credit',
      date: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'udh_2',
      customerId: 'cust_1',
      type: 'PAYMENT',
      amount: 200,
      paymentMode: 'Cash',
      note: 'Partial payment received',
      date: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'udh_3',
      customerId: 'cust_2',
      type: 'CREDIT',
      amount: 599,
      note: 'SanDisk 64GB memory card',
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ];

  const sampleBills = [
    {
      id: 'bill_demo_1',
      billNumber: `TS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-1001`,
      date: new Date().toISOString(),
      items: [
        { productId: 'prod_1', name: 'Boat BassHeads 100 Earphones', price: 399, quantity: 1, total: 399 },
        { productId: 'prod_6', name: 'Duracell AA Batteries (Pack of 4)', price: 170, quantity: 1, total: 170 },
      ],
      itemCount: 2,
      totalAmount: 569,
      paymentMethod: 'UPI',
      customerName: 'Rohit Gupta',
      notes: 'Counter sale',
    },
    {
      id: 'bill_demo_2',
      billNumber: `TS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-1002`,
      date: new Date().toISOString(),
      items: [
        { productId: 'prod_3', name: 'SanDisk 64GB Ultra microSD Card', price: 599, quantity: 1, total: 599 },
      ],
      itemCount: 1,
      totalAmount: 599,
      paymentMethod: 'Cash',
      customerName: 'Walk-in Customer',
      notes: '',
    },
  ];

  writeStorage(STORAGE_KEYS.PRODUCTS, sampleProducts);
  writeStorage(STORAGE_KEYS.CUSTOMERS, sampleCustomers);
  writeStorage(STORAGE_KEYS.UDHAAR, sampleUdhaar);
  writeStorage(STORAGE_KEYS.BILLS, sampleBills);

  return true;
}

export function clearAllData() {
  localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
  localStorage.removeItem(STORAGE_KEYS.BILLS);
  localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
  localStorage.removeItem(STORAGE_KEYS.UDHAAR);
  return true;
}
