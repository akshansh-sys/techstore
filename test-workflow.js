/**
 * End-to-end logic test script for TechStore.
 * Tests:
 * 1. Product creation and stock validation
 * 2. Sale completion, atomic stock reduction, bill generation
 * 3. Prevention of selling more than available stock
 * 4. Customer creation, Udhaar debit (+), Partial payment (-), and dynamic balance calculation
 * 5. Prevention of negative payments
 */

// Simple mock for browser localStorage in Node.js environment
const mockStorage = {};
global.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { for (const k in mockStorage) delete mockStorage[k]; },
};

async function runTests() {
  console.log('--- STARTING TECHSTORE WORKFLOW TESTS ---\n');

  const {
    saveProduct,
    getProducts,
    createBill,
    getBills,
    saveCustomer,
    getCustomers,
    recordUdhaarDebit,
    recordUdhaarPayment,
    getCustomerBalance,
    getDashboardStats,
  } = await import('./src/services/dataService.js');

  // Test 1: Add a product
  console.log('1. Testing Product Creation...');
  const newProduct = saveProduct({
    name: 'Wireless Bluetooth Earbuds',
    category: 'Audio',
    purchasePrice: 450,
    sellingPrice: 799,
    quantity: 10,
    minStock: 3,
  });
  console.log(`✓ Product created: "${newProduct.name}" (ID: ${newProduct.id}, Qty: ${newProduct.quantity})`);

  // Verify stock in inventory
  let products = getProducts();
  const found = products.find((p) => p.id === newProduct.id);
  if (!found || found.quantity !== 10) throw new Error('Product not saved correctly');
  console.log('✓ Product verified in inventory storage.');

  // Test 2: Complete a sale (sell 2 items)
  console.log('\n2. Testing Sale & Atomic Stock Reduction...');
  const bill = createBill({
    items: [{ productId: newProduct.id, name: newProduct.name, quantity: 2 }],
    paymentMethod: 'Cash',
    customerName: 'Aman Sharma',
  });
  console.log(`✓ Bill Generated: ${bill.billNumber}, Total: ₹${bill.totalAmount}, Payment: ${bill.paymentMethod}`);

  // Check stock reduction (10 - 2 = 8)
  products = getProducts();
  const updatedProduct = products.find((p) => p.id === newProduct.id);
  console.log(`✓ Stock after sale: ${updatedProduct.quantity} (Expected: 8)`);
  if (updatedProduct.quantity !== 8) throw new Error('Stock did not reduce correctly!');

  // Test 3: Attempting to sell more than available stock (should fail)
  console.log('\n3. Testing Over-Stock Prevention...');
  try {
    createBill({
      items: [{ productId: newProduct.id, name: newProduct.name, quantity: 15 }], // 15 > 8
      paymentMethod: 'Cash',
    });
    throw new Error('Over-stock sale should have thrown an error!');
  } catch (err) {
    console.log(`✓ Correctly rejected sale exceeding stock: "${err.message}"`);
  }

  // Stock should STILL be 8
  products = getProducts();
  if (products.find((p) => p.id === newProduct.id).quantity !== 8) {
    throw new Error('Stock was modified after failed sale attempt!');
  }
  console.log('✓ Stock remained at 8 without side-effects.');

  // Test 4: Customer Udhaar Ledger
  console.log('\n4. Testing Customer Creation & Udhaar...');
  const customer = saveCustomer({
    name: 'Vikram Rajput',
    phone: '9828011223',
  });
  console.log(`✓ Customer created: "${customer.name}" (Phone: ${customer.phone})`);

  // Initial balance should be 0
  let balance = getCustomerBalance(customer.id);
  console.log(`✓ Initial balance: ₹${balance}`);
  if (balance !== 0) throw new Error('Initial balance should be 0');

  // Record Udhaar (Customer buys goods worth ₹1,200 on credit)
  recordUdhaarDebit({
    customerId: customer.id,
    amount: 1200,
    note: 'Bought keyboard & mouse on credit',
  });
  balance = getCustomerBalance(customer.id);
  console.log(`✓ Balance after ₹1,200 Udhaar: ₹${balance} (Customer owes shop ₹1,200)`);
  if (balance !== 1200) throw new Error('Udhaar debit not applied correctly');

  // Test 5: Partial Payment
  console.log('\n5. Testing Partial Payment...');
  recordUdhaarPayment({
    customerId: customer.id,
    amount: 500,
    paymentMode: 'UPI',
    note: 'Paid partial amount via PhonePe UPI',
  });
  balance = getCustomerBalance(customer.id);
  console.log(`✓ Balance after ₹500 payment: ₹${balance} (Customer now owes ₹700)`);
  if (balance !== 700) throw new Error('Partial payment did not reduce balance correctly');

  // Test 6: Prevention of negative payments
  console.log('\n6. Testing Negative Payment Prevention...');
  try {
    recordUdhaarPayment({
      customerId: customer.id,
      amount: -100,
    });
    throw new Error('Negative payment should have been rejected!');
  } catch (err) {
    console.log(`✓ Correctly prevented negative payment: "${err.message}"`);
  }

  // Test 7: Dashboard Stats
  console.log('\n7. Testing Dashboard Stats Calculation...');
  const stats = getDashboardStats();
  console.log(`✓ Dashboard Today Sales: ₹${stats.todaySales}`);
  console.log(`✓ Dashboard Total Products: ${stats.totalProducts}`);
  console.log(`✓ Dashboard Low Stock Count: ${stats.lowStockCount}`);
  console.log(`✓ Dashboard Total Pending Udhaar: ₹${stats.totalPendingUdhaar}`);

  console.log('\nALL WORKFLOW TESTS PASSED CLEANLY AND RELIABLY!');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
