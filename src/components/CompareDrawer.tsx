import { Check, GitCompare, X } from 'lucide-react';
import type { Product } from '@/lib/types';

const formatPrice = (value: number) => new Intl.NumberFormat('fr-FR').format(value);

type CompareDrawerProps = {
  items: Product[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
};

export function CompareDrawer({ items, onRemove, onClear, onClose }: CompareDrawerProps) {
  if (items.length === 0) return null;

  return (
    <div className="compare-bar">
      <div className="compare-bar-inner">
        <div className="compare-items">
          {items.map((item) => (
            <div className="compare-thumb" key={item.id}>
              <img src={item.image_url} alt={item.name} />
              <button className="compare-remove" onClick={() => onRemove(item.id)} aria-label="Retirer"><X size={13} /></button>
              <span>{item.name.length > 22 ? item.name.slice(0, 22) + '…' : item.name}</span>
            </div>
          ))}
          {items.length < 4 && (
            <div className="compare-slot">
              <span>+</span>
              <small>Ajouter ({items.length}/4)</small>
            </div>
          )}
        </div>
        <div className="compare-actions">
          <button className="text-button" onClick={onClear}>Tout effacer</button>
          <button className="primary-button" onClick={onClose}>
            <GitCompare size={16} /> Comparer ({items.length})
          </button>
        </div>
      </div>
    </div>
  );
}

type CompareModalProps = {
  items: Product[];
  onClose: () => void;
  onRemove: (id: string) => void;
};

export function CompareModal({ items, onClose, onRemove }: CompareModalProps) {
  const rows: { label: string; get: (p: Product) => React.ReactNode }[] = [
    { label: 'Prix', get: (p) => <strong className="compare-price">{formatPrice(p.price_fcfa)} F</strong> },
    { label: 'Ancien prix', get: (p) => p.old_price_fcfa ? `${formatPrice(p.old_price_fcfa)} F` : '—' },
    { label: 'Marque', get: (p) => p.brand },
    { label: 'Note', get: (p) => `${p.rating} ★ (${p.review_count})` },
    { label: 'Stock', get: (p) => p.stock_count > 0 ? `${p.stock_count} dispo` : 'Rupture' },
    { label: 'Vendus', get: (p) => `${p.sold_count}` },
    { label: 'Spécifications', get: (p) => <ul className="compare-specs">{p.specs.map((s) => <li key={s}><Check size={11} /> {s}</li>)}</ul> },
    { label: 'Commande min.', get: (p) => `${p.min_order_qty} unité${p.min_order_qty > 1 ? 's' : ''}` },
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="compare-modal" onClick={(e) => e.stopPropagation()}>
        <div className="compare-modal-header">
          <h2>Comparaison produits</h2>
          <button className="icon-button" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th></th>
                {items.map((p) => (
                  <th key={p.id}>
                    <button className="compare-remove-icon" onClick={() => onRemove(p.id)}><X size={14} /></button>
                    <img src={p.image_url} alt={p.name} />
                    <span className="compare-brand">{p.brand}</span>
                    <strong>{p.name}</strong>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <td className="compare-label">{row.label}</td>
                  {items.map((p) => (
                    <td key={p.id}>{row.get(p)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
