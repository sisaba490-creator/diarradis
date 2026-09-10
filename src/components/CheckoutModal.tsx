import { Check, ChevronLeft, CreditCard, MapPin, Phone, ShieldCheck, User, UserCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CartItem, Customer, PaymentMethod } from '@/lib/types';
import { WhatsAppIcon, openWhatsAppChat, buildOrderConfirmationMessage } from '@/lib/whatsapp';

const formatPrice = (value: number) => new Intl.NumberFormat('fr-FR').format(value);

type CheckoutModalProps = {
  items: CartItem[];
  customer: Customer | null;
  whatsappPhone?: string;
  onClose: () => void;
  onComplete: (details: {
    customer_id?: string;
    name: string;
    phone: string;
    email: string;
    city: string;
    address: string;
    payment: PaymentMethod;
  }) => Promise<string | null>;
};

export function CheckoutModal({ items, customer, whatsappPhone = '+223 74 79 82 16', onClose, onComplete }: CheckoutModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    city: customer?.city || 'Bamako',
    address: customer?.address || '',
    payment: 'orange_money' as PaymentMethod,
  });

  useEffect(() => {
    if (customer) {
      setForm((current) => ({
        ...current,
        name: customer.name || current.name,
        phone: customer.phone || current.phone,
        email: customer.email || current.email,
        city: customer.city || current.city,
        address: customer.address || current.address,
      }));
    }
  }, [customer]);

  const subtotal = items.reduce((total, item) => total + item.price_fcfa * item.quantity, 0);
  const delivery = form.city === 'Bamako' ? 2500 : 5000;
  const total = subtotal + delivery;

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const result = await onComplete({
      ...form,
      customer_id: customer?.id,
    });

    if (result) {
      setOrderId(result);
      setSubmitted(true);
    } else {
      setError('Impossible de valider la commande. Vérifiez votre connexion et réessayez.');
    }
    setLoading(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="checkout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="checkout-top">
          <button className="back-button" onClick={onClose}>
            <ChevronLeft size={18} /> Retour au panier
          </button>
          <button className="icon-button" onClick={onClose} aria-label="Fermer">
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="success-state">
            <div className="success-icon">
              <Check size={30} />
            </div>
            <p className="eyebrow">Commande confirmée</p>
            <h2>Merci pour votre commande, {form.name.split(' ')[0]} !</h2>
            <p>
              Votre commande <strong>#{orderId.slice(0, 8).toUpperCase()}</strong> a bien été enregistrée
              dans votre compte client. Notre équipe vous contactera au <strong>{form.phone}</strong> pour confirmer la livraison.
            </p>
            <div className="delivery-note">
              <MapPin size={18} />
              <span>Livraison à {form.city} ({form.address}) sous 24 à 48 h</span>
            </div>

            <div className="checkout-whatsapp-box">
              <div className="whatsapp-box-text">
                <strong>📲 Accélérez votre livraison via WhatsApp</strong>
                <p>Envoyez la confirmation directement à notre équipe pour un traitement prioritaire.</p>
              </div>
              <button
                type="button"
                className="whatsapp-confirm-btn"
                onClick={() => {
                  const msg = buildOrderConfirmationMessage({
                    orderId,
                    name: form.name,
                    phone: form.phone,
                    city: form.city,
                    address: form.address,
                    payment: form.payment,
                    total,
                  });
                  openWhatsAppChat(whatsappPhone, msg);
                }}
              >
                <WhatsAppIcon size={18} /> Envoyer ma commande sur WhatsApp
              </button>
            </div>

            <button className="primary-button" onClick={onClose}>
              Retourner à la boutique
            </button>
          </div>
        ) : (
          <>
            <div className="checkout-heading">
              <p className="eyebrow">Dernière étape</p>
              <h2>Finaliser ma commande</h2>
              <p>Livraison rapide et paiement sécurisé au Mali.</p>
            </div>

            {/* Badge Client Connecté */}
            {customer && (
              <div className="checkout-customer-badge">
                <UserCheck size={16} />
                <span>
                  Commande liée au compte de <strong>{customer.name}</strong> ({customer.phone})
                </span>
              </div>
            )}

            <form onSubmit={submit}>
              <div className="form-grid">
                <label>
                  <span><User size={15} /> Nom complet *</span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Votre nom"
                  />
                </label>
                <label>
                  <span><Phone size={15} /> Téléphone *</span>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="70 00 00 00"
                  />
                </label>
              </div>

              <label>
                <span>Adresse e-mail <small>(optionnel)</small></span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="vous@exemple.com"
                />
              </label>

              <div className="form-grid">
                <label>
                  <span><MapPin size={15} /> Ville *</span>
                  <select
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                  >
                    <option>Bamako</option>
                    <option>Sikasso</option>
                    <option>Ségou</option>
                    <option>Kayes</option>
                    <option>Mopti</option>
                  </select>
                </label>
                <label>
                  <span>Quartier / adresse de livraison *</span>
                  <input
                    required
                    value={form.address}
                    onChange={(e) => update('address', e.target.value)}
                    placeholder="Hamdallaye ACI, rue..."
                  />
                </label>
              </div>

              <fieldset>
                <legend><CreditCard size={15} /> Mode de paiement</legend>
                <label className={`payment-option ${form.payment === 'orange_money' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={form.payment === 'orange_money'}
                    onChange={() => update('payment', 'orange_money')}
                  />
                  <span className="payment-logo orange">OM</span>
                  <span>
                    <strong>Orange Money</strong>
                    <small>Paiement mobile sécurisé</small>
                  </span>
                </label>
                <label className={`payment-option ${form.payment === 'moov_money' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={form.payment === 'moov_money'}
                    onChange={() => update('payment', 'moov_money')}
                  />
                  <span className="payment-logo moov">M</span>
                  <span>
                    <strong>Moov Money</strong>
                    <small>Paiement mobile sécurisé</small>
                  </span>
                </label>
                <label className={`payment-option ${form.payment === 'cash_delivery' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    checked={form.payment === 'cash_delivery'}
                    onChange={() => update('payment', 'cash_delivery')}
                  />
                  <span className="payment-logo cash">₣</span>
                  <span>
                    <strong>Paiement à la livraison</strong>
                    <small>Disponible à Bamako</small>
                  </span>
                </label>
              </fieldset>

              {error && <p className="form-error">{error}</p>}

              <div className="checkout-total">
                <div>
                  <span>Sous-total ({items.length} articles)</span>
                  <span>{formatPrice(subtotal)} F</span>
                </div>
                <div>
                  <span>Livraison ({form.city})</span>
                  <span>{formatPrice(delivery)} F</span>
                </div>
                <div className="total-line">
                  <strong>Total à régler</strong>
                  <strong>{formatPrice(total)} F</strong>
                </div>
              </div>

              <button
                disabled={loading}
                className="primary-button full-width"
                type="submit"
              >
                {loading ? 'Validation en cours...' : `Confirmer ma commande · ${formatPrice(total)} F`}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
