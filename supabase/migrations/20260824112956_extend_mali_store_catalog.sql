/*
# Extend MaliShop catalog: galleries, tiered pricing, tags, reviews

1. Modified Tables
- `store_products`: add `gallery` (jsonb array of image URLs), `tiered_pricing` (jsonb array of {min_qty, price_fcfa}), `tags` (text array), `min_order_qty` (integer), `sold_count` (integer), `deal_ends_at` (timestamptz, nullable) for flash deals.
2. New Tables
- `store_reviews`: customer reviews attached to products (name, rating, comment, verified flag).
3. Security
- RLS enabled on `store_reviews`; public read, public insert (no-auth storefront).
4. Important Notes
- All additions are additive — no existing columns dropped or renamed.
- `tiered_pricing` allows Alibaba-style bulk discounts (buy more, save more).
- `deal_ends_at` enables flash deal countdown timers.
*/

ALTER TABLE store_products
  ADD COLUMN IF NOT EXISTS gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tiered_pricing jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS min_order_qty integer NOT NULL DEFAULT 1 CHECK (min_order_qty >= 1),
  ADD COLUMN IF NOT EXISTS sold_count integer NOT NULL DEFAULT 0 CHECK (sold_count >= 0),
  ADD COLUMN IF NOT EXISTS deal_ends_at timestamptz;

CREATE TABLE IF NOT EXISTS store_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL DEFAULT '',
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS store_reviews_product_idx ON store_reviews(product_id);

ALTER TABLE store_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_store_reviews" ON store_reviews;
CREATE POLICY "public_read_store_reviews" ON store_reviews FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_create_store_reviews" ON store_reviews;
CREATE POLICY "public_create_store_reviews" ON store_reviews FOR INSERT TO anon, authenticated WITH CHECK (true);
