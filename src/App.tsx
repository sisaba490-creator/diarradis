import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BadgeCheck, Cable, Check, ChevronDown, CookingPot, Headphones, Heart, Lock, Menu, Package, Phone, Refrigerator, Search, Share2, ShieldCheck, ShoppingBag, Smartphone, SlidersHorizontal, Sparkles, Truck, UserCheck, UserRound, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { demoBrands, demoCategories, demoProducts, demoReviews } from '@/lib/demoData';
import type { Brand, CartItem, Category, Customer, PaymentMethod, Product, Review } from '@/lib/types';
import { ProductCard } from '@/components/ProductCard';
import { HeroBanner } from '@/components/HeroBanner';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { FilterSidebar, type FilterState } from '@/components/FilterSidebar';
import { CompareDrawer, CompareModal } from '@/components/CompareDrawer';
import { FlashDeals } from '@/components/FlashDeals';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { AdminPanel } from '@/components/AdminPanel';
import { AccountModal } from '@/components/AccountModal';
import { NavigationDrawer } from '@/components/NavigationDrawer';
import { WhatsAppWidget } from '@/components/WhatsAppWidget';
import { WhatsAppIcon, buildWhatsAppUrl } from '@/lib/whatsapp';

const formatPrice = (value: number) => new Intl.NumberFormat('fr-FR').format(value);
const categoryIcons: Record<string, typeof Refrigerator> = { Refrigerator, Smartphone, Headphones, CookingPot, Cable, Package };

