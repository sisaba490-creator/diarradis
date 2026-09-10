/*
# Create MaliElectro storefront schema

1. New Tables
- `store_categories`: public product categories with display order and visual accent.
- `store_products`: public catalog products with FCFA pricing, inventory, ratings, and product imagery.
- `store_orders`: checkout submissions containing customer contact, delivery, payment choice, and order totals.
- `store_order_items`: immutable product snapshots attached to each order.

2. Security
- Row Level Security is enabled on every table.
- Catalog tables allow public read access and no public writes.
- Orders and order items allow public checkout creation and public read access needed for the immediate confirmation flow.

3. Important Notes
- This is a single-tenant storefront without sign-in, so catalog browsing works for anonymous visitors.
- Product prices are stored as whole FCFA amounts.
- Order items keep product name and unit price snapshots so order confirmations remain accurate if the catalog changes later.
*/

CREATE TABLE IF NOT EXISTS store_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'Package',
  accent text NOT NULL DEFAULT 'blue',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS store_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES store_categories(id) ON DELETE RESTRICT,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  brand text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_fcfa integer NOT NULL CHECK (price_fcfa >= 0),
  old_price_fcfa integer CHECK (old_price_fcfa IS NULL OR old_price_fcfa > price_fcfa),
  image_url text NOT NULL,
  badge text,
  rating numeric(2,1) NOT NULL DEFAULT 4.8 CHECK (rating >= 0 AND rating <= 5),
  review_count integer NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  stock_count integer NOT NULL DEFAULT 0 CHECK (stock_count >= 0),
  featured boolean NOT NULL DEFAULT false,
  specs jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS store_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  city text NOT NULL,
  address text NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('orange_money', 'moov_money', 'cash_delivery')),
  subtotal_fcfa integer NOT NULL CHECK (subtotal_fcfa >= 0),
  delivery_fcfa integer NOT NULL CHECK (delivery_fcfa >= 0),
  total_fcfa integer NOT NULL CHECK (total_fcfa >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS store_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES store_orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES store_products(id) ON DELETE RESTRICT,
  product_name text NOT NULL,
  unit_price_fcfa integer NOT NULL CHECK (unit_price_fcfa >= 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS store_products_category_idx ON store_products(category_id);
CREATE INDEX IF NOT EXISTS store_products_featured_idx ON store_products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS store_order_items_order_idx ON store_order_items(order_id);

ALTER TABLE store_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_store_categories" ON store_categories;
CREATE POLICY "public_read_store_categories" ON store_categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_read_store_products" ON store_products;
CREATE POLICY "public_read_store_products" ON store_products FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_create_store_orders" ON store_orders;
CREATE POLICY "public_create_store_orders" ON store_orders FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_read_store_orders" ON store_orders;
CREATE POLICY "public_read_store_orders" ON store_orders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_create_store_order_items" ON store_order_items;
CREATE POLICY "public_create_store_order_items" ON store_order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_read_store_order_items" ON store_order_items;
CREATE POLICY "public_read_store_order_items" ON store_order_items FOR SELECT TO anon, authenticated USING (true);
