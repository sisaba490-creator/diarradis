/*
# Add admin management: update/delete policies + site settings

1. Modified Tables
- `store_products`: add UPDATE and DELETE policies (public, no-auth storefront).
- `store_categories`: add UPDATE, INSERT, DELETE policies.
- `store_orders`: add UPDATE policy (status changes).
2. New Tables
- `site_settings`: single-row key/value store for customizable page content (hero title, description, promo text, announcement, etc.).
3. Security
- RLS enabled on `site_settings`; public read + public write (no-auth storefront).
- All admin operations use the anon key directly since this is a single-tenant storefront without sign-in.
4. Important Notes
- This is a no-auth storefront, so admin access is gated by a client-side password only (not a security boundary).
- site_settings uses a key/value structure so new customizable fields can be added without schema changes.
*/

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_site_settings" ON site_settings;
CREATE POLICY "public_read_site_settings" ON site_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_write_site_settings" ON site_settings;
CREATE POLICY "public_write_site_settings" ON site_settings FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_site_settings" ON site_settings;
CREATE POLICY "public_update_site_settings" ON site_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_site_settings" ON site_settings;
CREATE POLICY "public_delete_site_settings" ON site_settings FOR DELETE TO anon, authenticated USING (true);

-- Product management policies
DROP POLICY IF EXISTS "public_update_store_products" ON store_products;
CREATE POLICY "public_update_store_products" ON store_products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_store_products" ON store_products;
CREATE POLICY "public_delete_store_products" ON store_products FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_store_products" ON store_products;
CREATE POLICY "public_insert_store_products" ON store_products FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Category management policies
DROP POLICY IF EXISTS "public_insert_store_categories" ON store_categories;
CREATE POLICY "public_insert_store_categories" ON store_categories FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_store_categories" ON store_categories;
CREATE POLICY "public_update_store_categories" ON store_categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_store_categories" ON store_categories;
CREATE POLICY "public_delete_store_categories" ON store_categories FOR DELETE TO anon, authenticated USING (true);

-- Order management
DROP POLICY IF EXISTS "public_update_store_orders" ON store_orders;
CREATE POLICY "public_update_store_orders" ON store_orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_delete_store_orders" ON store_orders;
CREATE POLICY "public_delete_store_orders" ON store_orders FOR DELETE TO anon, authenticated USING (true);

-- Seed default settings
INSERT INTO site_settings (key, value) VALUES
('announcement_text', 'Livraison offerte à Bamako dès 250 000 F'),
('announcement_phone', '+223 70 00 00 00'),
('hero_eyebrow', 'L''équipement qui vous ressemble'),
('hero_title', 'La technologie, simplement.'),
('hero_description', 'Découvrez une sélection d''électroménager et d''électronique pensée pour votre quotidien au Mali.'),
('hero_button', 'Découvrir la boutique'),
('hero_trust_count', '+2 000 clients'),
('hero_trust_label', 'nous font confiance'),
('promo_eyebrow', 'Le bon moment pour s''équiper'),
('promo_title', 'Des prix doux. Des envies folles.'),
('promo_description', 'Profitez de nos offres spéciales du mois et équipez votre maison sans compromis.'),
('promo_button', 'Voir les offres'),
('promo_discount', '-20%'),
('promo_discount_label', 'sur une sélection'),
('footer_tagline', 'Le meilleur de l''équipement pour chaque foyer malien.'),
('footer_copyright', '© 2026 Malishop. Fait avec soin à Bamako.'),
('admin_password', 'admin2026')
ON CONFLICT (key) DO NOTHING;
