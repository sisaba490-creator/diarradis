import type { Brand, Category, Product, Review } from './types';

export const demoCategories: Category[] = [
  { id: 'c1', name: 'Électroménager', slug: 'electromenager', description: 'La maison, plus simple', icon: 'Refrigerator', accent: 'blue', sort_order: 1 },
  { id: 'c2', name: 'Téléphonie', slug: 'telephonie', description: 'Restez connecté', icon: 'Smartphone', accent: 'green', sort_order: 2 },
  { id: 'c3', name: 'Audio & Image', slug: 'audio-image', description: 'Le meilleur du divertissement', icon: 'Headphones', accent: 'yellow', sort_order: 3 },
  { id: 'c4', name: 'Cuisine', slug: 'cuisine', description: 'Le plaisir de bien faire', icon: 'CookingPot', accent: 'orange', sort_order: 4 },
  { id: 'c5', name: 'Accessoires', slug: 'accessoires', description: 'Les essentiels au quotidien', icon: 'Cable', accent: 'teal', sort_order: 5 },
];

export const demoBrands: Brand[] = [
  { id: 'b1', name: 'Anker', visible: true, description: 'Accessoires de charge et batteries haute capacité' },
  { id: 'b2', name: 'Apple', visible: true, description: 'Smartphones iPhone et produits haut de gamme' },
  { id: 'b3', name: 'Binatone', visible: true, description: 'Ventilation et petit électroménager robuste' },
  { id: 'b4', name: 'Hisense', visible: true, description: 'Réfrigérateurs et téléviseurs de qualité' },
  { id: 'b5', name: 'JBL', visible: true, description: 'Enceintes et casques audio performants' },
  { id: 'b6', name: 'LG', visible: true, description: 'Électroménager premium et lavage' },
  { id: 'b7', name: 'Lenovo', visible: true, description: 'Ordinateurs portables et tablettes' },
  { id: 'b8', name: 'Midea', visible: true, description: 'Cuisinières, fours et micro-ondes fiables' },
  { id: 'b9', name: 'Moulinex', visible: true, description: 'Robots culinaires, mixeurs et cuiseurs de riz' },
  { id: 'b10', name: 'Samsung', visible: true, description: 'Smartphones Galaxy, TV et climatisation' },
  { id: 'b11', name: 'TCL', visible: true, description: 'Smart TV 4K et affichage connecté' },
];

const img = {
  fridge: 'https://images.pexels.com/photos/5556176/pexels-photo-5556176.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ac: 'https://images.pexels.com/photos/27333871/pexels-photo-27333871.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  fan: 'https://images.pexels.com/photos/10450623/pexels-photo-10450623.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  samsung: 'https://images.pexels.com/photos/18311092/pexels-photo-18311092.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  iphone: 'https://images.pexels.com/photos/947407/pexels-photo-947407.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  tv: 'https://images.pexels.com/photos/9646752/pexels-photo-9646752.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  buds: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  stove: 'https://images.pexels.com/photos/16927367/pexels-photo-16927367.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  blender: 'https://images.pexels.com/photos/18205656/pexels-photo-18205656.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  washer: 'https://images.pexels.com/photos/5816934/pexels-photo-5816934.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  washer2: 'https://images.pexels.com/photos/12104070/pexels-photo-12104070.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  washer3: 'https://images.pexels.com/photos/28479466/pexels-photo-28479466.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  microwave: 'https://images.pexels.com/photos/16927363/pexels-photo-16927363.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  tablet: 'https://images.pexels.com/photos/18205642/pexels-photo-18205642.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  tablet2: 'https://images.pexels.com/photos/29765798/pexels-photo-29765798.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  powerbank: 'https://images.pexels.com/photos/4765366/pexels-photo-4765366.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  speaker: 'https://images.pexels.com/photos/29581125/pexels-photo-29581125.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  speaker2: 'https://images.pexels.com/photos/12502430/pexels-photo-12502430.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ricecooker: 'https://images.pexels.com/photos/36552082/pexels-photo-36552082.png?auto=compress&cs=tinysrgb&h=650&w=940',
  laptop: 'https://images.pexels.com/photos/18311089/pexels-photo-18311089.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  laptop2: 'https://images.pexels.com/photos/12200696/pexels-photo-12200696.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  laptop3: 'https://images.pexels.com/photos/13012666/pexels-photo-13012666.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  cable: 'https://images.pexels.com/photos/4765366/pexels-photo-4765366.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
};

