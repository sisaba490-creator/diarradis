export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  accent: string;
  sort_order: number;
};

export type Brand = {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
  visible?: boolean;
};

export type TieredPrice = { min_qty: number; price_fcfa: number };

export type Product = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  brand: string;
  description: string;
  price_fcfa: number;
  old_price_fcfa: number | null;
  image_url: string;
  badge: string | null;
  rating: number;
  review_count: number;
  stock_count: number;
  featured: boolean;
  specs: string[];
  gallery: string[];
  tiered_pricing: TieredPrice[];
  tags: string[];
  min_order_qty: number;
  sold_count: number;
  deal_ends_at: string | null;
};

export type Review = {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  comment: string;
  verified: boolean;
  created_at: string;
};

export type CartItem = Product & { quantity: number };

export type PaymentMethod = 'orange_money' | 'moov_money' | 'cash_delivery';

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  city: string;
  address: string;
  created_at?: string;
};
