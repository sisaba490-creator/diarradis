import type { CartItem, Customer, Product } from './types';
export { WhatsAppIcon } from '@/components/WhatsAppIcon';

// Formatage du prix en FCFA
const formatPrice = (value: number) => new Intl.NumberFormat('fr-FR').format(value);

/**
 * Nettoie et normalise un numéro de téléphone pour l'URL wa.me
 * Si le numéro a 8 chiffres (standard malien ex: 74798216), on ajoute l'indicatif 223.
 */
export function cleanWhatsAppPhone(phone: string): string {
  if (!phone) return '22374798216';
  // Retirer tout ce qui n'est pas un chiffre
  let digits = phone.replace(/\D/g, '');
  
  // Si le numéro commence par 00223, enlever 00
  if (digits.startsWith('00223')) {
    digits = digits.substring(2);
  }
  
  // Si numéro à 8 chiffres (ex: 74798216, 76123456), ajouter l'indicatif Mali (223)
  if (digits.length === 8) {
    digits = '223' + digits;
  }
  
  return digits || '22374798216';
}

/**
 * Génère une URL directe WhatsApp
 */
export function buildWhatsAppUrl(phone: string, message?: string): string {
  const cleanPhone = cleanWhatsAppPhone(phone);
  const baseUrl = `https://wa.me/${cleanPhone}`;
  if (message && message.trim()) {
    return `${baseUrl}?text=${encodeURIComponent(message.trim())}`;
  }
  return baseUrl;
}

/**
 * Ouvre directement WhatsApp dans un nouvel onglet
 */
export function openWhatsAppChat(phone: string, message?: string) {
  const url = buildWhatsAppUrl(phone, message);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Génère le message WhatsApp pour la commande d'un produit individuel
 */
export function buildProductOrderMessage(product: Product, quantity: number, unitPrice: number): string {
  const total = quantity * unitPrice;
  return `Bonjour DIARRA Distribution, 👋

Je souhaite commander le produit suivant :
🛍️ *Produit :* ${product.name}
🏷️ *Marque :* ${product.brand}
🔢 *Quantité :* ${quantity}
💰 *Prix unitaire :* ${formatPrice(unitPrice)} FCFA
💵 *Total estimé :* ${formatPrice(total)} FCFA

Pouvez-vous me confirmer la disponibilité et les modalités de livraison ? Merci !`;
}

/**
 * Génère le message WhatsApp pour la commande de tout le panier
 */
export function buildCartOrderMessage(items: CartItem[], total: number, customer?: Customer | null): string {
  const itemsText = items
    .map((item, index) => `${index + 1}. *${item.name}* (x${item.quantity}) — ${formatPrice(item.price_fcfa * item.quantity)} FCFA`)
    .join('\n');

  let text = `Bonjour DIARRA Distribution, 👋

Je souhaite passer commande pour les articles suivants de mon panier :

${itemsText}

━━━━━━━━━━━━━━━━━━━
💰 *Total de la sélection :* ${formatPrice(total)} FCFA`;

  if (customer) {
    text += `\n👤 *Client :* ${customer.name}\n📞 *Téléphone :* ${customer.phone}`;
    if (customer.city) text += `\n📍 *Ville :* ${customer.city}`;
    if (customer.address) text += ` (${customer.address})`;
  }

  text += `\n\nMerci de me confirmer la commande et le délai de livraison !`;
  return text;
}

/**
 * Génère le message WhatsApp de confirmation d'une commande passée sur le site
 */
export function buildOrderConfirmationMessage(details: {
  orderId: string;
  name: string;
  phone: string;
  city: string;
  address: string;
  payment: string;
  total: number;
}): string {
  const paymentLabels: Record<string, string> = {
    orange_money: 'Orange Money',
    moov_money: 'Moov Money',
    cash_delivery: 'Paiement à la livraison',
  };
  const payLabel = paymentLabels[details.payment] || details.payment;

  return `Bonjour DIARRA Distribution, 👋

Je viens de finaliser ma commande sur le site MaliShop :
📋 *N° Commande :* #${details.orderId.slice(0, 8).toUpperCase()}
👤 *Client :* ${details.name}
📞 *Téléphone :* ${details.phone}
📍 *Livraison :* ${details.city}${details.address ? ` - ${details.address}` : ''}
💳 *Paiement :* ${payLabel}
💵 *Montant Total :* ${formatPrice(details.total)} FCFA

Pouvez-vous me confirmer la bonne prise en charge et le suivi de ma livraison ? Merci !`;
}
