# TechStore - Kirana & Retail Store Management

**TechStore** is a beginner-friendly, clean, and mobile-friendly web application designed for small Indian general store and kirana shop owners. It is built using **React**, **Vite**, **JavaScript**, and **Tailwind CSS**.

---

## 🌟 Key Features

1. **Dashboard**
   - Live calculated metrics: Today's Total Sales (₹), Active Product Count, Low-Stock Alert Count, and Pending Udhaar.
   - 4 large navigation tiles to quickly jump between sections.
   - Recent bills summary with one-click view/reprint.
   - Low-stock warning list with restock shortcuts.

2. **Products (Inventory)**
   - Add new products with Name, Category, Purchase Price, Selling Price, Available Stock, and Low-Stock Alert Level.
   - Instant search by product name or category.
   - Edit product details and delete products with a safety confirmation dialog.
   - Validation that prevents negative prices or quantities.
   - Real-time stock reduction when sales are completed.

3. **Billing (Point of Sale)**
   - Live product selector with available stock validation.
   - Interactive cart with quantity adjustments (`+` / `-`), line item total, and removal.
   - Prevents adding more quantity than available in stock.
   - Payment method toggle: **Cash** or **UPI** (with a note that UPI only records payment mode on the receipt).
   - **Complete Sale**: Atomically updates inventory and generates a unique bill number (`TS-YYYYMMDD-XXXX`).
   - **Print Bill**: Clean thermal-style receipt with shop details, customer name, date/time in Asia/Kolkata timezone, item table, and totals using native browser printing (`window.print()`).

4. **Customer Udhaar (Credit Khata)**
   - Customer directory with live calculated net balances.
   - Add customer with name and optional phone number.
   - **Give Udhaar (+ Credit)**: Records credit given with a note.
   - **Receive Payment (- Credit)**: Records full or partial payments in Cash or UPI.
   - **Customer Passbook / Ledger**: Complete audit trail of debit/credit transactions (no silent deletions or manual number tampering).

5. **Sample Data for Testing**
   - Includes a **"Load Sample Data"** button in the top header so you can test the app immediately with realistic products, bills, and customers without having to type everything manually.

---

## 📁 Simple Folder Structure

```text
techstore/
├── index.html                 # Main HTML file
├── package.json               # Project dependencies and scripts
├── vite.config.js             # Vite configuration with Tailwind CSS
└── src/
    ├── main.jsx               # React entry point
    ├── App.jsx                # Main application state & section router
    ├── index.css              # Global styles & print receipt CSS
    ├── services/
    │   └── dataService.js     # Storage layer (localStorage + business logic)
    ├── utils/
    │   └── formatters.js      # Indian Rupee (₹) & Asia/Kolkata date formatters
    └── components/
        ├── Header.jsx         # Shop branding, live clock & sample data buttons
        ├── Sidebar.jsx        # Desktop navigation
        ├── MobileNav.jsx      # Mobile bottom navigation bar
        ├── Dashboard.jsx      # KPI cards, action buttons, recent bills
        ├── Products.jsx       # Inventory table, add/edit modal, low-stock alerts
        ├── Billing.jsx        # POS counter, cart, UPI/Cash selector
        ├── CustomerUdhaar.jsx # Khata ledger, credit/debit modals, passbook
        ├── ReceiptModal.jsx   # Printable thermal invoice layout
        ├── ConfirmModal.jsx   # Safe confirmation dialogs
        └── Toast.jsx          # Friendly action feedback alerts
```

---

## 🚀 How to Run the Project (Windows PowerShell)

Open **Windows PowerShell** or the integrated terminal in **VS Code** and run the following commands:

### 1. Navigate to the project directory:
```powershell
cd "D:\projects\techstore"
```

### 2. Install dependencies (if running for the first time):
```powershell
npm install
```

### 3. Start the local development server:
```powershell
npm run dev
```

### 4. Open in your browser:
Click the local link shown in the terminal, usually:
```
http://localhost:5173
```

---

## 🛠️ Future Database Connection (Transition Guide)

As a college student learning full-stack development, notice that all localStorage reads and writes are encapsulated inside:
[`src/services/dataService.js`](file:///D:/projects/techstore/src/services/dataService.js)

When you are ready to connect a real backend (e.g. Node.js + Express, PostgreSQL, MongoDB, or Supabase):
1. Keep the exact same function signatures (`getProducts()`, `createBill()`, `recordUdhaarDebit()`, etc.).
2. Replace the `localStorage.getItem` / `setItem` calls with `fetch('/api/products')` or `axios.post('/api/bills')`.
3. Your UI components will not need any structural rewrites!
