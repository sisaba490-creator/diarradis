import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import type { CartItem, Customer } from '@/lib/types';
import { WhatsAppIcon, openWhatsAppChat, buildCartOrderMessage } from '@/lib/whatsapp';

const formatPrice = (value: number) => new Intl.NumberFormat('fr-FR').format(value);

type CartDrawerProps = {
  items: CartItem[];
  customer?: Customer | null;
  whatsappPhone?: string;
  whatsappOrderEnabled?: boolean;
  onClose: () => void;
  onChangeQuantity: (id: string, quantity: number) => void;
  onCheckout: () => void;
};

export function CartDrawer({
  items,
  customer,
  whatsappPhone = '+223 74 79 82 16',
  whatsappOrderEnabled = true,
  onClose,
  onChangeQuantity,
  onCheckout,
}: CartDrawerProps) {
  const subtotal = items.reduce((total, item) => total + item.price_fcfa * item.quantity, 0);
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="cart-drawer" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <p className="eyebrow">Votre sélection</p>
            <h2>Panier <span>{items.length}</span></h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Fermer"><X size={20} /></button>
        </div>
        {items.length === 0 ? (
          <div className="empty-cart">
            <ShoppingBag size={42} />
            <h3>Votre panier est vide</h3>
            <p>Découvrez nos meilleures offres pour équiper votre maison.</p>
            <button className="primary-button" onClick={onClose}>Continuer mes achats</button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img src={item.image_url} alt={item.name} />
                  <div className="cart-item-details">
                    <p className="product-brand">{item.brand}</p>
                    <h3>{item.name}</h3>
                    <strong>{formatPrice(item.price_fcfa)} F</strong>
                    <div className="quantity-control">
                      <button onClick={() => onChangeQuantity(item.id, item.quantity - 1)} aria-label="Diminuer"><Minus size={14} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => onChangeQuantity(item.id, item.quantity + 1)} aria-label="Augmenter"><Plus size={14} /></button>
                      <button className="remove-button" onClick={() => onChangeQuantity(item.id, 0)} aria-label="Supprimer"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              <div>
                <span>Sous-total</span>
                <strong>{formatPrice(subtotal)} F</strong>
              </div>
              <p>Livraison calculée à l’étape suivante</p>
              <div className="cart-action-buttons">
                <button className="primary-button full-width" onClick={onCheckout}>
                  Passer la commande <span>→</span>
                </button>
                {whatsappOrderEnabled && (
                  <button
                    type="button"
                    className="whatsapp-cart-btn full-width"
                    onClick={() => {
                      const msg = buildCartOrderMessage(items, subtotal, customer);
                      openWhatsAppChat(whatsappPhone, msg);
                    }}
                    title="Envoyer la sélection du panier sur WhatsApp"
                  >
                    <WhatsAppIcon size={18} /> Commander via WhatsApp
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