function App() {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('malishop_products');
      return saved ? JSON.parse(saved) : demoProducts;
    } catch {
      return demoProducts;
    }
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('malishop_categories');
      return saved ? JSON.parse(saved) : demoCategories;
    } catch {
      return demoCategories;
    }
  });
  const [reviews, setReviews] = useState<Review[]>(demoReviews);
  const [activeCategory, setActiveCategory] = useState('Tous les produits');
  const [activeNav, setActiveNav] = useState('accueil');
  const [homeResetTrigger, setHomeResetTrigger] = useState(0);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('popular');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [filters, setFilters] = useState<FilterState>(() => {
    try {
      const saved = localStorage.getItem('malishop_products');
      const prods: Product[] = saved ? JSON.parse(saved) : demoProducts;
      const maxP = prods.length > 0 ? Math.max(...prods.map((p) => p.price_fcfa || 0), 500000) : 500000;
      return { brands: [], minPrice: 0, maxPrice: maxP, minRating: 0, inStockOnly: false, onSaleOnly: false };
    } catch {
      return { brands: [], minPrice: 0, maxPrice: 500000, minRating: 0, inStockOnly: false, onSaleOnly: false };
    }
  });
  const [adminOpen, setAdminOpen] = useState(false);
  const [brands, setBrands] = useState<Brand[]>(() => {
    try {
      const b = localStorage.getItem('malishop_brands');
      let loaded: Brand[] = b ? JSON.parse(b) : demoBrands;
      const existingNames = new Set(loaded.map((item) => item.name.toLowerCase()));
      const savedProds = localStorage.getItem('malishop_products');
      const prods: Product[] = savedProds ? JSON.parse(savedProds) : demoProducts;
      prods.forEach((p) => {
        if (p.brand && !existingNames.has(p.brand.toLowerCase())) {
          loaded.push({ id: `b_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, name: p.brand, visible: true });
          existingNames.add(p.brand.toLowerCase());
        }
      });
      return loaded;
    } catch {
      return demoBrands;
    }
  });
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('malishop_settings');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(() => {
    try {
      const saved = localStorage.getItem('malishop_customer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [accountOpen, setAccountOpen] = useState(false);
  const [requiredAuthForCheckout, setRequiredAuthForCheckout] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [cats, prods, revs, settings, brandsRes] = await Promise.all([
          api.categories.list(),
          api.products.list(),
          api.reviews.list(),
          api.settings.get(),
          api.brands.list(),
        ]);
        if (mounted && cats?.length) setCategories(cats as Category[]);
        if (mounted && prods?.length) {
          const loadedProds = prods as Product[];
          setProducts(loadedProds);
          localStorage.setItem('malishop_products', JSON.stringify(loadedProds));
          const newMax = Math.max(...loadedProds.map((p) => p.price_fcfa || 0), 500000);
          setFilters((prev) => ({ ...prev, maxPrice: Math.max(prev.maxPrice, newMax) }));
        }
        if (mounted && revs?.length) setReviews(revs as Review[]);
        if (mounted && settings) {
          setSiteSettings(settings);
          localStorage.setItem('malishop_settings', JSON.stringify(settings));
        }
        if (mounted && brandsRes?.length) {
          setBrands(brandsRes as Brand[]);
          localStorage.setItem('malishop_brands', JSON.stringify(brandsRes));
        }
      } catch (err) {
        // Serveur non disponible — les données de démo restent actives
        console.warn('API locale non disponible, données de démo utilisées.', err);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const handleProductsUpdated = () => {
      try {
        const savedProds = localStorage.getItem('malishop_products');
        if (savedProds) {
          const parsed: Product[] = JSON.parse(savedProds);
          setProducts(parsed);
          const newMax = Math.max(...parsed.map((p) => p.price_fcfa || 0), 500000);
          setFilters((prev) => ({ ...prev, maxPrice: Math.max(prev.maxPrice, newMax) }));
        }
      } catch {}
      api.products.list().then((prods) => {
        if (prods?.length) {
          const freshProds = prods as Product[];
          setProducts(freshProds);
          localStorage.setItem('malishop_products', JSON.stringify(freshProds));
          const newMax = Math.max(...freshProds.map((p) => p.price_fcfa || 0), 500000);
          setFilters((prev) => ({ ...prev, maxPrice: Math.max(prev.maxPrice, newMax) }));
        }
      }).catch(() => {});
    };

    window.addEventListener('malishop_products_updated', handleProductsUpdated);
    window.addEventListener('storage', handleProductsUpdated);
    return () => {
      window.removeEventListener('malishop_products_updated', handleProductsUpdated);
      window.removeEventListener('storage', handleProductsUpdated);
    };
  }, []);

  const searchSuggestions = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return products.filter((p) => `${p.name} ${p.brand}`.toLowerCase().includes(q)).slice(0, 5);
  }, [products, search]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const cat = categories.find((c) => c.name === activeCategory);
      const categoryMatch = activeCategory === 'Tous les produits' || cat?.id === product.category_id;
      const query = search.trim().toLowerCase();
      const searchMatch = !query || `${product.name} ${product.brand}`.toLowerCase().includes(query);
      const brandMatch = filters.brands.length === 0 || filters.brands.includes(product.brand);
      const priceMatch = product.price_fcfa >= filters.minPrice && product.price_fcfa <= filters.maxPrice;
      const ratingMatch = product.rating >= filters.minRating;
      const stockMatch = !filters.inStockOnly || product.stock_count > 0;
      const saleMatch = !filters.onSaleOnly || product.old_price_fcfa !== null;
      return categoryMatch && searchMatch && brandMatch && priceMatch && ratingMatch && stockMatch && saleMatch;
    });

    switch (sortBy) {
      case 'price-asc': result = [...result].sort((a, b) => a.price_fcfa - b.price_fcfa); break;
      case 'price-desc': result = [...result].sort((a, b) => b.price_fcfa - a.price_fcfa); break;
      case 'rating': result = [...result].sort((a, b) => b.rating - a.rating); break;
      case 'newest': result = [...result].sort((a, b) => (b.tags.includes('nouveau') ? 1 : 0) - (a.tags.includes('nouveau') ? 1 : 0)); break;
      default: result = [...result].sort((a, b) => b.sold_count - a.sold_count);
    }
    return result;
  }, [products, categories, activeCategory, search, filters, sortBy]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const compareItems = products.filter((p) => compareList.includes(p.id));
  const recentlyViewedProducts = recentlyViewed.map((id) => products.find((p) => p.id === id)).filter(Boolean).slice(0, 6) as Product[];

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2400); };

  const addToCart = (product: Product, quantity = 1) => {
    setCart((current) => {
      const found = current.find((item) => item.id === product.id);
      return found ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item) : [...current, { ...product, quantity }];
    });
    notify(`${product.name} ajouté au panier`);
  };

  const changeQuantity = (id: string, quantity: number) =>
    setCart((current) => quantity <= 0 ? current.filter((item) => item.id !== id) : current.map((item) => item.id === id ? { ...item, quantity } : item));

  const toggleFavorite = (id: string) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const toggleCompare = (id: string) => {
    setCompareList((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 4) { notify('Vous pouvez comparer 4 produits maximum'); return current; }
      return [...current, id];
    });
  };

  // Deep-linking: ouvrir automatiquement le produit passé dans l'URL (?p=ID ou ?product=ID)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prodId = params.get('p') || params.get('product');
    if (prodId && products.length > 0) {
      const found = products.find((p) => String(p.id) === String(prodId));
      if (found) {
        setSelectedProduct(found);
      }
    }
  }, [products]);

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setRecentlyViewed((current) => [product.id, ...current.filter((id) => id !== product.id)].slice(0, 10));
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('p', String(product.id));
      window.history.replaceState(null, '', url.toString());
    } catch {}
  };

  const closeProduct = () => {
    setSelectedProduct(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('p');
      url.searchParams.delete('product');
      const cleanUrl = url.pathname + (url.search ? url.search : '') + url.hash;
      window.history.replaceState(null, '', cleanUrl);
    } catch {}
  };

  const handleShareStore = () => {
    const storeUrl = window.location.origin;
    const shareText = `🌟 Découvrez *DIARRA Distribution (MaliShop)* !\n\nN°1 de l'électroménager, déco & jardin, électronique à Bamako et partout au Mali.\n🚚 Livraison rapide 24-48h\n💳 Paiement Orange Money, Moov Money et Cash à la livraison.\n\n👉 Visitez le site et commandez ici : ${storeUrl}`;
    
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'DIARRA Distribution | MaliShop — Électroménager, Déco et Jardin & Electronique',
        text: shareText,
        url: storeUrl,
      }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  const handleLoginSuccess = (customer: Customer) => {
    setCurrentCustomer(customer);
    localStorage.setItem('malishop_customer', JSON.stringify(customer));
    if (requiredAuthForCheckout) {
      setRequiredAuthForCheckout(false);
      setAccountOpen(false);
      setCheckoutOpen(true);
    }
  };

  const handleLogout = () => {
    setCurrentCustomer(null);
    localStorage.removeItem('malishop_customer');
    setAccountOpen(false);
    notify('Vous avez été déconnecté.');
  };

  const handleStartCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      notify('Veuillez entrer une adresse e-mail valide.');
      return;
    }
    notify('Merci pour votre inscription à notre newsletter !');
    setNewsletterEmail('');
  };

  const completeOrder = async (details: {
    customer_id?: string;
    name: string;
    phone: string;
    email: string;
    city: string;
    address: string;
    payment: PaymentMethod;
  }) => {
    const subtotal = cart.reduce((sum, item) => sum + item.price_fcfa * item.quantity, 0);
    const delivery = details.city === 'Bamako' ? 2500 : 5000;
    // Générer un ID local garanti dès le départ — jamais null pour l'utilisateur
    const localId = `o${Date.now()}`;

    const orderPayload = {
      id: localId,
      customer_id: details.customer_id || currentCustomer?.id || null,
      customer_name: details.name,
      phone: details.phone,
      email: details.email || null,
      city: details.city,
      address: details.address,
      payment_method: details.payment,
      subtotal_fcfa: subtotal,
      delivery_fcfa: delivery,
      total_fcfa: subtotal + delivery,
      status: 'pending',
      created_at: new Date().toISOString(),
      items: cart.map((item) => ({
        product_id: item.id || null,
        product_name: item.name,
        unit_price_fcfa: item.price_fcfa,
        quantity: item.quantity,
      })),
    };

    // Sauvegarde locale immédiate — garantit la persistance même sans réseau
    try {
      const savedOrders = localStorage.getItem('malishop_orders');
      const ordersList = savedOrders ? JSON.parse(savedOrders) : [];
      ordersList.unshift(orderPayload);
      localStorage.setItem('malishop_orders', JSON.stringify(ordersList));
    } catch {}

    // Envoi à l'API en arrière-plan — met à jour l'ID si l'API répond
    let confirmedOrderId = localId;
    try {
      const order = await api.orders.create(orderPayload);
      if (order && order.id) {
        confirmedOrderId = order.id;
        // Mettre à jour l'entrée locale avec l'ID confirmé par le serveur
        try {
          const savedOrders = localStorage.getItem('malishop_orders');
          if (savedOrders) {
            const ordersList = JSON.parse(savedOrders);
            const idx = ordersList.findIndex((o: any) => o.id === localId);
            if (idx !== -1) {
              ordersList[idx] = { ...ordersList[idx], id: confirmedOrderId };
              localStorage.setItem('malishop_orders', JSON.stringify(ordersList));
            }
          }
        } catch {}
      }
    } catch (err) {
      console.warn('Création commande en ligne échouée, commande sauvegardée localement:', err);
    }

    setCart([]);
    // Retourner toujours un ID valide — jamais null
    return confirmedOrderId;
  };


  const goToHome = () => {
    setActiveCategory('Tous les produits');
    setActiveNav('accueil');
    setHomeResetTrigger((c) => c + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenu(false);
  };
  const openCategory = (name: string) => {
    setActiveCategory(name);
    setActiveNav(name.toLowerCase() === 'tous les produits' ? 'boutique' : name);
    document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenu(false);
  };
  const reloadSettings = async () => {
    // Recharger depuis localStorage d'abord (optimistic)
    try {
      const savedSettings = localStorage.getItem('malishop_settings');
      if (savedSettings) setSiteSettings(JSON.parse(savedSettings));
      const savedProds = localStorage.getItem('malishop_products');
      if (savedProds) setProducts(JSON.parse(savedProds));
      const savedCats = localStorage.getItem('malishop_categories');
      if (savedCats) setCategories(JSON.parse(savedCats));
      const savedBrands = localStorage.getItem('malishop_brands');
      if (savedBrands) setBrands(JSON.parse(savedBrands));
    } catch {}

    // Synchroniser avec l'API serveur (source de vérité)
    try {
      const [settings, prods, cats, brandsRes] = await Promise.allSettled([
        api.settings.get(),
        api.products.list(),
        api.categories.list(),
        api.brands.list(),
      ]);
      if (settings.status === 'fulfilled' && settings.value) {
        setSiteSettings(settings.value);
        localStorage.setItem('malishop_settings', JSON.stringify(settings.value));
      }
      if (prods.status === 'fulfilled' && prods.value?.length) {
        setProducts(prods.value as Product[]);
        localStorage.setItem('malishop_products', JSON.stringify(prods.value));
      }
      if (cats.status === 'fulfilled' && cats.value?.length) {
        setCategories(cats.value as Category[]);
        localStorage.setItem('malishop_categories', JSON.stringify(cats.value));
      }
      if (brandsRes.status === 'fulfilled' && brandsRes.value?.length) {
        setBrands(brandsRes.value as Brand[]);
        localStorage.setItem('malishop_brands', JSON.stringify(brandsRes.value));
      }
    } catch { /* mode démo */ }
  };
  const s = (key: string, fallback: string) => siteSettings[key] || fallback;

  const relatedProducts = selectedProduct ? products.filter((p) => p.category_id === selectedProduct.category_id && p.id !== selectedProduct.id) : [];

  return (
    <div className="app-shell">
      <div className="announcement">
        <span><Zap size={14} fill="currentColor" /> {s('announcement_text', 'Livraison offerte à Bamako dès 250 000 F')}</span>
        <span className="announcement-right">
          Besoin d'aide ? <a href={`tel:${s('announcement_phone', '+22374798216')}`}>{s('announcement_phone', '+223 74 79 82 16')}</a>
          <span className="announcement-sep">·</span>
          <a
            href={buildWhatsAppUrl(s('whatsapp_phone', s('announcement_phone', '+22374798216')), s('whatsapp_default_message', 'Bonjour DIARRA Distribution, je souhaite des renseignements.'))}
            target="_blank"
            rel="noopener noreferrer"
            className="announcement-whatsapp-link"
            title="Discuter sur WhatsApp"
          >
            <WhatsAppIcon size={12} /> WhatsApp
          </a>
          <span className="announcement-sep">·</span>
          <button
            type="button"
            className="announcement-share-btn"
            onClick={handleShareStore}
            title="Partager le site DIARRA Distribution"
          >
            <Share2 size={12} /> Partager
          </button>
          <button className="admin-trigger" onClick={() => setAdminOpen(true)}><Lock size={11} /> Admin</button>
        </span>
      </div>

      <header className="site-header">
        <div className="header-inner">
          <div className="header-left">
            <button className="mobile-menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu principal">
              <Menu size={20} />
            </button>
            
            {/* Logo & Nom de la boutique personnalisables */}
            <button className="brand" onClick={goToHome}>
              <img
                src={s('brand_logo_image', '/logodd.png')}
                alt={s('brand_name_prefix', 'DIARRA') + ' ' + s('brand_name_suffix', 'Distribution')}
                className="brand-custom-logo"
              />
              <span className="brand-name-wrap">
                {s('brand_name_prefix', 'DIARRA')}<span>{s('brand_name_suffix', ' Distribution')}</span>
              </span>
            </button>
          </div>

          {/* Liens de navigation dynamiques configurables depuis l'admin */}
          <nav className={`main-nav ${mobileMenu ? 'open' : ''}`}>
            {s('header_nav_links', 'Accueil, Boutique, Électroménager, Téléphonie, Audio & Image')
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
              .map((item) => {
                const clean = item.toLowerCase();
                const isSelected = clean === 'accueil'
                  ? activeNav === 'accueil'
                  : clean === 'boutique'
                  ? activeNav === 'boutique'
                  : activeCategory.toLowerCase() === clean;

                return (
                  <button
                    key={item}
                    className={isSelected ? 'nav-item-active' : ''}
                    onClick={() => {
                      if (clean === 'accueil') {
                        goToHome();
                      } else if (clean === 'boutique' || clean === 'tous') {
                        openCategory('Tous les produits');
                      } else {
                        openCategory(item);
                      }
                    }}
                  >
                    {item}
                  </button>
                );
              })}

            {mobileMenu && (
              <button className="mobile-only-action" onClick={() => { setRequiredAuthForCheckout(false); setAccountOpen(true); setMobileMenu(false); }}>
                {currentCustomer ? `Mon Compte (${currentCustomer.name.split(' ')[0]})` : s('header_account_label', 'Compte')}
              </button>
            )}
          </nav>

          <div className="header-actions">
            <div className="search-container">
              <label className="search-box header-search">
                <Search size={17} className="search-icon-svg" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  placeholder={s('header_search_placeholder', 'Rechercher un produit...')}
                />
              </label>
              {searchFocused && searchSuggestions.length > 0 && (
                <div className="search-suggestions">
                  {searchSuggestions.map((p) => (
                    <button className="search-suggestion" key={p.id} onMouseDown={() => { selectProduct(p); setSearch(''); }}>
                      <img src={p.image_url} alt={p.name} />
                      <div>
                        <strong>{p.name}</strong>
                        <span>{formatPrice(p.price_fcfa)} F</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              className={`header-action hide-mobile ${currentCustomer ? 'user-logged' : ''}`}
              onClick={() => { setRequiredAuthForCheckout(false); setAccountOpen(true); }}
            >
              {currentCustomer ? (
                <>
                  <span className="user-online-dot"></span>
                  <UserCheck size={18} />
                </>
              ) : (
                <UserRound size={18} />
              )}
              <span>{currentCustomer ? currentCustomer.name.split(' ')[0] : s('header_account_label', 'Compte')}</span>
            </button>

            <button className="header-action favorite-action" onClick={() => notify(`${favorites.length} favori${favorites.length > 1 ? 's' : ''}`)}>
              <Heart size={18} fill={favorites.length ? 'currentColor' : 'none'} />
              <span className="hide-mobile">{s('header_fav_label', 'Favoris')}</span>
              {favorites.length > 0 && <b>{favorites.length}</b>}
            </button>

            <button className="header-action cart-action" onClick={() => setCartOpen(true)}>
              <ShoppingBag size={19} />
              <span>{s('header_cart_label', 'Panier')}</span>
              {cartCount > 0 && <b className="cart-count-badge">{cartCount}</b>}
            </button>
          </div>
        </div>
      </header>

      <main>
        <HeroBanner
          siteSettings={siteSettings}
          resetTrigger={homeResetTrigger}
          onNavigate={(cat) => {
            if (cat === 'boutique' || cat === 'Accueil' || cat === 'Tous') {
              openCategory('Tous les produits');
            } else {
              openCategory(cat);
            }
          }}
        />

        <section className="service-strip">
          <div><Truck size={22} /><span><strong>Livraison rapide</strong><small>Bamako & grandes villes</small></span></div>
          <div><ShieldCheck size={22} /><span><strong>Paiement sécurisé</strong><small>Orange Money & Moov</small></span></div>
          <div><BadgeCheck size={22} /><span><strong>Produits garantis</strong><small>Qualité vérifiée</small></span></div>
          <div><Phone size={22} /><span><strong>Service client</strong><small>À votre écoute 7j/7</small></span></div>
        </section>

        <FlashDeals
          products={products}
          title={s('flash_deals_title', 'Offres Flash Limitées')}
          subtitle={s('flash_deals_subtitle', 'Profitez des réductions exceptionnelles avant la fin du compte à rebours !')}
          enabled={s('flash_deals_enabled', 'true') !== 'false'}
          onSelect={selectProduct}
          onAdd={addToCart}
        />

        <section className="categories-section container">
          <div className="section-heading-centered">
            <span className="section-pill green-pill">
              <Sparkles size={13} /> EXPLOREZ NOS UNIVERS
            </span>
            <h2 className="section-main-title">Tout pour mieux vivre.</h2>
            <p className="section-main-subtitle">Naviguez à travers nos rayons d'équipements certifiés aux meilleurs prix à Bamako.</p>
          </div>
          <div className="category-grid">
            <button className={`category-tile all-tile ${activeCategory === 'Tous les produits' ? 'active' : ''}`} onClick={() => openCategory('Tous les produits')}>
              <span className="category-icon"><Package size={22} /></span><strong>Tout voir</strong><small>{products.length} produits</small>
            </button>
            {categories.map((category) => {
              const Icon = categoryIcons[category.icon] || Package;
              return (
                <button key={category.id} className={`category-tile ${category.accent} ${activeCategory === category.name ? 'active' : ''}`} onClick={() => openCategory(category.name)}>
                  <span className="category-icon"><Icon size={22} /></span><strong>{category.name}</strong><small>{products.filter((p) => p.category_id === category.id).length || 0} produits</small>
                </button>
              );
            })}
          </div>
        </section>

        <section className="catalog-section" id="catalogue">
          <div className="section-heading-centered">
            <span className="section-pill green-pill">
              <Sparkles size={13} /> LA SÉLECTION MALISHOP
            </span>
            <h2 className="section-main-title">Nos Incontournables</h2>
            <p className="section-main-subtitle">Une sélection exclusive d'articles fiables, plébiscités et garantis pour votre quotidien.</p>
          </div>

          <div className="catalog-top-bar">
            <div className="filter-pills">
              <button className={activeCategory === 'Tous les produits' ? 'active' : ''} onClick={() => setActiveCategory('Tous les produits')}>Tous</button>
              {categories.map((category) => <button className={activeCategory === category.name ? 'active' : ''} key={category.id} onClick={() => setActiveCategory(category.name)}>{category.name}</button>)}
            </div>
            <div className="catalog-tools">
              <button className="filter-toggle-button" onClick={() => setFilterOpen(true)}><SlidersHorizontal size={16} /> Filtres</button>
              <div className="sort-dropdown">
                <button className="filter-button">Trier par : <strong>{sortBy === 'popular' ? 'Popularité' : sortBy === 'price-asc' ? 'Prix croissant' : sortBy === 'price-desc' ? 'Prix décroissant' : sortBy === 'rating' ? 'Mieux notés' : 'Nouveautés'}</strong><ChevronDown size={15} /></button>
                <div className="sort-menu">
                  <button className={sortBy === 'popular' ? 'active' : ''} onClick={() => setSortBy('popular')}>Popularité</button>
                  <button className={sortBy === 'price-asc' ? 'active' : ''} onClick={() => setSortBy('price-asc')}>Prix croissant</button>
                  <button className={sortBy === 'price-desc' ? 'active' : ''} onClick={() => setSortBy('price-desc')}>Prix décroissant</button>
                  <button className={sortBy === 'rating' ? 'active' : ''} onClick={() => setSortBy('rating')}>Mieux notés</button>
                  <button className={sortBy === 'newest' ? 'active' : ''} onClick={() => setSortBy('newest')}>Nouveautés</button>
                </div>
              </div>
            </div>
          </div>

          <div className="catalog-layout">
            <FilterSidebar
              products={products}
              managedBrands={brands}
              filters={filters}
              onChange={setFilters}
              isOpen={filterOpen}
              onClose={() => setFilterOpen(false)}
            />
            <div className="catalog-main">
              {filteredProducts.length ? (
                <div className="product-grid">{filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} isFavorite={favorites.includes(product.id)} isCompared={compareList.includes(product.id)} onFavorite={() => toggleFavorite(product.id)} onAdd={() => addToCart(product)} onSelect={() => selectProduct(product)} onCompare={() => toggleCompare(product.id)} />
                ))}</div>
              ) : (
                <div className="no-results"><Search size={28} /><h3>Aucun produit trouvé</h3><p>Essayez un autre mot-clé ou ajustez vos filtres.</p></div>
              )}
            </div>
          </div>
        </section>

        {recentlyViewedProducts.length > 0 && (
          <section className="recently-viewed container">
            <div className="section-heading-centered">
              <span className="section-pill green-pill">
                <Sparkles size={13} /> POUR VOUS
              </span>
              <h2 className="section-main-title">Récemment consultés</h2>
              <p className="section-main-subtitle">Retrouvez facilement les produits que vous venez d'explorer.</p>
            </div>
            <div className="recently-grid">
              {recentlyViewedProducts.map((p) => (
                <div className="recently-card" key={p.id} onClick={() => selectProduct(p)}>
                  <div className="recently-image-wrap">
                    <img src={p.image_url} alt={p.name} loading="lazy" />
                  </div>
                  <div className="recently-info">
                    <span className="recently-brand">{p.brand}</span>
                    <strong className="recently-name">{p.name}</strong>
                    <div className="recently-footer">
                      <span className="recently-price">{formatPrice(p.price_fcfa)} F</span>
                      <button
                        className="recently-add-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p);
                        }}
                        title="Ajouter au panier"
                      >
                        <ShoppingBag size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="promo-wrapper">
          <section className="promo-section">
            <div className="promo-copy">
              <p className="eyebrow light">{s('promo_eyebrow', 'Le bon moment pour s\'équiper')}</p>
              <h2 dangerouslySetInnerHTML={{ __html: s('promo_title', 'Des prix doux.<br /><em>Des envies folles.</em>').replace(/\n/g, '<br />') }} />
              <p>{s('promo_description', 'Profitez de nos offres spéciales du mois et équipez votre maison sans compromis.')}</p>
              <button onClick={() => openCategory('Tous les produits')} className="hero-button">{s('promo_button', 'Voir les offres')} <ArrowRight size={17} /></button>
            </div>
            <div className="promo-art">
              <div className="discount-circle"><strong>{s('promo_discount', '-20%')}</strong><span>{s('promo_discount_label', 'sur une sélection')}</span></div>
              <div className="promo-line line-a"></div>
              <div className="promo-line line-b"></div>
              <Sparkles className="promo-star" size={22} />
            </div>
          </section>
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-main container">
          <div className="footer-brand">
            <button className="brand"><span className="brand-mark"><Sparkles size={17} /></span><span>Mali<span>shop</span></span></button>
            <p>{s('footer_tagline', 'Le meilleur de l\'équipement pour chaque foyer malien.')}</p>
            <div className="socials"><span>f</span><span>in</span><span>◎</span></div>
          </div>
          <div><h3>La boutique</h3><button onClick={() => openCategory('Tous les produits')}>Tous les produits</button><button onClick={() => openCategory('Électroménager')}>Électroménager</button><button onClick={() => openCategory('Téléphonie')}>Téléphonie</button></div>
          <div>
            <h3>Besoin d'aide ?</h3>
            <a href={`tel:${s('announcement_phone', '+22374798216')}`}>Nous contacter</a>
            <a
              href={buildWhatsAppUrl(s('whatsapp_phone', s('announcement_phone', '+22374798216')), s('whatsapp_default_message', 'Bonjour DIARRA Distribution, je souhaite des renseignements.'))}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-whatsapp-link"
            >
              <WhatsAppIcon size={14} /> WhatsApp direct
            </a>
            <button>Livraison & retours</button>
            <button>Questions fréquentes</button>
          </div>
          <div className="newsletter">
            <h3>Nos bons plans</h3>
            <p>Recevez nos offres et nouveautés directement.</p>
            <form onSubmit={handleNewsletterSubmit}>
              <input
                placeholder="Votre adresse e-mail"
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
              />
              <button type="submit" aria-label="S'inscrire">
                <ArrowRight size={17} />
              </button>
            </form>
          </div>
        </div>
        <div className="footer-bottom container"><span>{s('footer_copyright', '© 2026 Malishop. Fait avec soin à Bamako.')}</span><span>Mentions légales&nbsp;&nbsp; · &nbsp;&nbsp;Confidentialité</span></div>
      </footer>

      {cartOpen && (
        <CartDrawer
          items={cart}
          customer={currentCustomer}
          whatsappPhone={s('whatsapp_phone', s('announcement_phone', '+223 74 79 82 16'))}
          whatsappOrderEnabled={s('whatsapp_order_enabled', 'true') !== 'false'}
          onClose={() => setCartOpen(false)}
          onChangeQuantity={changeQuantity}
          onCheckout={handleStartCheckout}
        />
      )}
      {checkoutOpen && (
        <CheckoutModal
          items={cart}
          customer={currentCustomer}
          whatsappPhone={s('whatsapp_phone', s('announcement_phone', '+223 74 79 82 16'))}
          onClose={() => setCheckoutOpen(false)}
          onOpenAccount={() => { setCheckoutOpen(false); setAccountOpen(true); }}
          onComplete={completeOrder}
        />
      )}
      <AccountModal
        isOpen={accountOpen}
        onClose={() => { setAccountOpen(false); setRequiredAuthForCheckout(false); }}
        currentCustomer={currentCustomer}
        requiredForCheckout={requiredAuthForCheckout}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />
      {compareItems.length > 0 && !compareOpen && <CompareDrawer items={compareItems} onRemove={(id) => toggleCompare(id)} onClear={() => setCompareList([])} onClose={() => setCompareOpen(true)} />}
      {compareOpen && <CompareModal items={compareItems} onClose={() => setCompareOpen(false)} onRemove={(id) => toggleCompare(id)} />}
      {selectedProduct && (
        <ProductDetailModal
          product={products.find((p) => p.id === selectedProduct.id) || selectedProduct}
          reviews={reviews}
          relatedProducts={relatedProducts}
          whatsappPhone={s('whatsapp_phone', s('announcement_phone', '+223 74 79 82 16'))}
          whatsappOrderEnabled={s('whatsapp_order_enabled', 'true') !== 'false'}
          onClose={closeProduct}
          onAdd={addToCart}
          onSelectProduct={selectProduct}
        />
      )}
      {toast && <div className="toast"><Check size={16} /> {toast}</div>}
      {adminOpen && <AdminPanel onClose={() => setAdminOpen(false)} onSettingsChanged={reloadSettings} />}
      <NavigationDrawer
        isOpen={mobileMenu}
        onClose={() => setMobileMenu(false)}
        categories={categories}
        products={products}
        brands={brands}
        currentCustomer={currentCustomer}
        activeCategory={activeCategory}
        onSelectCategory={openCategory}
        onOpenAccount={() => { setRequiredAuthForCheckout(false); setAccountOpen(true); }}
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenFavorites={() => notify(`${favorites.length} favori${favorites.length > 1 ? 's' : ''}`)}
        onShareStore={handleShareStore}
        favoritesCount={favorites.length}
        siteSettings={siteSettings}
      />
      <WhatsAppWidget
        phone={s('whatsapp_phone', s('announcement_phone', '+223 74 79 82 16'))}
        defaultMessage={s('whatsapp_default_message', 'Bonjour DIARRA Distribution, je souhaite des renseignements.')}
        brandName={s('brand_name_prefix', 'DIARRA') + ' ' + s('brand_name_suffix', 'Distribution')}
        enabled={s('whatsapp_floating_enabled', 'true') !== 'false'}
      />
    </div>
  );
}

export default App;