const base = (overrides: Partial<Product> & Pick<Product, 'id' | 'category_id' | 'name' | 'slug' | 'brand' | 'description' | 'price_fcfa' | 'image_url' | 'rating' | 'review_count' | 'stock_count'>): Product => ({
  old_price_fcfa: null,
  badge: null,
  featured: false,
  specs: [],
  gallery: [],
  tiered_pricing: [],
  tags: [],
  min_order_qty: 1,
  sold_count: 0,
  deal_ends_at: null,
  ...overrides,
});

export const demoProducts: Product[] = [
  base({ id: 'p1', category_id: 'c1', name: 'Réfrigérateur SmartCool 320L', slug: 'smartcool-320l', brand: 'Hisense', description: 'Conservez vos aliments avec une fraîcheur optimale et une consommation maîtrisée.', price_fcfa: 489000, old_price_fcfa: 559000, image_url: img.fridge, badge: '-13%', rating: 4.9, review_count: 24, stock_count: 8, featured: true, specs: ['320 litres', 'No Frost', 'Garantie 2 ans'], gallery: [img.fridge], tiered_pricing: [{ min_qty: 1, price_fcfa: 489000 }, { min_qty: 3, price_fcfa: 465000 }], tags: ['promo', 'electromenager'], sold_count: 134 }),
  base({ id: 'p2', category_id: 'c1', name: 'Climatiseur FreshAir 1.5 CV', slug: 'freshair-15cv', brand: 'Samsung', description: 'Une fraîcheur silencieuse et efficace, pensée pour les chaleurs de Bamako.', price_fcfa: 365000, old_price_fcfa: 399000, image_url: img.ac, badge: 'Populaire', rating: 4.8, review_count: 18, stock_count: 12, featured: true, specs: ['1.5 CV', 'Mode éco', 'Installation incluse'], gallery: [img.ac], tiered_pricing: [{ min_qty: 1, price_fcfa: 365000 }], tags: ['electromenager'], sold_count: 76 }),
  base({ id: 'p3', category_id: 'c1', name: 'Ventilateur Breeze Pro 16 pouces', slug: 'breeze-pro-16', brand: 'Binatone', description: 'Puissant, silencieux et facile à déplacer dans toutes les pièces.', price_fcfa: 59000, old_price_fcfa: 69000, image_url: img.fan, badge: '-14%', rating: 4.7, review_count: 31, stock_count: 22, featured: true, specs: ['3 vitesses', 'Oscillation 90°', 'Télécommande'], gallery: [img.fan], tiered_pricing: [{ min_qty: 1, price_fcfa: 59000 }, { min_qty: 5, price_fcfa: 55000 }], tags: ['promo'], sold_count: 210 }),
  base({ id: 'p4', category_id: 'c2', name: 'Smartphone Galaxy A55 5G', slug: 'galaxy-a55-5g', brand: 'Samsung', description: 'Un écran lumineux et une caméra polyvalente pour capturer chaque moment.', price_fcfa: 229000, old_price_fcfa: 259000, image_url: img.samsung, badge: 'Nouveau', rating: 4.9, review_count: 42, stock_count: 15, featured: true, specs: ['256 Go', '8 Go RAM', 'Batterie 5000 mAh'], gallery: [img.samsung], tiered_pricing: [{ min_qty: 1, price_fcfa: 229000 }, { min_qty: 10, price_fcfa: 215000 }], tags: ['nouveau', 'telephonie'], sold_count: 89 }),
  base({ id: 'p5', category_id: 'c2', name: 'iPhone 13 128 Go', slug: 'iphone-13-128', brand: 'Apple', description: 'La puissance et la fiabilité Apple, disponible avec livraison rapide à Bamako.', price_fcfa: 399000, old_price_fcfa: 449000, image_url: img.iphone, badge: 'Meilleure vente', rating: 4.9, review_count: 56, stock_count: 6, featured: true, specs: ['128 Go', 'Double SIM', 'Garantie 1 an'], gallery: [img.iphone], tiered_pricing: [{ min_qty: 1, price_fcfa: 399000 }], tags: ['telephonie'], sold_count: 167 }),
  base({ id: 'p6', category_id: 'c3', name: 'Smart TV LED 55 pouces 4K', slug: 'smart-tv-55-4k', brand: 'TCL', description: 'Transformez votre salon en véritable salle de cinéma.', price_fcfa: 349000, old_price_fcfa: 399000, image_url: img.tv, badge: '-12%', rating: 4.8, review_count: 27, stock_count: 9, featured: true, specs: ['55 pouces', '4K UHD', 'Android TV'], gallery: [img.tv], tiered_pricing: [{ min_qty: 1, price_fcfa: 349000 }], tags: ['promo', 'audio'], sold_count: 54 }),
  base({ id: 'p7', category_id: 'c3', name: 'Écouteurs WaveBuds Pro', slug: 'wavebuds-pro', brand: 'JBL', description: 'Un son immersif et une autonomie qui vous accompagne toute la journée.', price_fcfa: 45000, old_price_fcfa: 55000, image_url: img.buds, badge: '-18%', rating: 4.6, review_count: 39, stock_count: 34, featured: false, specs: ['Bluetooth 5.3', 'ANC', '24 h autonomie'], gallery: [img.buds], tiered_pricing: [{ min_qty: 1, price_fcfa: 45000 }, { min_qty: 5, price_fcfa: 41000 }], tags: ['promo', 'audio'], sold_count: 198 }),
  base({ id: 'p8', category_id: 'c4', name: 'Cuisinière Gaz 4 Feux Inox', slug: 'cuisiniere-gaz-4-feux', brand: 'Midea', description: 'Préparez vos meilleurs plats avec une cuisinière robuste et élégante.', price_fcfa: 179000, old_price_fcfa: 199000, image_url: img.stove, rating: 4.7, review_count: 16, stock_count: 11, specs: ['4 feux', 'Four intégré', 'Acier inoxydable'], gallery: [img.stove], tiered_pricing: [{ min_qty: 1, price_fcfa: 179000 }], tags: ['cuisine'], sold_count: 43 }),
  base({ id: 'p9', category_id: 'c4', name: 'Mixeur PowerBlend 1000W', slug: 'powerblend-1000w', brand: 'Moulinex', description: 'Des smoothies onctueux et des préparations rapides en quelques secondes.', price_fcfa: 39000, old_price_fcfa: 49000, image_url: img.blender, badge: '-20%', rating: 4.6, review_count: 22, stock_count: 19, specs: ['1000 W', 'Bol 1.5 L', '3 programmes'], gallery: [img.blender], tiered_pricing: [{ min_qty: 1, price_fcfa: 39000 }], tags: ['promo', 'cuisine'], sold_count: 87 }),
  base({ id: 'p10', category_id: 'c1', name: 'Lave-linge AutoWash 8kg', slug: 'autowash-8kg', brand: 'LG', description: 'Un lavage silencieux et économique, parfait pour les familles maliennes.', price_fcfa: 289000, old_price_fcfa: 329000, image_url: img.washer, badge: '-12%', rating: 4.8, review_count: 19, stock_count: 7, featured: true, specs: ['8 kg', '1400 tr/min', 'Classe A++'], gallery: [img.washer, img.washer2, img.washer3], tiered_pricing: [{ min_qty: 1, price_fcfa: 289000 }, { min_qty: 3, price_fcfa: 275000 }], tags: ['promo', 'electromenager'], sold_count: 134, deal_ends_at: '2026-08-25T23:59:00Z' }),
  base({ id: 'p11', category_id: 'c1', name: 'Micro-ondes HeatWave 25L', slug: 'heatwave-25l', brand: 'Midea', description: 'Réchauffez et décongelez vos plats en un clin d\'œil avec 10 niveaux de puissance.', price_fcfa: 89000, old_price_fcfa: 109000, image_url: img.microwave, badge: '-18%', rating: 4.6, review_count: 28, stock_count: 16, specs: ['25 litres', '10 niveaux', 'Décongélation auto'], gallery: [img.microwave, img.fridge], tiered_pricing: [{ min_qty: 1, price_fcfa: 89000 }, { min_qty: 5, price_fcfa: 82000 }], tags: ['promo', 'cuisine'], sold_count: 87, deal_ends_at: '2026-08-25T18:00:00Z' }),
  base({ id: 'p12', category_id: 'c2', name: 'Tablette TabMax 10 pouces', slug: 'tabmax-10', brand: 'Samsung', description: 'Un grand écran pour le travail, les études et le divertissement.', price_fcfa: 179000, old_price_fcfa: 199000, image_url: img.tablet, badge: 'Nouveau', rating: 4.7, review_count: 14, stock_count: 10, featured: true, specs: ['10 pouces', '64 Go', 'WiFi + 4G'], gallery: [img.tablet, img.tablet2], tiered_pricing: [{ min_qty: 1, price_fcfa: 179000 }, { min_qty: 10, price_fcfa: 165000 }], tags: ['nouveau', 'telephonie'], sold_count: 42 }),
  base({ id: 'p13', category_id: 'c2', name: 'PowerBank TurboCharge 20000mAh', slug: 'turbocharge-20k', brand: 'Anker', description: 'Ne tombez plus jamais en panne d\'énergie, que vous soyez à Bamako ou en déplacement.', price_fcfa: 25000, old_price_fcfa: 32000, image_url: img.powerbank, badge: '-22%', rating: 4.8, review_count: 67, stock_count: 40, specs: ['20000 mAh', 'Charge rapide 18W', '2 ports USB'], gallery: [img.powerbank, img.iphone], tiered_pricing: [{ min_qty: 1, price_fcfa: 25000 }, { min_qty: 5, price_fcfa: 22500 }, { min_qty: 20, price_fcfa: 21000 }], tags: ['promo', 'accessoires'], sold_count: 312, deal_ends_at: '2026-08-25T12:00:00Z' }),
  base({ id: 'p14', category_id: 'c3', name: 'Enceinte BoomBox XL', slug: 'boombox-xl', brand: 'JBL', description: 'Une puissance sonore impressionnante pour vos soirées et vos sorties en plein air.', price_fcfa: 69000, old_price_fcfa: 79000, image_url: img.speaker, badge: '-13%', rating: 4.7, review_count: 33, stock_count: 18, featured: true, specs: ['30 W', 'Étanche IP67', '12 h autonomie'], gallery: [img.speaker, img.speaker2], tiered_pricing: [{ min_qty: 1, price_fcfa: 69000 }, { min_qty: 3, price_fcfa: 64000 }], tags: ['audio', 'promo'], sold_count: 95, deal_ends_at: '2026-08-25T20:00:00Z' }),
  base({ id: 'p15', category_id: 'c4', name: 'Cuiseur de riz RiceMaster 5L', slug: 'ricemaster-5l', brand: 'Moulinex', description: 'Le riz parfait à chaque fois, avec un maintien au chaud automatique.', price_fcfa: 35000, old_price_fcfa: 42000, image_url: img.ricecooker, badge: '-17%', rating: 4.6, review_count: 21, stock_count: 14, specs: ['5 litres', 'Maintien au chaud', 'Vapeur'], gallery: [img.ricecooker, img.microwave], tiered_pricing: [{ min_qty: 1, price_fcfa: 35000 }, { min_qty: 10, price_fcfa: 32000 }], tags: ['cuisine', 'promo'], sold_count: 68, deal_ends_at: '2026-08-26T10:00:00Z' }),
  base({ id: 'p16', category_id: 'c2', name: 'Ordinateur portable UltraBook 14', slug: 'ultrabook-14', brand: 'Lenovo', description: 'Léger, rapide et élégant pour vos tâches professionnelles et étudiantes.', price_fcfa: 459000, old_price_fcfa: 499000, image_url: img.laptop, badge: '-8%', rating: 4.8, review_count: 12, stock_count: 5, featured: true, specs: ['14 pouces', '8 Go RAM', '256 Go SSD'], gallery: [img.laptop, img.laptop2, img.laptop3], tiered_pricing: [{ min_qty: 1, price_fcfa: 459000 }, { min_qty: 5, price_fcfa: 439000 }], tags: ['informatique', 'nouveau'], sold_count: 23 }),
  base({ id: 'p17', category_id: 'c5', name: 'Câble USB-C Tressé 2m', slug: 'cable-usbc-2m', brand: 'Anker', description: 'Un câble robuste et durable, compatible avec la plupart des appareils récents.', price_fcfa: 8000, old_price_fcfa: 12000, image_url: img.cable, badge: '-33%', rating: 4.5, review_count: 89, stock_count: 100, specs: ['2 mètres', 'USB-C', 'Tressé nylon'], gallery: [img.cable], tiered_pricing: [{ min_qty: 1, price_fcfa: 8000 }, { min_qty: 10, price_fcfa: 6800 }, { min_qty: 50, price_fcfa: 5500 }], tags: ['accessoires', 'promo'], min_order_qty: 5, sold_count: 540, deal_ends_at: '2026-08-25T15:00:00Z' }),
];

