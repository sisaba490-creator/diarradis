import { useEffect, useState } from 'react';
import { BadgeCheck, Check, ChevronRight, Minus, Plus, ShoppingCart, Star, Truck, X } from 'lucide-react';
import type { Product, Review } from '@/lib/types';
import { WhatsAppIcon, openWhatsAppChat, buildProductOrderMessage } from '@/lib/whatsapp';

const formatPrice = (value: number) => new Intl.NumberFormat('fr-FR').format(value);

type ProductDetailModalProps = {
  product: Product;
  reviews: Review[];
  relatedProducts: Product[];
  onClose: () => void;
  onAdd: (product: Product, quantity: number) => void;
  onSelectProduct: (product: Product) => void;
  whatsappPhone?: string;
  whatsappOrderEnabled?: boolean;
};

export function ProductDetailModal({
  product,
  reviews,
  relatedProducts,
  onClose,
  onAdd,
  onSelectProduct,
  whatsappPhone = '+223 74 79 82 16',
  whatsappOrderEnabled = true,
}: ProductDetailModalProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(product.min_order_qty);
  const [tab, setTab] = useState<'description' | 'specs' | 'reviews'>('description');

  useEffect(() => { setActiveImage(0); setQuantity(product.min_order_qty); setTab('description'); }, [product.id]);

  useEffect(() => {
    if (product.stock_count > 0 && quantity > product.stock_count) {
      setQuantity(product.stock_count);
    }
  }, [product.stock_count]);

  const gallery = product.gallery.length > 0 ? product.gallery : [product.image_url];
  const productReviews = reviews.filter((r) => r.product_id === product.id);
  const avgRating = productReviews.length > 0 ? (productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length).toFixed(1) : product.rating;
  const tiered = product.tiered_pricing.length > 1 ? [...product.tiered_pricing].sort((a, b) => a.min_qty - b.min_qty) : [];
  const currentPrice = tiered.length > 0
    ? tiered.slice().reverse().find((t) => quantity >= t.min_qty)?.price_fcfa ?? product.price_fcfa
    : product.price_fcfa;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="product-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Bouton de fermeture positionné en haut à droite */}
        <button className="modal-close" onClick={onClose} aria-label="Fermer la fenêtre">
          <X size={20} />
        </button>

        <div className="detail-grid">
          <div className="detail-gallery">
            <div className="detail-main-image">
              <img src={gallery[activeImage]} alt={product.name} />
              {product.badge && <span className="detail-badge">{product.badge}</span>}
            </div>
            {gallery.length > 1 && (
              <div className="detail-thumbs">
                {gallery.map((src, i) => (
                  <button key={i} className={`detail-thumb-btn ${i === activeImage ? 'active' : ''}`} onClick={() => setActiveImage(i)}>
                    <img src={src} alt={`${product.name} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="detail-info">
            <span className="product-brand-tag">{product.brand}</span>
            <h2 className="detail-title">{product.name}</h2>
            
            <div className="detail-rating">
              <div className="stars-row">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={15} fill={s <= Math.round(Number(avgRating)) ? '#f59e0b' : 'none'} color="#f59e0b" />
                ))}
              </div>
              <strong className="rating-num">{avgRating}</strong>
              <span className="review-count">({productReviews.length || product.review_count} avis)</span>
              <span className="sold-count">· {product.sold_count} vendus</span>
            </div>

            <div className="detail-price-block">
              <strong className="detail-price">{formatPrice(currentPrice)} FCFA</strong>
              {product.old_price_fcfa && <del className="detail-old-price">{formatPrice(product.old_price_fcfa)} FCFA</del>}
              {product.old_price_fcfa && (
                <span className="detail-savings">
                  Économisez {formatPrice(product.old_price_fcfa - product.price_fcfa)} F
                </span>
              )}
            </div>

            {tiered.length > 0 && (
              <div className="tiered-pricing-box">
                <p className="tiered-title">✨ Prix dégressifs par quantité</p>
                <div className="tiered-grid">
                  {tiered.map((t) => (
                    <div className={`tier-chip ${quantity >= t.min_qty ? 'active' : ''}`} key={t.min_qty}>
                      <span className="tier-qty">{t.min_qty}+ unités</span>
                      <strong className="tier-price">{formatPrice(t.price_fcfa)} F</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-stock-row">
              {product.stock_count > 0 ? (
                <div className="stock-badge in-stock">
                  <span className="stock-dot pulse-dot" />
                  <span>En stock ({product.stock_count} disponibles)</span>
                </div>
              ) : (
                <div className="stock-badge out-of-stock">
                  <span className="stock-dot out" />
                  <span>Rupture de stock temporaire</span>
                </div>
              )}
              {product.min_order_qty > 1 && (
                <span className="min-order-pill">Min. {product.min_order_qty} unités</span>
              )}
            </div>

            <div className="detail-actions">
              <div className="quantity-picker">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(product.min_order_qty, quantity - 1))}
                  aria-label="Diminuer la quantité"
                >
                  <Minus size={15} />
                </button>
                <span className="qty-value">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock_count, quantity + 1))}
                  aria-label="Augmenter la quantité"
                >
                  <Plus size={15} />
                </button>
              </div>

              <button
                className="primary-button detail-add-btn"
                onClick={() => { onAdd(product, quantity); onClose(); }}
              >
                <ShoppingCart size={18} /> Ajouter au panier
              </button>

              {whatsappOrderEnabled && (
                <button
                  type="button"
                  className="whatsapp-order-btn"
                  onClick={() => {
                    const msg = buildProductOrderMessage(product, quantity, currentPrice);
                    openWhatsAppChat(whatsappPhone, msg);
                  }}
                  title="Commander directement via WhatsApp"
                >
                  <WhatsAppIcon size={18} />
                  <span>Commander sur WhatsApp</span>
                </button>
              )}
            </div>

            <div className="detail-trust-cards">
              <div className="trust-card">
                <div className="trust-icon"><Truck size={18} /></div>
                <div>
                  <strong>Livraison express</strong>
                  <small>24-48h à Bamako & régions</small>
                </div>
              </div>
              <div className="trust-card">
                <div className="trust-icon"><BadgeCheck size={18} /></div>
                <div>
                  <strong>Produit 100% garanti</strong>
                  <small>Qualité vérifiée & certifiée</small>
                </div>
              </div>
              <div className="trust-card">
                <div className="trust-icon"><Check size={18} /></div>
                <div>
                  <strong>Paiement sécurisé</strong>
                  <small>Orange Money, Moov ou Espèces</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-tabs">
          <div className="tab-headers">
            <button className={tab === 'description' ? 'active' : ''} onClick={() => setTab('description')}>Description</button>
            <button className={tab === 'specs' ? 'active' : ''} onClick={() => setTab('specs')}>Spécifications</button>
            <button className={tab === 'reviews' ? 'active' : ''} onClick={() => setTab('reviews')}>Avis ({productReviews.length || product.review_count})</button>
          </div>
          <div className="tab-content">
            {tab === 'description' && <p className="detail-description">{product.description}</p>}
            {tab === 'specs' && (
              <ul className="detail-spec-list">
                {product.specs.map((s) => <li key={s}><Check size={14} /> {s}</li>)}
              </ul>
            )}
            {tab === 'reviews' && (
              <div className="reviews-list">
                {productReviews.length === 0 ? (
                  <p className="no-reviews">Aucun avis pour le moment. Soyez le premier à donner votre avis!</p>
                ) : (
                  productReviews.map((r) => (
                    <div className="review-item" key={r.id}>
                      <div className="review-avatar">{r.author_name.charAt(0)}</div>
                      <div className="review-body">
                        <div className="review-top">
                          <strong>{r.author_name}</strong>
                          {r.verified && <span className="verified-badge"><Check size={11} /> Achat vérifié</span>}
                        </div>
                        <div className="review-stars">{[1,2,3,4,5].map((s) => <Star key={s} size={11} fill={s <= r.rating ? 'currentColor' : 'none'} />)}</div>
                        <p>{r.comment}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="related-products">
            <h3>Produits similaires</h3>
            <div className="related-grid">
              {relatedProducts.slice(0, 4).map((p) => (
                <button className="related-card" key={p.id} onClick={() => onSelectProduct(p)}>
                  <img src={p.image_url} alt={p.name} />
                  <span className="related-brand">{p.brand}</span>
                  <strong>{p.name}</strong>
                  <span className="related-price">{formatPrice(p.price_fcfa)} F</span>
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
