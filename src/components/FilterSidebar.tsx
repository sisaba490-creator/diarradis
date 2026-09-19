import { SlidersHorizontal, X } from 'lucide-react';
import type { Brand, Product } from '@/lib/types';

const formatPrice = (value: number) => new Intl.NumberFormat('fr-FR').format(value);

export type FilterState = {
  brands: string[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  inStockOnly: boolean;
  onSaleOnly: boolean;
};

type FilterSidebarProps = {
  products: Product[];
  managedBrands?: Brand[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  isOpen: boolean;
  onClose: () => void;
};

export function FilterSidebar({ products, managedBrands, filters, onChange, isOpen, onClose }: FilterSidebarProps) {
  // Si des marques gérées existent, on n'affiche que les visibles qui ont des produits
  // Sinon, on déduit les marques des produits automatiquement
  const allBrands: string[] = managedBrands && managedBrands.length > 0
    ? managedBrands.filter((b) => b.visible !== false).map((b) => b.name).sort()
    : [...new Set(products.map((p) => p.brand))].sort();
  const priceMax = products.length > 0
    ? Math.max(...products.map((p) => p.price_fcfa || 0), 500000)
    : 500000;

  const toggleBrand = (brand: string) => {
    const brands = filters.brands.includes(brand)
      ? filters.brands.filter((b) => b !== brand)
      : [...filters.brands, brand];
    onChange({ ...filters, brands });
  };

  return (
    <>
      {isOpen && <div className="filter-backdrop" onClick={onClose} />}
      <aside className={`filter-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="filter-header">
          <h3><SlidersHorizontal size={18} /> Filtres</h3>
          <button className="icon-button" onClick={onClose} aria-label="Fermer"><X size={18} /></button>
        </div>

        <div className="filter-section">
          <h4>Marques</h4>
          <div className="filter-checkboxes">
            {allBrands.map((brand) => {
              const managed = managedBrands?.find((b) => b.name === brand);
              return (
                <label key={brand}>
                  <input type="checkbox" checked={filters.brands.includes(brand)} onChange={() => toggleBrand(brand)} />
                  {managed?.logo_url && (
                    <img
                      src={managed.logo_url}
                      alt={brand}
                      className="filter-brand-logo"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                  <span>{brand}</span>
                  <small className="brand-count">{products.filter((p) => p.brand === brand).length}</small>
                </label>
              );
            })}
          </div>
        </div>

        <div className="filter-section">
          <h4>Prix maximum</h4>
          <input
            type="range"
            min={0}
            max={priceMax}
            step={5000}
            value={Math.min(filters.maxPrice ?? priceMax, priceMax)}
            onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
            className="price-slider"
          />
          <div className="price-range-labels">
            <span>0 F</span>
            <strong>{formatPrice(Math.min(filters.maxPrice ?? priceMax, priceMax))} F</strong>
          </div>
        </div>

        <div className="filter-section">
          <h4>Note minimum</h4>
          <div className="rating-filter">
            {[0, 3, 4, 4.5].map((r) => (
              <button
                key={r}
                className={filters.minRating === r ? 'active' : ''}
                onClick={() => onChange({ ...filters, minRating: r })}
              >
                {r === 0 ? 'Toutes' : `${r}+ ★`}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h4>Disponibilité</h4>
          <label className="filter-toggle">
            <input type="checkbox" checked={filters.inStockOnly} onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })} />
            <span>En stock uniquement</span>
          </label>
          <label className="filter-toggle">
            <input type="checkbox" checked={filters.onSaleOnly} onChange={(e) => onChange({ ...filters, onSaleOnly: e.target.checked })} />
            <span>En promotion uniquement</span>
          </label>
        </div>

        <button
          className="primary-button full-width filter-reset"
          onClick={() => onChange({ brands: [], minPrice: 0, maxPrice: priceMax, minRating: 0, inStockOnly: false, onSaleOnly: false })}
        >
          Réinitialiser les filtres
        </button>
      </aside>
    </>
  );
}
