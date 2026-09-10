import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Flame, ImageOff, ShoppingBag, Zap } from 'lucide-react';
import type { Product } from '@/lib/types';

const formatPrice = (value: number) => new Intl.NumberFormat('fr-FR').format(value);

type FlashDealsProps = {
  products: Product[];
  title?: string;
  subtitle?: string;
  enabled?: boolean;
  onSelect: (product: Product) => void;
  onAdd: (product: Product) => void;
};

function useCountdown(target: string | null) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!target) return;
    const update = () => {
      const diff = new Date(target).getTime() - Date.now();
      setRemaining(Math.max(0, diff));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [target]);
  if (remaining <= 0) return null;
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return { h, m, s };
}

function DealCard({ product, onSelect, onAdd }: { product: Product; onSelect: () => void; onAdd: () => void }) {
  const [imgError, setImgError] = useState(false);
  const time = useCountdown(product.deal_ends_at);
  const discount = product.old_price_fcfa
    ? Math.round((1 - product.price_fcfa / product.old_price_fcfa) * 100)
    : 0;
  const savings = product.old_price_fcfa ? product.old_price_fcfa - product.price_fcfa : 0;
  const soldPercent = Math.min(100, Math.round((product.sold_count / (product.sold_count + (product.stock_count || 1))) * 100));

  return (
    <article className="flash-card">
      <div className="flash-card-image-wrap" onClick={onSelect} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onSelect()}>
        <div className="flash-card-badges">
          <span className="flash-discount-badge">
            <Flame size={12} fill="currentColor" /> -{discount}%
          </span>
          {product.stock_count <= 5 && product.stock_count > 0 && (
            <span className="flash-urgent-badge">Stock limité</span>
          )}
        </div>

        {!imgError && product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flash-card-placeholder">
            <ImageOff size={32} strokeWidth={1.5} />
            <span>Image indisponible</span>
          </div>
        )}
      </div>

      <div className="flash-card-body">
        <div className="flash-card-top-meta">
          <span className="flash-card-brand">{product.brand}</span>
          {savings > 0 && (
            <span className="flash-savings-pill">Éco. {formatPrice(savings)} F</span>
          )}
        </div>

        <button className="flash-card-title" onClick={onSelect} title={product.name}>
          {product.name}
        </button>

        <div className="flash-price-container">
          <div className="flash-price-row">
            <strong className="flash-price-current">{formatPrice(product.price_fcfa)} <span>FCFA</span></strong>
            {product.old_price_fcfa && (
              <del className="flash-price-old">{formatPrice(product.old_price_fcfa)} F</del>
            )}
          </div>
        </div>

        {/* Barre de stock */}
        <div className="flash-stock-tracker">
          <div className="flash-stock-labels">
            <span>Disponibilité</span>
            <strong>{product.stock_count > 0 ? `${product.stock_count} restants` : 'Rupture'}</strong>
          </div>
          <div className="flash-stock-track">
            <div className="flash-stock-fill" style={{ width: `${Math.max(15, soldPercent)}%` }} />
          </div>
        </div>

        {/* Compte à rebours */}
        {time && (
          <div className="flash-countdown-container">
            <div className="flash-countdown-header">
              <Zap size={12} fill="currentColor" /> Fin de l'offre dans :
            </div>
            <div className="flash-countdown-timer">
              <div className="countdown-unit">
                <strong>{String(time.h).padStart(2, '0')}</strong>
                <small>H</small>
              </div>
              <span className="countdown-sep">:</span>
              <div className="countdown-unit">
                <strong>{String(time.m).padStart(2, '0')}</strong>
                <small>MIN</small>
              </div>
              <span className="countdown-sep">:</span>
              <div className="countdown-unit">
                <strong>{String(time.s).padStart(2, '0')}</strong>
                <small>SEC</small>
              </div>
            </div>
          </div>
        )}

        <button
          className="flash-add-button"
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
        >
          <ShoppingBag size={16} /> Ajouter au panier
        </button>
      </div>
    </article>
  );
}

export function FlashDeals({
  products,
  title = 'Offres Flash Limitées',
  subtitle = 'Profitez des réductions exceptionnelles avant la fin du compte à rebours !',
  enabled = true,
  onSelect,
  onAdd,
}: FlashDealsProps) {
  const dealProducts = products.filter((p) => p.deal_ends_at && p.old_price_fcfa);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  if (!enabled || dealProducts.length === 0) return null;

  const CARD_WIDTH = 272; // px including gap

  const updateNavState = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    updateNavState();
    const handleResize = () => updateNavState();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dealProducts.length]);

  const scroll = (dir: 'prev' | 'next') => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('.flash-card');
    const step = card ? (card.offsetWidth + 20) * 2 : 560;
    el.scrollBy({ left: dir === 'next' ? step : -step, behavior: 'smooth' });
  };

  return (
    <section className="flash-deals-showcase">
      <div className="container">
        {/* En-tête centré */}
        <div className="flash-showcase-header">
          <div className="flash-header-center">
            <div className="flash-pill-badge">
              <Flame size={15} fill="currentColor" className="flame-flicker" /> VENTES FLASH DU MOMENT
            </div>
            <h2 className="flash-showcase-title">{title}</h2>
            {subtitle && <p className="flash-showcase-subtitle">{subtitle}</p>}
          </div>

          {/* Boutons navigation */}
          {(canPrev || canNext) && (
            <div className="flash-nav-buttons">
              <button
                className={`flash-nav-btn${canPrev ? '' : ' flash-nav-btn--disabled'}`}
                onClick={() => scroll('prev')}
                aria-label="Précédent"
                disabled={!canPrev}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className={`flash-nav-btn${canNext ? '' : ' flash-nav-btn--disabled'}`}
                onClick={() => scroll('next')}
                aria-label="Suivant"
                disabled={!canNext}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Carousel Track */}
        <div className="flash-carousel-wrapper">
          <div
            className="flash-cards-track"
            ref={trackRef}
            onScroll={updateNavState}
          >
            {dealProducts.map((p) => (
              <DealCard key={p.id} product={p} onSelect={() => onSelect(p)} onAdd={() => onAdd(p)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
