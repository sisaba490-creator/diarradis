import { 
  Banknote, 
  Check, 
  CheckCircle2, 
  ChevronLeft, 
  Clock, 
  Copy, 
  CreditCard, 
  Lock, 
  Mail, 
  MapPin, 
  Package, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  Truck, 
  User, 
  UserCheck, 
  X 
} from 'lucide-react';
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

const PAYMENT_METHODS: {
  id: PaymentMethod;
  name: string;
  badge?: string;
  description: string;
  tag: string;
  iconBg: string;
  iconColor: string;
}[] = [
  {
    id: 'orange_money',
    name: 'Orange Money',
    badge: 'Populaire',
    description: 'Paiement mobile instantané & sécurisé',
    tag: 'OM',
    iconBg: 'linear-gradient(135deg, #ff7900 0%, #ea580c 100%)',
    iconColor: '#ffffff',
  },
  {
    id: 'moov_money',
    name: 'Moov Money',
    description: 'Flooz — Paiement mobile Moov Africa',
    tag: 'M',
    iconBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    iconColor: '#ffffff',
  },
  {
    id: 'cash_delivery',
    name: 'Espèces à la livraison',
    badge: 'Sans avance',
    description: 'Payez en main propre à la réception du colis',
    tag: '₣',
    iconBg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    iconColor: '#ffffff',
  },
];

