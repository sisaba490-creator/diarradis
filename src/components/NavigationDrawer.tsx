import { 
  Cable, 
  ChevronRight, 
  CookingPot, 
  Flame, 
  Headphones, 
  Heart, 
  Lock, 
  LogOut, 
  Package, 
  Phone, 
  Refrigerator, 
  ShieldCheck, 
  SlidersHorizontal, 
  Smartphone, 
  Sparkles, 
  Star, 
  Tag, 
  Truck, 
  User, 
  UserCheck, 
  X, 
  Zap 
} from 'lucide-react';
import type { Category, Customer, Product, Brand } from '@/lib/types';
import { WhatsAppIcon, buildWhatsAppUrl } from '@/lib/whatsapp';

const categoryIcons: Record<string, typeof Refrigerator> = { 
  Refrigerator, 
  Smartphone, 
  Headphones, 
  CookingPot, 
  Cable, 
  Package 
};

type NavigationDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  products: Product[];
  brands: Brand[];
  currentCustomer: Customer | null;
  activeCategory: string;
  onSelectCategory: (name: string) => void;
  onOpenAccount: () => void;
  onOpenAdmin: () => void;
  onOpenFavorites?: () => void;
  favoritesCount?: number;
  siteSettings: Record<string, string>;
};

export function NavigationDrawer({
  isOpen,
  onClose,
  categories,
  products,
  brands,
  currentCustomer,
  activeCategory,
  onSelectCategory,
  onOpenAccount,
  onOpenAdmin,
  onOpenFavorites,
  favoritesCount = 0,
  siteSettings,
}: NavigationDrawerProps) {
  if (!isOpen) return null;

  const s = (key: string, fallback: string) => siteSettings[key] || fallback;
  const flashDealsCount = products.filter((p) => p.deal_ends_at && p.old_price_fcfa).length;

  const handleCategoryClick = (categoryName: string) => {
    onSelectCategory(categoryName);
    onClose();
  };

  const handleAccountClick = () => {
    onOpenAccount();
    onClose();
  };

  const handleAdminClick = () => {
    onOpenAdmin();
    onClose();
  };

  return (
    <div className="nav-drawer-backdrop" onClick={onClose}>
      <aside className="nav-drawer" onClick={(e) => e.stopPropagation()}>
        {/* En-tête du tiroir */}
        <div className="nav-drawer-header">
          <div className="nav-drawer-brand">
            <img
              src={s('brand_logo_image', '/logodd.png')}
              alt={s('brand_name_prefix', 'DIARRA') + ' ' + s('brand_name_suffix', 'Distribution')}
              className="nav-drawer-logo-img"
            />
            <span className="brand-title">
              {s('brand_name_prefix', 'DIARRA')}<span>{s('brand_name_suffix', ' Distribution')}</span>
            </span>
          </div>
          <button className="icon-button close-drawer-btn" onClick={onClose} aria-label="Fermer le menu">
            <X size={20} />
          </button>
        </div>

        <div className="nav-drawer-body">
          {/* Carte Espace Client */}
          <div className="nav-drawer-user-card" onClick={handleAccountClick}>
            <div className="user-avatar-circle">
              {currentCustomer ? <UserCheck size={20} /> : <User size={20} />}
            </div>
            <div className="user-info">
              {currentCustomer ? (
                <>
                  <strong>{currentCustomer.name}</strong>
                  <small>{currentCustomer.phone} • Mon Compte</small>
                </>
              ) : (
                <>
                  <strong>Espace Client</strong>
                  <small>Se connecter / S'inscrire</small>
                </>
              )}
            </div>
            <ChevronRight size={16} className="user-card-arrow" />
          </div>

          {/* Bons plans & Raccourcis rapides */}
          <div className="nav-drawer-section">
            <h4 className="nav-section-title">⚡ Bons Plans</h4>
            <div className="nav-links-grid">
              <button 
                className={`nav-link-btn ${activeCategory === 'Tous les produits' ? 'active' : ''}`}
                onClick={() => handleCategoryClick('Tous les produits')}
              >
                <span className="nav-btn-icon icon-all"><Package size={17} /></span>
                <span className="nav-btn-label">Toute la boutique</span>
                <span className="nav-btn-count">{products.length}</span>
              </button>

              {flashDealsCount > 0 && (
                <button 
                  className="nav-link-btn highlight-flash"
                  onClick={() => {
                    handleCategoryClick('Tous les produits');
                    document.getElementById('flash-deals')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <span className="nav-btn-icon icon-flash"><Flame size={17} /></span>
                  <span className="nav-btn-label">Offres Flash</span>
                  <span className="nav-btn-badge">-{flashDealsCount}</span>
                </button>
              )}

              <button 
                className="nav-link-btn"
                onClick={() => {
                  if (onOpenFavorites) onOpenFavorites();
                  onClose();
                }}
              >
                <span className="nav-btn-icon icon-fav"><Heart size={17} /></span>
                <span className="nav-btn-label">Mes Favoris</span>
                {favoritesCount > 0 && <span className="nav-btn-badge">{favoritesCount}</span>}
              </button>
            </div>
          </div>

          {/* Rayons & Catégories */}
          <div className="nav-drawer-section">
            <h4 className="nav-section-title">🏷️ Rayons & Catégories ({categories.length})</h4>
            <div className="nav-categories-list">
              {categories.map((cat) => {
                const IconComponent = categoryIcons[cat.icon] || Package;
                const catProductsCount = products.filter((p) => p.category_id === cat.id).length;
                const isSelected = activeCategory.toLowerCase() === cat.name.toLowerCase();

                return (
                  <button
                    key={cat.id}
                    className={`nav-category-item ${isSelected ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(cat.name)}
                  >
                    <div className={`nav-cat-icon accent-${cat.accent || 'blue'}`}>
                      <IconComponent size={17} />
                    </div>
                    <div className="nav-cat-text">
                      <span className="nav-cat-name">{cat.name}</span>
                      {cat.description && <small className="nav-cat-desc">{cat.description}</small>}
                    </div>
                    <span className="nav-cat-count">{catProductsCount}</span>
                    <ChevronRight size={14} className="nav-cat-arrow" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Marques vedettes */}
          {brands && brands.filter((b) => b.visible !== false).length > 0 && (
            <div className="nav-drawer-section">
              <h4 className="nav-section-title">⭐ Marques Officielles</h4>
              <div className="nav-brands-chips">
                {brands
                  .filter((b) => b.visible !== false)
                  .slice(0, 10)
                  .map((b) => (
                    <button
                      key={b.id}
                      className="nav-brand-chip"
                      onClick={() => {
                        handleCategoryClick('Tous les produits');
                        // Optionnel : scroll au catalogue
                      }}
                    >
                      {b.logo_url ? (
                        <img src={b.logo_url} alt={b.name} onError={(e) => (e.currentTarget.style.display = 'none')} />
                      ) : null}
                      <span>{b.name}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Services & Garanties */}
          <div className="nav-drawer-section">
            <h4 className="nav-section-title">🛡️ Nos Engagements</h4>
            <div className="nav-services-list">
              <div className="nav-service-item">
                <Truck size={16} className="service-icon" />
                <div>
                  <strong>Livraison Rapide</strong>
                  <small>À Bamako et dans toutes les régions du Mali</small>
                </div>
              </div>
              <div className="nav-service-item">
                <ShieldCheck size={16} className="service-icon" />
                <div>
                  <strong>Garantie & Authenticité</strong>
                  <small>Produits 100% neufs et certifiés</small>
                </div>
              </div>
              <div className="nav-service-item">
                <Phone size={16} className="service-icon" />
                <div>
                  <strong>Service Client Dédié</strong>
                  <a href={`tel:${s('announcement_phone', '+22374798216')}`}>
                    {s('announcement_phone', '+223 74 79 82 16')}
                  </a>
                </div>
              </div>
              <div className="nav-service-item whatsapp-item">
                <span className="service-icon whatsapp-icon-wrap">
                  <WhatsAppIcon size={16} />
                </span>
                <div>
                  <strong>WhatsApp Direct</strong>
                  <a
                    href={buildWhatsAppUrl(s('whatsapp_phone', s('announcement_phone', '+22374798216')), s('whatsapp_default_message', 'Bonjour DIARRA Distribution, je souhaite des renseignements.'))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-whatsapp-link"
                  >
                    Discuter sur WhatsApp ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pied du tiroir : Admin trigger */}
        <div className="nav-drawer-footer">
          <button className="nav-admin-btn" onClick={handleAdminClick}>
            <Lock size={14} />
            <span>Espace Administrateur</span>
          </button>
          <small className="nav-copyright">© 2026 MaliShop Mali</small>
        </div>
      </aside>
    </div>
  );
}
