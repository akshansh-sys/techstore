-- ====================================================================
-- TechStore - Supabase Cloud Database Schema
-- Run this in your Supabase Dashboard -> SQL Editor -> New Query
-- ====================================================================

-- 1. Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  purchase_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  selling_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bills Table
CREATE TABLE IF NOT EXISTS public.bills (
  id TEXT PRIMARY KEY,
  bill_number TEXT NOT NULL UNIQUE,
  date TIMESTAMPTZ DEFAULT NOW(),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  item_count INTEGER DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'Cash',
  customer_name TEXT DEFAULT 'Walk-in Customer',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Customer Udhaar Transactions Table
CREATE TABLE IF NOT EXISTS public.udhaar_transactions (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('CREDIT', 'PAYMENT')),
  amount NUMERIC(10, 2) NOT NULL,
  payment_mode TEXT DEFAULT 'Cash',
  note TEXT DEFAULT '',
  date TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.udhaar_transactions ENABLE ROW LEVEL SECURITY;

-- 6. Open Read/Write Policies for Authenticated & Public Anon (Adjust for production)
CREATE POLICY "Allow public all on products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on bills" ON public.bills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on udhaar_transactions" ON public.udhaar_transactions FOR ALL USING (true) WITH CHECK (true);