export const demoReviews: Review[] = [
  { id: 'r1', product_id: 'p1', author_name: 'Aminata D.', rating: 5, comment: 'Très bon frigo, silencieux et économique. Livré en 2 jours à Bamako.', verified: true, created_at: '2026-08-10T10:00:00Z' },
  { id: 'r2', product_id: 'p1', author_name: 'Moussa K.', rating: 4, comment: 'Bonne qualité mais l\'emballage était un peu abîmé.', verified: false, created_at: '2026-08-08T14:00:00Z' },
  { id: 'r3', product_id: 'p4', author_name: 'Fatoumata S.', rating: 5, comment: 'Excellent téléphone, batterie qui dure toute la journée.', verified: true, created_at: '2026-08-12T09:00:00Z' },
  { id: 'r4', product_id: 'p4', author_name: 'Ibrahim T.', rating: 5, comment: 'Le meilleur rapport qualité-prix du marché.', verified: true, created_at: '2026-08-11T16:00:00Z' },
  { id: 'r5', product_id: 'p4', author_name: 'Awa C.', rating: 4, comment: 'Très bon appareil, je recommande.', verified: true, created_at: '2026-08-09T11:00:00Z' },
  { id: 'r6', product_id: 'p5', author_name: 'Modibo S.', rating: 5, comment: 'Produit neuf scellé, livraison rapide. Parfait!', verified: true, created_at: '2026-08-13T08:00:00Z' },
  { id: 'r7', product_id: 'p6', author_name: 'Oumar D.', rating: 5, comment: 'Image magnifique, l\'Android TV change tout.', verified: true, created_at: '2026-08-07T13:00:00Z' },
  { id: 'r8', product_id: 'p6', author_name: 'Rokia M.', rating: 4, comment: 'Bonne TV mais la notice en anglais seulement.', verified: false, created_at: '2026-08-06T15:00:00Z' },
  { id: 'r9', product_id: 'p3', author_name: 'Seydou B.', rating: 5, comment: 'Ventilateur puissant, parfait pour la chaleur.', verified: true, created_at: '2026-08-05T10:00:00Z' },
  { id: 'r10', product_id: 'p7', author_name: 'Nana K.', rating: 4, comment: 'Son excellent mais les bourres tombent parfois.', verified: false, created_at: '2026-08-04T12:00:00Z' },
  { id: 'r11', product_id: 'p10', author_name: 'Bakary F.', rating: 5, comment: 'Lave-linge performant et silencieux. Je suis ravi.', verified: true, created_at: '2026-08-08T09:00:00Z' },
  { id: 'r12', product_id: 'p13', author_name: 'Adama S.', rating: 5, comment: 'Indispensable pour les coupures de courant.', verified: true, created_at: '2026-08-09T14:00:00Z' },
  { id: 'r13', product_id: 'p13', author_name: 'Kadia T.', rating: 5, comment: 'Charge très vite, je recommande.', verified: true, created_at: '2026-08-07T11:00:00Z' },
  { id: 'r14', product_id: 'p14', author_name: 'Lassana D.', rating: 4, comment: 'Son puissant pour les soirées. Un peu lourd.', verified: true, created_at: '2026-08-06T16:00:00Z' },
  { id: 'r15', product_id: 'p16', author_name: 'Mariam C.', rating: 5, comment: 'Léger et rapide, parfait pour mes études.', verified: true, created_at: '2026-08-10T08:00:00Z' },
  { id: 'r16', product_id: 'p17', author_name: 'Yacouba D.', rating: 4, comment: 'Bon câble, solide. La longueur est parfaite.', verified: true, created_at: '2026-08-03T10:00:00Z' },
];

