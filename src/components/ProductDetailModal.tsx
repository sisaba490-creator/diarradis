import { useEffect, useState } from 'react';
import {
  BadgeCheck,
  Check,
  ChevronRight,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  X,
  Zap,
} from 'lucide-react';
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
  const [quantity, setQuantity] = useState(product.min_order_qty || 1);
  const [tab, setTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [addedAnim, setAddedAnim] = useState(false);

  useEffect(() => {
    setActiveImage(0);
    setQuantity(product.min_order_qty || 1);
    setTab('description');
  }, [product.id, product.min_order_qty]);

  useEffect(() => {
    if (product.stock_count > 0 && quantity > product.stock_count) {
      setQuantity(product.stock_count);
    }
  }, [product.stock_count, quantity]);

  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image_url];
  const productReviews = reviews.filter((r) => r.product_id === product.id);
  const avgRating = productReviews.length > 0
    ? (productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length).toFixed(1)
    : product.rating;
  const tiered = product.tiered_pricing && product.tiered_pricing.length > 1
    ? [...product.tiered_pricing].sort((a, b) => a.min_qty - b.min_qty)
    : [];
  const currentPrice = tiered.length > 0
    ? tiered.slice().reverse().find((t) => quantity >= t.min_qty)?.price_fcfa ?? product.price_fcfa
    : product.price_fcfa;
  const discountPercent = product.old_price_fcfa && product.old_price_fcfa > product.price_fcfa
    ? Math.round(((product.old_price_fcfa - product.price_fcfa) / product.old_price_fcfa) * 100)
    : 0;
  const savingsAmount = product.old_price_fcfa && product.old_price_fcfa > currentPrice
    ? product.old_price_fcfa - currentPrice
    : 0;

  const handleAddToCart = () => {
    onAdd(product, quantity);
    setAddedAnim(true);
    setTimeout(() => {
      setAddedAnim(false);
      onClose();
    }, 700);
  };

  return (
    <div className="modal-backdrop pdm-backdrop" onClick={onClose}>
      <section className="product-detail-modal pdm-container" onClick={(e) => e.stopPropagation()}>
        {/* Bouton Fermer stylé en haut à droite */}
        <button className="modal-close pdm-close-btn" onClick={onClose} aria-label="Fermer la fenêtre">
          <X size={18} />
        </button>

        {/* Corps principal : Galerie + Infos Produit */}
        <div className="pdm-main-grid">
          {/* Colonne de gauche : Galerie Visuelle */}
          <div className="pdm-gallery-col">
            <div className="pdm-image-stage">
              {/* Badges sur l'image */}
              <div className="pdm-image-badges">
                {discountPercent > 0 && (
                  <span className="pdm-badge-discount">
                    -{discountPercent}%
                  </span>
                )}
                {product.badge && (
                  <span className="pdm-badge-promo">
                    <Sparkles size={12} /> {product.badge}
                  </span>
                )}
              </div>

              <img
                className="pdm-featured-image"
                src={gallery[activeImage] || product.image_url}
                alt={product.name}
              />
            </div>

            {/* Miniatures */}
            {gallery.length > 1 && (
              <div className="pdm-thumbnails-row">
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`pdm-thumb-btn ${i === activeImage ? 'active' : ''}`}
                    onClick={() => setActiveImage(i)}
                    aria-label={`Afficher photo ${i + 1}`}
                  >
                    <img src={src} alt={`${product.name} vue ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}

            {/* Réassurance sous l'image */}
            <div className="pdm-gallery-guarantees">
              <div className="pdm-guarantee-tag">
                <Truck size={13} />
                <span>Livraison express Bamako</span>
              </div>
              <div className="pdm-guarantee-tag">
                <ShieldCheck size={13} />
                <span>Paiement à la réception</span>
              </div>
            </div>
          </div>

          {/* Colonne de droite : Détails, Prix & Action d'Achat */}
          <div className="pdm-details-col">
            {/* Tag Marque & Catégorie */}
            <div className="pdm-meta-row">
              <span className="pdm-brand-pill">{product.brand || 'Original'}</span>
              {product.featured && <span className="pdm-featured-pill">⭐ Coup de cœur</span>}
            </div>

            {/* Titre du produit */}
            <h1 className="pdm-product-title">{product.name}</h1>

            {/* Note, Avis et Ventes */}
            <div className="pdm-rating-strip">
              <div className="pdm-stars-group">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={15}
                    fill={s <= Math.round(Number(avgRating)) ? '#f59e0b' : 'none'}
                    color="#f59e0b"
                  />
                ))}
              </div>
              <strong className="pdm-rating-score">{avgRating}</strong>
              <span className="pdm-reviews-link">({productReviews.length || product.review_count} avis)</span>
              <span className="pdm-sep-dot">•</span>
              <span className="pdm-sold-badge">{product.sold_count} vendus</span>
            </div>

            {/* Bloc Prix & Économies Hero */}
            <div className="pdm-price-hero">
              <div className="pdm-price-main-line">
                <div className="pdm-price-display">
                  <span className="pdm-price-val">{formatPrice(currentPrice)}</span>
                  <span className="pdm-price-unit">FCFA</span>
                </div>
                {product.old_price_fcfa && (
                  <del className="pdm-price-old">{formatPrice(product.old_price_fcfa)} FCFA</del>
                )}
              </div>

              {savingsAmount > 0 && (
                <div className="pdm-savings-badge">
                  <Zap size={13} />
                  <span>Vous économisez {formatPrice(savingsAmount)} FCFA</span>
                </div>
              )}
            </div>

            {/* Tarifs dégressifs (gros/semi-gros) */}
            {tiered.length > 0 && (
              <div className="pdm-tiered-container">
                <div className="pdm-tiered-header">
                  <Sparkles size={14} />
                  <span>Tarifs avantageux par quantité :</span>
                </div>
                <div className="pdm-tiered-cards">
                  {tiered.map((t) => (
                    <div
                      key={t.min_qty}
                      className={`pdm-tiered-card ${quantity >= t.min_qty ? 'is-active' : ''}`}
                    >
                      <span className="pdm-tiered-qty">{t.min_qty}+ unités</span>
                      <strong className="pdm-tiered-price">{formatPrice(t.price_fcfa)} F</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Statut Stock & Commande Minimum */}
            <div className="pdm-stock-strip">
              {product.stock_count > 0 ? (
                <div className="pdm-stock-pill in-stock">
                  <span className="pdm-stock-dot pulse-dot" />
                  <span>En stock ({product.stock_count} unités disponibles)</span>
                </div>
              ) : (
                <div className="pdm-stock-pill out-of-stock">
                  <span className="pdm-stock-dot out" />
                  <span>Rupture de stock temporaire</span>
                </div>
              )}

              {product.min_order_qty > 1 && (
                <span className="pdm-min-order-tag">
                  <Package size={12} /> Min. {product.min_order_qty} unités
                </span>
              )}
            </div>

            {/* ═══ SECTION ACTIONS D'ACHAT (ESPACE DÉDIÉ SANS OVERFLOW) ═══ */}
            <div className="pdm-purchase-actions">
              {/* Ligne 1 : Quantité + Bouton Ajouter au Panier */}
              <div className="pdm-actions-row">
                <div className="pdm-qty-control">
                  <button
                    type="button"
                    className="pdm-qty-btn"
                    onClick={() => setQuantity(Math.max(product.min_order_qty || 1, quantity - 1))}
                    aria-label="Diminuer la quantité"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="pdm-qty-number">{quantity}</span>
                  <button
                    type="button"
                    className="pdm-qty-btn"
                    onClick={() => {
                      if (product.stock_count > 0) {
                        setQuantity(Math.min(product.stock_count, quantity + 1));
                      } else {
                        setQuantity(quantity + 1);
                      }
                    }}
                    aria-label="Augmenter la quantité"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <button
                  type="button"
                  className={`pdm-add-cart-btn ${addedAnim ? 'is-added' : ''}`}
                  onClick={handleAddToCart}
                  disabled={addedAnim}
                >
                  {addedAnim ? (
                    <>
                      <Check size={18} className="pdm-spin-icon" />
                      <span>Ajouté au panier !</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      <span>Ajouter au panier</span>
                    </>
                  )}
                </button>
              </div>

              {/* Ligne 2 : Bouton Pleine Largeur WhatsApp */}
              {whatsappOrderEnabled && (
                <button
                  type="button"
                  className="pdm-whatsapp-action-btn"
                  onClick={() => {
                    const msg = buildProductOrderMessage(product, quantity, currentPrice);
                    openWhatsAppChat(whatsappPhone, msg);
                  }}
                  title="Commander directement sans inscription sur WhatsApp"
                >
                  <div className="pdm-wa-icon-wrap">
                    <WhatsAppIcon size={20} />
                  </div>
                  <div className="pdm-wa-text-group">
                    <span className="pdm-wa-main-text">Commander sur WhatsApp</span>
                    <span className="pdm-wa-sub-text">Réponse instantanée • En 1 clic</span>
                  </div>
                </button>
              )}
            </div>

            {/* Badges de Confiance 3 Colonnes */}
            <div className="pdm-trust-grid">
              <div className="pdm-trust-card">
                <div className="pdm-trust-icon-box">
                  <Truck size={17} />
                </div>
                <div className="pdm-trust-texts">
                  <strong>Livraison express</strong>
                  <small>24–48h Bamako & régions</small>
                </div>
              </div>

              <div className="pdm-trust-card">
                <div className="pdm-trust-icon-box">
                  <BadgeCheck size={17} />
                </div>
                <div className="pdm-trust-texts">
                  <strong>Produit 100% garanti</strong>
                  <small>Qualité vérifiée & certifiée</small>
                </div>
              </div>

              <div className="pdm-trust-card">
                <div className="pdm-trust-icon-box">
                  <ShieldCheck size={17} />
                </div>
                <div className="pdm-trust-texts">
                  <strong>Paiement sécurisé</strong>
                  <small>Orange Money, Moov, Espèces</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ ONGLETS DÉTAILS (Description / Spécifications / Avis) ═══ */}
        <div className="pdm-tabs-wrapper">
          <div className="pdm-tab-navigation">
            <button
              type="button"
              className={`pdm-tab-item ${tab === 'description' ? 'is-active' : ''}`}
              onClick={() => setTab('description')}
            >
              Description
            </button>
            <button
              type="button"
              className={`pdm-tab-item ${tab === 'specs' ? 'is-active' : ''}`}
              onClick={() => setTab('specs')}
            >
              Spécifications {product.specs && product.specs.length > 0 && `(${product.specs.length})`}
            </button>
            <button
              type="button"
              className={`pdm-tab-item ${tab === 'reviews' ? 'is-active' : ''}`}
              onClick={() => setTab('reviews')}
            >
              Avis clients ({productReviews.length || product.review_count})
            </button>
          </div>

          <div className="pdm-tab-panel">
            {tab === 'description' && (
              <div className="pdm-tab-description">
                <p>{product.description || "Aucune description détaillée n'est disponible pour ce produit."}</p>
              </div>
            )}

            {tab === 'specs' && (
              <div className="pdm-tab-specs">
                {product.specs && product.specs.length > 0 ? (
                  <ul className="pdm-specs-list">
                    {product.specs.map((s, idx) => (
                      <li key={idx}>
                        <Check size={14} className="pdm-spec-check" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="pdm-empty-text">Aucune spécification technique renseignée.</p>
                )}
              </div>
            )}

            {tab === 'reviews' && (
              <div className="pdm-tab-reviews">
                {productReviews.length === 0 ? (
                  <div className="pdm-no-reviews-box">
                    <div className="pdm-stars-group">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={20} fill="#f59e0b" color="#f59e0b" />
                      ))}
                    </div>
                    <p>Soyez le premier à commander et donner votre avis sur ce produit !</p>
                  </div>
                ) : (
                  <div className="pdm-reviews-list">
                    {productReviews.map((r) => (
                      <div className="pdm-review-item" key={r.id}>
                        <div className="pdm-review-avatar">
                          {r.author_name ? r.author_name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div className="pdm-review-content">
                          <div className="pdm-review-header">
                            <strong>{r.author_name}</strong>
                            {r.verified && (
                              <span className="pdm-verified-pill">
                                <Check size={11} /> Achat vérifié
                              </span>
                            )}
                          </div>
                          <div className="pdm-review-stars">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={12}
                                fill={s <= r.rating ? '#f59e0b' : 'none'}
                                color="#f59e0b"
                              />
                            ))}
                          </div>
                          <p className="pdm-review-text">{r.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ═══ PRODUITS SIMILAIRES ═══ */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="pdm-related-section">
            <h3 className="pdm-related-heading">Produits similaires recommandés</h3>
            <div className="pdm-related-grid">
              {relatedProducts.slice(0, 4).map((p) => (
                <button
                  type="button"
                  className="pdm-related-card"
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                >
                  <div className="pdm-related-img-container">
                    <img src={p.image_url} alt={p.name} loading="lazy" />
                  </div>
                  <div className="pdm-related-info">
                    <span className="pdm-related-brand">{p.brand}</span>
                    <strong className="pdm-related-title">{p.name}</strong>
                    <div className="pdm-related-bottom">
                      <span className="pdm-related-price">{formatPrice(p.price_fcfa)} FCFA</span>
                      <ChevronRight size={15} className="pdm-related-arrow" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