export function CheckoutModal({ items, customer, whatsappPhone = '+223 74 79 82 16', onClose, onComplete }: CheckoutModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
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

  const handleCopyOrderId = () => {
    if (!orderId) return;
    const formatted = `#CMD-${orderId.slice(0, 8).toUpperCase()}`;
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        {/* Barre supérieure de navigation */}
        <div className="checkout-top">
          {!submitted ? (
            <button className="back-button" onClick={onClose}>
              <ChevronLeft size={17} /> <span>Retour au panier</span>
            </button>
          ) : (
            <div className="checkout-badge-confirmed">
              <Sparkles size={15} /> <span>Commande confirmée</span>
            </div>
          )}
          <button className="checkout-close-btn" onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          /* ═══════════════════════════════════════════════════════════════
             ÉTAT CONFIRMATION DE COMMANDE (IMAGE 1 REDESSINÉE)
             ═══════════════════════════════════════════════════════════════ */
          <div className="success-state">
            {/* Icône de succès animée */}
            <div className="success-hero">
              <div className="success-icon-badge">
                <CheckCircle2 size={44} strokeWidth={2.4} />
              </div>
              <span className="success-eyebrow">
                <Sparkles size={14} /> Confirmation officielle
              </span>
              <h2>Merci pour votre commande, {form.name.split(' ')[0]} !</h2>
              <p className="success-subtitle">
                Votre commande a bien été enregistrée. Notre équipe prépare votre colis avec soin.
              </p>
            </div>

            {/* Reçu de commande électronique élégant */}
            <div className="order-receipt-card">
              <div className="receipt-header">
                <div>
                  <span className="receipt-label">Numéro de commande</span>
                  <div className="receipt-id-row">
                    <strong>#CMD-{orderId.slice(0, 8).toUpperCase()}</strong>
                    <button 
                      type="button" 
                      className="copy-id-btn" 
                      onClick={handleCopyOrderId}
                      title="Copier le numéro"
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copied ? 'Copié !' : 'Copier'}</span>
                    </button>
                  </div>
                </div>
                <div className="receipt-status-pill">
                  <span className="pulse-dot"></span>
                  <span>En préparation</span>
                </div>
              </div>

              <div className="receipt-divider"></div>

              <div className="receipt-grid">
                <div className="receipt-field">
                  <span className="receipt-field-title">
                    <User size={13} /> Client
                  </span>
                  <strong>{form.name}</strong>
                </div>

                <div className="receipt-field">
                  <span className="receipt-field-title">
                    <Phone size={13} /> Téléphone
                  </span>
                  <strong>{form.phone}</strong>
                </div>

                <div className="receipt-field full">
                  <span className="receipt-field-title">
                    <MapPin size={13} /> Lieu de livraison
                  </span>
                  <strong>{form.city} ({form.address})</strong>
                  <small className="receipt-delivery-time">
                    <Clock size={12} /> Livraison estimée sous 24 à 48 heures
                  </small>
                </div>

                <div className="receipt-field">
                  <span className="receipt-field-title">
                    <CreditCard size={13} /> Mode de paiement
                  </span>
                  <strong>
                    {form.payment === 'orange_money' ? 'Orange Money' : form.payment === 'moov_money' ? 'Moov Money' : 'Espèces à la livraison'}
                  </strong>
                </div>

                <div className="receipt-field">
                  <span className="receipt-field-title">
                    <Package size={13} /> Montant total TTC
                  </span>
                  <strong className="receipt-total-amount">{formatPrice(total)} F CFA</strong>
                </div>
              </div>
            </div>

            {/* Carte Accélération WhatsApp Prioritaire */}
            <div className="checkout-whatsapp-card">
              <div className="whatsapp-card-badge">
                <WhatsAppIcon size={18} />
                <span>Traitement Express Garanti</span>
              </div>
              <div className="whatsapp-card-content">
                <h3>Accélérez votre livraison sur WhatsApp</h3>
                <p>
                  Transmettez instantanément votre confirmation à notre équipe de livraison pour bloquer votre article en stock et prioriser son expédition.
                </p>
                <button
                  type="button"
                  className="whatsapp-primary-btn"
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
                  <WhatsAppIcon size={20} />
                  <span>Envoyer ma commande sur WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Bouton de retour à la boutique */}
            <div className="success-footer-actions">
              <button className="primary-button full-width success-return-btn" onClick={onClose}>
                Continuer mes achats
              </button>
              <p className="success-help-hint">
                Besoin d'aide ? Appelez notre assistance commerciale au <strong>{whatsappPhone}</strong>
              </p>
            </div>
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════════
             FORMULAIRE DE COMMANDE (IMAGE 2 REDESSINÉE)
             ═══════════════════════════════════════════════════════════════ */
          <>
            {/* Stepper moderne */}
            <div className="checkout-stepper">
              <div className="step done">
                <span className="step-circle"><Check size={12} /></span>
                <span className="step-label">Panier</span>
              </div>
              <div className="step-line active"></div>
              <div className="step active">
                <span className="step-circle">2</span>
                <span className="step-label">Coordonnées & Livraison</span>
              </div>
              <div className="step-line"></div>
              <div className="step">
                <span className="step-circle">3</span>
                <span className="step-label">Confirmation</span>
              </div>
            </div>

            {/* Titre et sous-titre */}
            <div className="checkout-heading">
              <h2>Finaliser ma commande</h2>
              <p>Livraison express 24-48h et paiement 100% sécurisé au Mali.</p>
            </div>

            {/* Badge Client Connecté */}
            {customer && (
              <div className="checkout-customer-badge">
                <div className="badge-avatar">
                  <UserCheck size={16} />
                </div>
                <div className="badge-text">
                  <span>Commande liée à votre compte :</span>
                  <strong>{customer.name} ({customer.phone})</strong>
                </div>
                <span className="badge-tag">Pré-rempli</span>
              </div>
            )}

            <form onSubmit={submit} className="checkout-form">
              {/* Section 1 : Informations de livraison */}
              <div className="checkout-form-section">
                <div className="section-title">
                  <Truck size={17} />
                  <span>1. Coordonnées & Lieu de livraison</span>
                </div>

                <div className="form-grid">
                  <label>
                    <span><User size={14} /> Nom complet *</span>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      placeholder="Ex : Amadou Diarra"
                    />
                  </label>
                  <label>
                    <span><Phone size={14} /> Téléphone *</span>
                    <div className="phone-input-wrap">
                      <span className="phone-prefix">🇲🇱 +223</span>
                      <input
                        required
                        type="tel"
                        value={form.phone.replace(/^\+223\s*/, '')}
                        onChange={(e) => update('phone', e.target.value)}
                        placeholder="74 79 82 16"
                      />
                    </div>
                  </label>
                </div>

                <label>
                  <span><Mail size={14} /> Adresse e-mail <small>(Optionnel — pour le reçu numérique)</small></span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="amadou@exemple.com"
                  />
                </label>

                <div className="form-grid">
                  <label>
                    <span><MapPin size={14} /> Ville *</span>
                    <select
                      value={form.city}
                      onChange={(e) => update('city', e.target.value)}
                    >
                      <option value="Bamako">Bamako (Livraison 2 500 F)</option>
                      <option value="Sikasso">Sikasso (Livraison 5 000 F)</option>
                      <option value="Ségou">Ségou (Livraison 5 000 F)</option>
                      <option value="Kayes">Kayes (Livraison 5 000 F)</option>
                      <option value="Mopti">Mopti (Livraison 5 000 F)</option>
                    </select>
                  </label>
                  <label>
                    <span>Quartier / Adresse précise *</span>
                    <input
                      required
                      value={form.address}
                      onChange={(e) => update('address', e.target.value)}
                      placeholder="Ex : Hamdallaye ACI, rue 320"
                    />
                  </label>
                </div>
              </div>

              {/* Section 2 : Mode de paiement */}
              <div className="checkout-form-section">
                <div className="section-title">
                  <CreditCard size={17} />
                  <span>2. Mode de paiement</span>
                </div>

                <div className="payment-options-grid">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = form.payment === method.id;
                    return (
                      <div
                        key={method.id}
                        className={`payment-option-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => update('payment', method.id)}
                      >
                        <div className="payment-radio-indicator">
                          <div className={`radio-dot ${isSelected ? 'active' : ''}`}></div>
                        </div>

                        <div 
                          className="payment-icon-box"
                          style={{ background: method.iconBg, color: method.iconColor }}
                        >
                          {method.id === 'cash_delivery' ? <Banknote size={17} /> : method.tag}
                        </div>

                        <div className="payment-text-box">
                          <div className="payment-name-row">
                            <strong>{method.name}</strong>
                            {method.badge && <span className="payment-pill">{method.badge}</span>}
                          </div>
                          <small>{method.description}</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3 : Récapitulatif Articles & Total */}
              <div className="checkout-summary-section">
                <div className="section-title">
                  <Package size={17} />
                  <span>3. Récapitulatif de vos articles ({items.length})</span>
                </div>

                <div className="checkout-items-preview">
                  {items.map((it) => (
                    <div className="checkout-item-row" key={it.id}>
                      <img src={it.image_url} alt={it.name} className="checkout-item-img" />
                      <div className="checkout-item-info">
                        <span className="checkout-item-name">{it.name}</span>
                        <span className="checkout-item-qty">Qté : {it.quantity}</span>
                      </div>
                      <strong className="checkout-item-price">
                        {formatPrice(it.price_fcfa * it.quantity)} F
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="checkout-price-breakdown">
                  <div className="breakdown-row">
                    <span>Sous-total articles</span>
                    <span>{formatPrice(subtotal)} F</span>
                  </div>
                  <div className="breakdown-row">
                    <span>Frais de livraison ({form.city})</span>
                    <span>{formatPrice(delivery)} F</span>
                  </div>
                  <div className="breakdown-row total-row">
                    <div>
                      <strong>Total net à payer</strong>
                      <small>Toutes taxes comprises</small>
                    </div>
                    <strong className="total-highlight">{formatPrice(total)} F CFA</strong>
                  </div>
                </div>
              </div>

              {error && <div className="checkout-form-error">{error}</div>}

              {/* Bouton de confirmation principal */}
              <button
                disabled={loading}
                className="checkout-submit-btn"
                type="submit"
              >
                {loading ? (
                  <span>Validation en cours...</span>
                ) : (
                  <>
                    <Lock size={18} />
                    <span>Confirmer ma commande · {formatPrice(total)} F CFA</span>
                  </>
                )}
              </button>

              {/* Badges de réassurance */}
              <div className="checkout-trust-row">
                <div className="trust-item">
                  <ShieldCheck size={15} /> <span>Paiement sécurisé</span>
                </div>
                <div className="trust-item">
                  <Truck size={15} /> <span>Livraison express 24-48h</span>
                </div>
                <div className="trust-item">
                  <Phone size={15} /> <span>Support joignable 7j/7</span>
                </div>
              </div>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
