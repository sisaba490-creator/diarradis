import { GitCompare, Heart, ImageOff, ShoppingBag, Star } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '@/lib/types';

const formatPrice = (value: number) => new Intl.NumberFormat('fr-FR').format(value);

type ProductCardProps = {
  product: Product;
  isFavorite: boolean;
  isCompared: boolean;
  onFavorite: () => void;
  onAdd: () => void;
  onSelect: () => void;
  onCompare: () => void;
};

export function ProductCard({ product, isFavorite, isCompared, onFavorite, onAdd, onSelect, onCompare }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  const discount = product.old_price_fcfa
    ? Math.round((1 - product.price_fcfa / product.old_price_fcfa) * 100)
    : 0;

  return (
    <article className="product-card group">
      <div className="product-image-wrap" onClick={onSelect} role="button" tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && onSelect()}>
        {product.badge && <span className="product-badge">{product.badge}</span>}
        {discount > 0 && !product.badge && <span className="product-badge deal">-{discount}%</span>}
        <div className="card-actions">
          <button className={`card-action ${isFavorite ? 'is-favorite' : ''}`} onClick={(event) => { event.stopPropagation(); onFavorite(); }} aria-label="Ajouter aux favoris">
            <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button className={`card-action ${isCompared ? 'is-compared' : ''}`} onClick={(event) => { event.stopPropagation(); onCompare(); }} aria-label="Comparer">
            <GitCompare size={15} />
          </button>
        </div>

        {/* Image avec fallback élégant si erreur de chargement */}
        {!imgError && product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="img-placeholder">
            <ImageOff size={32} strokeWidth={1.5} />
            <span>Image non disponible</span>
          </div>
        )}

        <button className="quick-add" onClick={(event) => { event.stopPropagation(); onAdd(); }}>
          <ShoppingBag size={16} /> Ajouter au panier
        </button>
      </div>
      <div className="product-info">
        <p className="product-brand">{product.brand}</p>
        <button className="product-name" onClick={onSelect}>{product.name}</button>
        <div className="rating-row"><Star size={13} fill="currentColor" /><span>{product.rating}</span><span className="review-count">({product.review_count})</span><span className="sold-count">· {product.sold_count} vendus</span></div>
        <div className="price-row"><strong>{formatPrice(product.price_fcfa)} F</strong>{product.old_price_fcfa && <del>{formatPrice(product.old_price_fcfa)} F</del>}</div>
      </div>
    </article>
  );
}