export const demoOrders = [
  {
    id: 'CMD-8492',
    customer_name: 'Moussa Keïta',
    phone: '+223 76 12 34 56',
    email: 'moussa.keita@gmail.com',
    city: 'Bamako (ACI 2000)',
    address: 'Rue 340, Porte 12',
    payment_method: 'orange_money',
    subtotal_fcfa: 365000,
    delivery_fcfa: 2500,
    total_fcfa: 367500,
    status: 'paid',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    items: [
      { product_id: 'p2', product_name: 'Climatiseur FreshAir 1.5 CV', unit_price_fcfa: 365000, quantity: 1 }
    ]
  },
  {
    id: 'CMD-8491',
    customer_name: 'Fatoumata Coulibaly',
    phone: '+223 65 98 74 12',
    email: 'fatou.coulibaly@yahoo.fr',
    city: 'Bamako (Badalabougou)',
    address: 'Près du Palais de la Culture',
    payment_method: 'cash_delivery',
    subtotal_fcfa: 229000,
    delivery_fcfa: 2500,
    total_fcfa: 231500,
    status: 'delivered',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    items: [
      { product_id: 'p4', product_name: 'Smartphone Galaxy A55 5G', unit_price_fcfa: 229000, quantity: 1 }
    ]
  },
  {
    id: 'CMD-8490',
    customer_name: 'Ibrahim Touré',
    phone: '+223 70 45 67 89',
    email: 'i.toure@outlook.com',
    city: 'Sikasso',
    address: 'Quartier Wayerma 1',
    payment_method: 'moov_money',
    subtotal_fcfa: 124000,
    delivery_fcfa: 5000,
    total_fcfa: 129000,
    status: 'shipped',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    items: [
      { product_id: 'p11', product_name: 'Micro-ondes HeatWave 25L', unit_price_fcfa: 89000, quantity: 1 },
      { product_id: 'p15', product_name: 'Cuiseur de riz RiceMaster 5L', unit_price_fcfa: 35000, quantity: 1 }
    ]
  },
  {
    id: 'CMD-8489',
    customer_name: 'Aminata Diarra',
    phone: '+223 79 11 22 33',
    email: 'aminata.d@gmail.com',
    city: 'Bamako (Hamdallaye)',
    address: 'Immeuble Diarra, Appt 4',
    payment_method: 'cash_delivery',
    subtotal_fcfa: 489000,
    delivery_fcfa: 2500,
    total_fcfa: 491500,
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    items: [
      { product_id: 'p1', product_name: 'Réfrigérateur SmartCool 320L', unit_price_fcfa: 489000, quantity: 1 }
    ]
  },
  {
    id: 'CMD-8488',
    customer_name: 'Ousmane Traoré',
    phone: '+223 66 33 22 11',
    email: 'ousmane.traore@gmail.com',
    city: 'Bamako (Korofina)',
    address: 'Rue 120, Porte 5',
    payment_method: 'orange_money',
    subtotal_fcfa: 94000,
    delivery_fcfa: 2500,
    total_fcfa: 96500,
    status: 'delivered',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    items: [
      { product_id: 'p14', product_name: 'Enceinte BoomBox XL', unit_price_fcfa: 69000, quantity: 1 },
      { product_id: 'p13', product_name: 'PowerBank TurboCharge 20000mAh', unit_price_fcfa: 25000, quantity: 1 }
    ]
  }
];

