-- Schema de la base de donnees locale MaliShop / DiarraDis (PostgreSQL 17)

CREATE TABLE IF NOT EXISTS store_categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'Package',
  accent text NOT NULL DEFAULT 'blue',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS store_products (
  id text PRIMARY KEY,
  category_id text NOT NULL REFERENCES store_categories(id) ON DELETE RESTRICT,
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
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  tiered_pricing jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags text[] NOT NULL DEFAULT '{}',
  min_order_qty integer NOT NULL DEFAULT 1 CHECK (min_order_qty >= 1),
  sold_count integer NOT NULL DEFAULT 0 CHECK (sold_count >= 0),
  deal_ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS store_reviews (
  id text PRIMARY KEY,
  product_id text NOT NULL REFERENCES store_products(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL DEFAULT '',
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS store_customers (
  id text PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL UNIQUE,
  email text,
  password text NOT NULL,
  city text NOT NULL DEFAULT 'Bamako',
  address text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS store_orders (
  id text PRIMARY KEY,
  customer_id text REFERENCES store_customers(id) ON DELETE SET NULL,
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
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);


CREATE TABLE IF NOT EXISTS store_order_items (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES store_orders(id) ON DELETE CASCADE,
  product_id text REFERENCES store_products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  unit_price_fcfa integer NOT NULL CHECK (unit_price_fcfa >= 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id text PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index pour les performances de recherche
CREATE INDEX IF NOT EXISTS idx_products_category ON store_products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON store_products(featured);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON store_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON store_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON store_order_items(order_id);

-- Insertion des Catégories
INSERT INTO store_categories (id, name, slug, description, icon, accent, sort_order) VALUES
('c1', 'Électroménager', 'electromenager', 'La maison, plus simple', 'Refrigerator', 'blue', 1),
('c2', 'Téléphonie', 'telephonie', 'Restez connecté', 'Smartphone', 'green', 2),
('c3', 'Audio & Image', 'audio-image', 'Le meilleur du divertissement', 'Headphones', 'yellow', 3),
('c4', 'Cuisine', 'cuisine', 'Le plaisir de bien faire', 'CookingPot', 'orange', 4),
('c5', 'Accessoires', 'accessoires', 'Les essentiels au quotidien', 'Cable', 'teal', 5)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  accent = EXCLUDED.accent,
  sort_order = EXCLUDED.sort_order;

-- Insertion des Produits
INSERT INTO store_products (id, category_id, name, slug, brand, description, price_fcfa, old_price_fcfa, image_url, badge, rating, review_count, stock_count, featured, specs, gallery, tiered_pricing, tags, min_order_qty, sold_count, deal_ends_at) VALUES
('p1', 'c1', 'Réfrigérateur SmartCool 320L', 'smartcool-320l', 'Hisense', 'Conservez vos aliments avec une fraîcheur optimale et une consommation maîtrisée.', 489000, 559000, 'https://images.pexels.com/photos/5556176/pexels-photo-5556176.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', '-13%', 4.9, 24, 8, true, '["320 litres", "No Frost", "Garantie 2 ans"]'::jsonb, '["https://images.pexels.com/photos/5556176/pexels-photo-5556176.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb, '[{"min_qty": 1, "price_fcfa": 489000}, {"min_qty": 3, "price_fcfa": 465000}]'::jsonb, ARRAY['promo', 'electromenager'], 1, 134, NULL),
('p2', 'c1', 'Climatiseur FreshAir 1.5 CV', 'freshair-15cv', 'Samsung', 'Une fraîcheur silencieuse et efficace, pensée pour les chaleurs de Bamako.', 365000, 399000, 'https://images.pexels.com/photos/27333871/pexels-photo-27333871.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Populaire', 4.8, 18, 12, true, '["1.5 CV", "Mode éco", "Installation incluse"]'::jsonb, '["https://images.pexels.com/photos/27333871/pexels-photo-27333871.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb, '[{"min_qty": 1, "price_fcfa": 365000}]'::jsonb, ARRAY['electromenager'], 1, 76, NULL),
('p3', 'c1', 'Ventilateur Breeze Pro 16 pouces', 'breeze-pro-16', 'Binatone', 'Puissant, silencieux et facile à déplacer dans toutes les pièces.', 59000, 69000, 'https://images.pexels.com/photos/10450623/pexels-photo-10450623.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', '-14%', 4.7, 31, 22, true, '["3 vitesses", "Oscillation 90°", "Télécommande"]'::jsonb, '["https://images.pexels.com/photos/10450623/pexels-photo-10450623.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb, '[{"min_qty": 1, "price_fcfa": 59000}, {"min_qty": 5, "price_fcfa": 55000}]'::jsonb, ARRAY['promo'], 1, 210, NULL),
('p4', 'c2', 'Smartphone Galaxy A55 5G', 'galaxy-a55-5g', 'Samsung', 'Un écran lumineux et une caméra polyvalente pour capturer chaque moment.', 229000, 259000, 'https://images.pexels.com/photos/18311092/pexels-photo-18311092.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Nouveau', 4.9, 42, 15, true, '["256 Go", "8 Go RAM", "Batterie 5000 mAh"]'::jsonb, '["https://images.pexels.com/photos/18311092/pexels-photo-18311092.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb, '[{"min_qty": 1, "price_fcfa": 229000}, {"min_qty": 10, "price_fcfa": 215000}]'::jsonb, ARRAY['nouveau', 'telephonie'], 1, 89, NULL),
('p5', 'c2', 'iPhone 13 128 Go', 'iphone-13-128', 'Apple', 'La puissance et la fiabilité Apple, disponible avec livraison rapide à Bamako.', 399000, 449000, 'https://images.pexels.com/photos/947407/pexels-photo-947407.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Meilleure vente', 4.9, 56, 6, true, '["128 Go", "Double SIM", "Garantie 1 an"]'::jsonb, '["https://images.pexels.com/photos/947407/pexels-photo-947407.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb, '[{"min_qty": 1, "price_fcfa": 399000}]'::jsonb, ARRAY['telephonie'], 1, 167, NULL),
('p6', 'c3', 'Smart TV LED 55 pouces 4K', 'smart-tv-55-4k', 'TCL', 'Transformez votre salon en véritable salle de cinéma.', 349000, 399000, 'https://images.pexels.com/photos/9646752/pexels-photo-9646752.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', '-12%', 4.8, 27, 9, true, '["55 pouces", "4K UHD", "Android TV"]'::jsonb, '["https://images.pexels.com/photos/9646752/pexels-photo-9646752.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb, '[{"min_qty": 1, "price_fcfa": 349000}]'::jsonb, ARRAY['promo', 'audio'], 1, 54, NULL),
('p7', 'c3', 'Écouteurs WaveBuds Pro', 'wavebuds-pro', 'JBL', 'Un son immersif et une autonomie qui vous accompagne toute la journée.', 45000, 55000, 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', '-18%', 4.6, 39, 34, false, '["Bluetooth 5.3", "ANC", "24 h autonomie"]'::jsonb, '["https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb, '[{"min_qty": 1, "price_fcfa": 45000}, {"min_qty": 5, "price_fcfa": 41000}]'::jsonb, ARRAY['promo', 'audio'], 1, 198, NULL),
('p8', 'c4', 'Cuisinière Gaz 4 Feux Inox', 'cuisiniere-gaz-4-feux', 'Midea', 'Préparez vos meilleurs plats avec une cuisinière robuste et élégante.', 179000, 199000, 'https://images.pexels.com/photos/16927367/pexels-photo-16927367.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', NULL, 4.7, 16, 11, false, '["4 feux", "Four intégré", "Acier inoxydable"]'::jsonb, '["https://images.pexels.com/photos/16927367/pexels-photo-16927367.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb, '[{"min_qty": 1, "price_fcfa": 179000}]'::jsonb, ARRAY['cuisine'], 1, 43, NULL),
('p9', 'c4', 'Mixeur PowerBlend 1000W', 'powerblend-1000w', 'Moulinex', 'Des smoothies onctueux et des préparations rapides en quelques secondes.', 39000, 49000, 'https://images.pexels.com/photos/18205656/pexels-photo-18205656.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', '-20%', 4.6, 22, 19, false, '["1000 W", "Bol 1.5 L", "3 programmes"]'::jsonb, '["https://images.pexels.com/photos/18205656/pexels-photo-18205656.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb, '[{"min_qty": 1, "price_fcfa": 39000}]'::jsonb, ARRAY['promo', 'cuisine'], 1, 87, NULL),
('p10', 'c1', 'Lave-linge AutoWash 8kg', 'autowash-8kg', 'LG', 'Un lavage silencieux et économique, parfait pour les familles maliennes.', 289000, 329000, 'https://images.pexels.com/photos/5816934/pexels-photo-5816934.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', '-12%', 4.8, 19, 7, true, '["8 kg", "1400 tr/min", "Classe A++"]'::jsonb, '["https://images.pexels.com/photos/5816934/pexels-photo-5816934.jpeg?auto=compress&cs=tinysrgb&h=650&w=940", "https://images.pexels.com/photos/12104070/pexels-photo-12104070.jpeg?auto=compress&cs=tinysrgb&h=650&w=940", "https://images.pexels.com/photos/28479466/pexels-photo-28479466.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb, '[{"min_qty": 1, "price_fcfa": 289000}, {"min_qty": 3, "price_fcfa": 275000}]'::jsonb, ARRAY['promo', 'electromenager'], 1, 134, '2026-08-25T23:59:00Z'),
('p11', 'c1', 'Micro-ondes HeatWave 25L', 'heatwave-25l', 'Midea', 'Réchauffez et décongelez vos plats en un clin d''œil avec 10 niveaux de puissance.', 89000, 109000, 'https://images.pexels.com/photos/16927363/pexels-photo-16927363.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', '-18%', 4.6, 28, 16, false, '["25 litres", "10 niveaux", "Décongélation auto"]'::jsonb, '["https://images.pexels.com/photos/16927363/pexels-photo-16927363.jpeg?auto=compress&cs=tinysrgb&h=650&w=940", "https://images.pexels.com/photos/5556176/pexels-photo-5556176.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb, '[{"min_qty": 1, "price_fcfa": 89000}, {"min_qty": 5, "price_fcfa": 82000}]'::jsonb, ARRAY['promo', 'cuisine'], 1, 87, '2026-08-25T18:00:00Z'),
('p12', 'c2', 'Tablette TabMax 10 pouces', 'tabmax-10', 'Samsung', 'Un grand écran pour le travail, les études et le divertissement.', 179000, 199000, 'https://images.pexels.com/photos/18205642/pexels-photo-18205642.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', 'Nouveau', 4.7, 14, 10, true, '["10 pouces", "64 Go", "WiFi + 4G"]'::jsonb, '["https://images.pexels.com/photos/18205642/pexels-photo-18205642.jpeg?auto=compress&cs=tinysrgb&h=650&w=940", "https://images.pexels.com/photos/29765798/pexels-photo-29765798.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb, '[{"min_qty": 1, "price_fcfa": 179000}, {"min_qty": 10, "price_fcfa": 165000}]'::jsonb, ARRAY['nouveau', 'telephonie'], 1, 42, NULL),
('p13', 'c2', 'PowerBank TurboCharge 20000mAh', 'turbocharge-20k', 'Anker', 'Ne tombez plus jamais en panne d''énergie, que vous soyez à Bamako ou en déplacement.', 25000, 32000, 'https://images.pexels.com/photos/4765366/pexels-photo-4765366.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', '-22%', 4.8, 67, 40, false, '["20000 mAh", "Charge rapide 18W", "2 ports USB"]'::jsonb, '["https://images.pexels.com/photos/4765366/pexels-photo-4765366.jpeg?auto=compress&cs=tinysrgb&h=650&w=940", "https://images.pexels.com/photos/947407/pexels-photo-947407.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb, '[{"min_qty": 1, "price_fcfa": 25000}, {"min_qty": 5, "price_fcfa": 22500}, {"min_qty": 20, "price_fcfa": 21000}]'::jsonb, ARRAY['promo', 'accessoires'], 1, 312, '2026-08-25T12:00:00Z'),
('p14', 'c3', 'Enceinte BoomBox XL', 'boombox-xl', 'JBL', 'Une puissance sonore impressionnante pour vos soirées et vos sorties en plein air.', 69000, 79000, 'https://images.pexels.com/photos/29581125/pexels-photo-29581125.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', '-13%', 4.7, 33, 18, true, '["30 W", "Étanche IP67", "12 h autonomie"]'::jsonb, '["https://images.pexels.com/photos/29581125/pexels-photo-29581125.jpeg?auto=compress&cs=tinysrgb&h=650&w=940", "https://images.pexels.com/photos/12502430/pexels-photo-12502430.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb, '[{"min_qty": 1, "price_fcfa": 69000}, {"min_qty": 3, "price_fcfa": 64000}]'::jsonb, ARRAY['audio', 'promo'], 1, 95, '2026-08-25T20:00:00Z'),
('p15', 'c4', 'Cuiseur de riz RiceMaster 5L', 'ricemaster-5l', 'Moulinex', 'Le riz parfait à chaque fois, avec un maintien au chaud automatique.', 35000, 42000, 'https://images.pexels.com/photos/36552082/pexels-photo-36552082.png?auto=compress&cs=tinysrgb&h=650&w=940', '-17%', 4.6, 21, 14, false, '["5 litres", "Maintien au chaud", "Vapeur"]'::jsonb, '["https://images.pexels.com/photos/36552082/pexels-photo-36552082.png?auto=compress&cs=tinysrgb&h=650&w=940", "https://images.pexels.com/photos/16927363/pexels-photo-16927363.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb, '[{"min_qty": 1, "price_fcfa": 35000}, {"min_qty": 10, "price_fcfa": 32000}]'::jsonb, ARRAY['cuisine', 'promo'], 1, 68, '2026-08-26T10:00:00Z'),
('p16', 'c2', 'Ordinateur portable UltraBook 14', 'ultrabook-14', 'Lenovo', 'Léger, rapide et élégant pour vos tâches professionnelles et étudiantes.', 459000, 499000, 'https://images.pexels.com/photos/18311089/pexels-photo-18311089.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', '-8%', 4.8, 12, 5, true, '["14 pouces", "8 Go RAM", "256 Go SSD"]'::jsonb, '["https://images.pexels.com/photos/18311089/pexels-photo-18311089.jpeg?auto=compress&cs=tinysrgb&h=650&w=940", "https://images.pexels.com/photos/12200696/pexels-photo-12200696.jpeg?auto=compress&cs=tinysrgb&h=650&w=940", "https://images.pexels.com/photos/13012666/pexels-photo-13012666.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb, '[{"min_qty": 1, "price_fcfa": 459000}, {"min_qty": 5, "price_fcfa": 439000}]'::jsonb, ARRAY['informatique', 'nouveau'], 1, 23, NULL),
('p17', 'c5', 'Câble USB-C Tressé 2m', 'cable-usbc-2m', 'Anker', 'Un câble robuste et durable, compatible avec la plupart des appareils récents.', 8000, 12000, 'https://images.pexels.com/photos/4765366/pexels-photo-4765366.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', '-33%', 4.5, 89, 100, false, '["2 mètres", "USB-C", "Tressé nylon"]'::jsonb, '["https://images.pexels.com/photos/4765366/pexels-photo-4765366.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"]'::jsonb, '[{"min_qty": 1, "price_fcfa": 8000}, {"min_qty": 10, "price_fcfa": 6800}, {"min_qty": 50, "price_fcfa": 5500}]'::jsonb, ARRAY['accessoires', 'promo'], 5, 540, '2026-08-25T15:00:00Z')
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  brand = EXCLUDED.brand,
  description = EXCLUDED.description,
  price_fcfa = EXCLUDED.price_fcfa,
  old_price_fcfa = EXCLUDED.old_price_fcfa,
  image_url = EXCLUDED.image_url,
  badge = EXCLUDED.badge,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  stock_count = EXCLUDED.stock_count,
  featured = EXCLUDED.featured,
  specs = EXCLUDED.specs,
  gallery = EXCLUDED.gallery,
  tiered_pricing = EXCLUDED.tiered_pricing,
  tags = EXCLUDED.tags,
  min_order_qty = EXCLUDED.min_order_qty,
  sold_count = EXCLUDED.sold_count,
  deal_ends_at = EXCLUDED.deal_ends_at;

-- Insertion des Avis
INSERT INTO store_reviews (id, product_id, author_name, rating, comment, verified, created_at) VALUES
('r1', 'p1', 'Aminata D.', 5, 'Très bon frigo, silencieux et économique. Livré en 2 jours à Bamako.', true, '2026-08-10T10:00:00Z'),
('r2', 'p1', 'Moussa K.', 4, 'Bonne qualité mais l''emballage était un peu abîmé.', false, '2026-08-08T14:00:00Z'),
('r3', 'p4', 'Fatoumata S.', 5, 'Excellent téléphone, batterie qui dure toute la journée.', true, '2026-08-12T09:00:00Z'),
('r4', 'p4', 'Ibrahim T.', 5, 'Le meilleur rapport qualité-prix du marché.', true, '2026-08-11T16:00:00Z'),
('r5', 'p4', 'Awa C.', 4, 'Très bon appareil, je recommande.', true, '2026-08-09T11:00:00Z'),
('r6', 'p5', 'Modibo S.', 5, 'Produit neuf scellé, livraison rapide. Parfait!', true, '2026-08-13T08:00:00Z'),
('r7', 'p6', 'Oumar D.', 5, 'Image magnifique, l''Android TV change tout.', true, '2026-08-07T13:00:00Z'),
('r8', 'p6', 'Rokia M.', 4, 'Bonne TV mais la notice en anglais seulement.', false, '2026-08-06T15:00:00Z'),
('r9', 'p3', 'Seydou B.', 5, 'Ventilateur puissant, parfait pour la chaleur.', true, '2026-08-05T10:00:00Z'),
('r10', 'p7', 'Nana K.', 4, 'Son excellent mais les bourres tombent parfois.', false, '2026-08-04T12:00:00Z'),
('r11', 'p10', 'Bakary F.', 5, 'Lave-linge performant et silencieux. Je suis ravi.', true, '2026-08-08T09:00:00Z'),
('r12', 'p13', 'Adama S.', 5, 'Indispensable pour les coupures de courant.', true, '2026-08-09T14:00:00Z'),
('r13', 'p13', 'Kadia T.', 5, 'Charge très vite, je recommande.', true, '2026-08-07T11:00:00Z'),
('r14', 'p14', 'Lassana D.', 4, 'Son puissant pour les soirées. Un peu lourd.', true, '2026-08-06T16:00:00Z'),
('r15', 'p16', 'Mariam C.', 5, 'Léger et rapide, parfait pour mes études.', true, '2026-08-10T08:00:00Z'),
('r16', 'p17', 'Yacouba D.', 4, 'Bon câble, solide. La longueur est parfaite.', true, '2026-08-03T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Insertion des Paramètres du site
INSERT INTO site_settings (id, key, value) VALUES
('s1', 'announcement_text', 'Livraison offerte à Bamako dès 250 000 F'),
('s2', 'announcement_phone', '+223 70 00 00 00'),
('s3', 'hero_eyebrow', 'L''équipement qui vous ressemble'),
('s4', 'hero_title', 'La technologie, simplement.'),
('s5', 'hero_description', 'Découvrez une sélection d''électroménager et d''électronique pensée pour votre quotidien au Mali.'),
('s6', 'hero_button', 'Découvrir la boutique'),
('s7', 'hero_trust_count', '+2 000 clients'),
('s8', 'hero_trust_label', 'nous font confiance'),
('s9', 'promo_eyebrow', 'Le bon moment pour s''équiper'),
('s10', 'promo_title', 'Des prix doux. Des envies folles.'),
('s11', 'promo_description', 'Profitez de nos offres spéciales du mois et équipez votre maison sans compromis.'),
('s12', 'promo_button', 'Voir les offres'),
('s13', 'promo_discount', '-20%'),
('s14', 'promo_discount_label', 'sur une sélection'),
('s15', 'footer_tagline', 'Le meilleur de l''équipement pour chaque foyer malien.'),
('s16', 'footer_copyright', '© 2026 Malishop. Fait avec soin à Bamako.'),
('s17', 'admin_password', 'admin2026')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
