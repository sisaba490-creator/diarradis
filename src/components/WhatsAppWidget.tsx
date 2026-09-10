import React, { useState } from 'react';
import { Send, X, MessageSquare, Clock, Sparkles } from 'lucide-react';
import { WhatsAppIcon, openWhatsAppChat } from '@/lib/whatsapp';

type WhatsAppWidgetProps = {
  phone: string;
  defaultMessage?: string;
  brandName?: string;
  enabled?: boolean;
};

export function WhatsAppWidget({
  phone,
  defaultMessage = 'Bonjour DIARRA Distribution, je souhaite des informations.',
  brandName = 'DIARRA Distribution',
  enabled = true,
}: WhatsAppWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(defaultMessage);
  const [hasPrompted, setHasPrompted] = useState(false);

  if (!enabled) return null;

  const quickPrompts = [
    { label: '🛍️ Renseignements produits', text: 'Bonjour, j’aimerais avoir des renseignements sur vos produits disponibles.' },
    { label: '🚚 Frais et délais de livraison', text: 'Bonjour, quels sont vos délais et frais de livraison à Bamako et dans les régions ?' },
    { label: '📦 Suivi de commande', text: 'Bonjour, je souhaite avoir le statut de ma commande.' },
    { label: '💳 Modes de paiement', text: 'Bonjour, acceptez-vous Orange Money, Moov Money et le paiement à la livraison ?' },
  ];

  const handleSend = (textToSend?: string) => {
    const finalMsg = textToSend || message || defaultMessage;
    openWhatsAppChat(phone, finalMsg);
    setIsOpen(false);
  };

  const selectPrompt = (promptText: string) => {
    setMessage(promptText);
    handleSend(promptText);
  };

  return (
    <div className="whatsapp-floating-container" style={{ position: 'fixed', zIndex: 998 }}>
      {/* Fenêtre popover de chat WhatsApp */}
      {isOpen && (
        <div className="whatsapp-chat-box" role="dialog" aria-label="Support WhatsApp">
          <div className="whatsapp-chat-header">
            <div className="whatsapp-header-avatar">
              <WhatsAppIcon size={24} />
              <span className="whatsapp-online-dot" />
            </div>
            <div className="whatsapp-header-info">
              <h4>{brandName}</h4>
              <p>
                <span className="live-status-pill">🟢 En ligne</span>
                <span>Réponse en quelques minutes</span>
              </p>
            </div>
            <button
              className="whatsapp-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer la fenêtre WhatsApp"
            >
              <X size={18} />
            </button>
          </div>

          <div className="whatsapp-chat-body">
            <div className="whatsapp-chat-bubble incoming">
              <p>
                Bonjour ! 👋 Bienvenue chez <strong>{brandName}</strong>. Comment pouvons-nous vous aider aujourd'hui ?
              </p>
              <span className="whatsapp-bubble-time">À l'instant</span>
            </div>

            <div className="whatsapp-quick-prompts">
              <span className="prompts-label">Questions fréquentes :</span>
              <div className="prompts-grid">
                {quickPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="whatsapp-prompt-pill"
                    onClick={() => selectPrompt(p.text)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <form
            className="whatsapp-chat-footer"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Écrivez votre message..."
              className="whatsapp-chat-input"
            />
            <button
              type="submit"
              className="whatsapp-send-btn"
              title="Envoyer sur WhatsApp"
              aria-label="Envoyer sur WhatsApp"
            >
              <Send size={16} />
            </button>
          </form>
          <div className="whatsapp-chat-brand-sub">
            <WhatsAppIcon size={12} /> Propulsé par WhatsApp officiel
          </div>
        </div>
      )}

      {/* Bouton rond principal flottant */}
      <div className="whatsapp-trigger-wrap">
        {!isOpen && !hasPrompted && (
          <div className="whatsapp-teaser-pill" onClick={() => setIsOpen(true)}>
            <span className="pulse-ping" />
            <span>Besoin d'aide ? <strong>Discutez sur WhatsApp</strong></span>
            <button
              type="button"
              className="teaser-close"
              onClick={(e) => {
                e.stopPropagation();
                setHasPrompted(true);
              }}
              aria-label="Masquer le message"
            >
              <X size={12} />
            </button>
          </div>
        )}

        <button
          type="button"
          className={`whatsapp-floating-btn ${isOpen ? 'is-active' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Ouvrir le chat WhatsApp"
          title="Discutez avec nous sur WhatsApp"
        >
          {isOpen ? <X size={26} /> : <WhatsAppIcon size={32} />}
          {!isOpen && <span className="whatsapp-badge-count">1</span>}
        </button>
      </div>
    </div>
  );
}
