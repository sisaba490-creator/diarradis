import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowUpRight, BarChart3, Check, ChevronDown, Clock, DollarSign, Eye, EyeOff, Flame, FolderOpen, Image as ImageIcon, KeyRound, LayoutDashboard, LayoutGrid, Link as LinkIcon, Loader2, Lock, Package, Pencil, Plus, RefreshCw, Settings, Shield, ShoppingCart, Sparkles, Star, Tag, Trash2, TrendingUp, Truck, Upload, Users, X, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { demoBrands, demoCategories, demoOrders, demoProducts } from '@/lib/demoData';
import type { Brand, Category, Product } from '@/lib/types';

const formatPrice = (value: number) => new Intl.NumberFormat('fr-FR').format(value);

type SiteSettings = Record<string, string>;

type AdminPanelProps = {
  onClose: () => void;
  onSettingsChanged: () => void;
};

export function AdminPanel({ onClose, onSettingsChanged }: AdminPanelProps) {
  const [tab, setTab] = useState<'login' | 'dashboard' | 'products' | 'categories' | 'brands' | 'orders' | 'settings' | 'security'>('login');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // States pour la personnalisation du mot de passe
  const [currentAdminPassword, setCurrentAdminPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [showCurrentAdminPassword, setShowCurrentAdminPassword] = useState(false);
  const [showNewAdminPassword, setShowNewAdminPassword] = useState(false);
  const [showConfirmAdminPassword, setShowConfirmAdminPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' });
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const s = localStorage.getItem('malishop_settings');
      return s ? JSON.parse(s) : {};
    } catch {
      return {};
    }
  });
  const [settingsChanged, setSettingsChanged] = useState(false);
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const p = localStorage.getItem('malishop_products');
      return p ? JSON.parse(p) : demoProducts;
    } catch {
      return demoProducts;
    }
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const c = localStorage.getItem('malishop_categories');
      return c ? JSON.parse(c) : demoCategories;
    } catch {
      return demoCategories;
    }
  });
  const [orders, setOrders] = useState<any[]>(() => {
    try {
      const o = localStorage.getItem('malishop_orders');
      return o ? JSON.parse(o) : demoOrders;
    } catch {
      return demoOrders;
    }
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [deleteConfirmCat, setDeleteConfirmCat] = useState<string | null>(null);
  const [brands, setBrands] = useState<Brand[]>(() => {
    try {
      const b = localStorage.getItem('malishop_brands');
      return b ? JSON.parse(b) : demoBrands;
    } catch {
      return demoBrands;
    }
  });
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [deleteConfirmBrand, setDeleteConfirmBrand] = useState<string | null>(null);
  const [brandForm, setBrandForm] = useState<Partial<Brand>>({});
  const [toast, setToast] = useState('');
  const [productFilter, setProductFilter] = useState<'all' | 'flash'>('all');

  // ── State for hero slide image upload & tabs ──────────────────────────────
  const [activeHeroSlideTab, setActiveHeroSlideTab] = useState<'0' | '1' | '2'>('0');
  const [slideImageMode, setSlideImageMode] = useState<Record<string, 'upload' | 'url'>>({ '0': 'upload', '1': 'upload', '2': 'upload' });
  const [slideUploading, setSlideUploading] = useState<Record<string, boolean>>({});
  const [slideUploadError, setSlideUploadError] = useState<Record<string, string>>({});
  const slideFileRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const notify = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  // Upload image for a specific hero slide
  const handleSlideImageUpload = async (slideKey: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      setSlideUploadError((e) => ({ ...e, [slideKey]: 'Fichier invalide. Choisissez une image (JPG, PNG, WebP…).' }));
      return;
    }
    setSlideUploadError((e) => ({ ...e, [slideKey]: '' }));
    setSlideUploading((u) => ({ ...u, [slideKey]: true }));
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string;
        try {
          const res = await api.upload.image({ image: base64, filename: file.name });
          await saveSetting(`hero_slide${slideKey}_image`, res?.url || base64);
        } catch {
          await saveSetting(`hero_slide${slideKey}_image`, base64);
        } finally {
          setSlideUploading((u) => ({ ...u, [slideKey]: false }));
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setSlideUploadError((e) => ({ ...e, [slideKey]: 'Erreur lors de la lecture du fichier.' }));
      setSlideUploading((u) => ({ ...u, [slideKey]: false }));
    }
  };

  const login = async () => {
    setError('');
    setLoginLoading(true);
    try {
      const res = await api.admin.login(password);
      if (res && res.success) {
        setAuthed(true);
        setTab('dashboard');
        setError('');
        setLoginLoading(false);
        return;
      }
    } catch (err: any) {
      if (err?.message && !err.message.includes('fetch') && !err.message.includes('Failed to fetch')) {
        setError(err.message);
        setLoginLoading(false);
        return;
      }
    }

    // Fallback de secours (si serveur non connecté ou mode local/démo)
    const stored = settings['admin_password'] || localStorage.getItem('admin_custom_password') || 'admin2026';
    if (password === stored) {
      setAuthed(true);
      setTab('dashboard');
      setError('');
    } else {
      setError('Mot de passe incorrect');
    }
    setLoginLoading(false);
  };

  const handleUpdateAdminPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (!newAdminPassword.trim()) {
      setPasswordMsg({ type: 'error', text: 'Veuillez saisir un nouveau mot de passe.' });
      return;
    }
    if (newAdminPassword.trim().length < 4) {
      setPasswordMsg({ type: 'error', text: 'Le mot de passe doit comporter au moins 4 caractères.' });
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      setPasswordMsg({ type: 'error', text: 'La confirmation ne correspond pas au nouveau mot de passe.' });
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await api.admin.changePassword({
        currentPassword: currentAdminPassword || undefined,
        newPassword: newAdminPassword.trim(),
      });

      // Synchroniser également dans site_settings et localStorage
      await saveSetting('admin_password', newAdminPassword.trim());
      localStorage.setItem('admin_custom_password', newAdminPassword.trim());

      setPasswordMsg({
        type: 'success',
        text: res?.message || 'Mot de passe administrateur mis à jour avec succès dans la base de données !',
      });
      setCurrentAdminPassword('');
      setNewAdminPassword('');
      setConfirmAdminPassword('');
      notify('Mot de passe administrateur modifié');
    } catch (err: any) {
      if (err?.message && (err.message.includes('actuel') || err.message.includes('incorrect'))) {
        setPasswordMsg({ type: 'error', text: err.message });
      } else {
        // Sauvegarde de secours en local et via settings
        await saveSetting('admin_password', newAdminPassword.trim());
        localStorage.setItem('admin_custom_password', newAdminPassword.trim());
        setPasswordMsg({
          type: 'success',
          text: 'Mot de passe administrateur mis à jour avec succès !',
        });
        setCurrentAdminPassword('');
        setNewAdminPassword('');
        setConfirmAdminPassword('');
        notify('Mot de passe administrateur modifié');
      }
    } finally {
      setUpdatingPassword(false);
    }
  };

  const loadData = async () => {
    // 1. Initialiser depuis localStorage ou demoData
    try {
      const savedProds = localStorage.getItem('malishop_products');
      if (savedProds) setProducts(JSON.parse(savedProds));
      else {
        setProducts(demoProducts);
        localStorage.setItem('malishop_products', JSON.stringify(demoProducts));
      }
    } catch {
      setProducts(demoProducts);
    }

    try {
      const savedCats = localStorage.getItem('malishop_categories');
      if (savedCats) setCategories(JSON.parse(savedCats));
      else {
        setCategories(demoCategories);
        localStorage.setItem('malishop_categories', JSON.stringify(demoCategories));
      }
    } catch {
      setCategories(demoCategories);
    }

    try {
      const savedOrders = localStorage.getItem('malishop_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
      else {
        setOrders(demoOrders);
        localStorage.setItem('malishop_orders', JSON.stringify(demoOrders));
      }
    } catch {
      setOrders(demoOrders);
    }

    try {
      const savedBrands = localStorage.getItem('malishop_brands');
      let currentBrands: Brand[] = savedBrands ? JSON.parse(savedBrands) : demoBrands;
      const existingNames = new Set(currentBrands.map((b) => b.name.toLowerCase()));
      const currentProds = products.length > 0 ? products : demoProducts;
      currentProds.forEach((p) => {
        if (p.brand && !existingNames.has(p.brand.toLowerCase())) {
          currentBrands.push({ id: `b_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, name: p.brand, visible: true });
          existingNames.add(p.brand.toLowerCase());
        }
      });
      setBrands(currentBrands);
      localStorage.setItem('malishop_brands', JSON.stringify(currentBrands));
    } catch {
      setBrands(demoBrands);
    }

    try {
      const savedSettings = localStorage.getItem('malishop_settings');
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    } catch {}

    // 2. Synchroniser avec l'API serveur si disponible
    try {
      const [s, p, c, o, b] = await Promise.allSettled([
        api.settings.get(),
        api.products.list(),
        api.categories.list(),
        api.orders.list(),
        api.brands.list(),
      ]);

      if (s.status === 'fulfilled' && s.value) {
        setSettings(s.value);
        localStorage.setItem('malishop_settings', JSON.stringify(s.value));
      }
      if (p.status === 'fulfilled' && Array.isArray(p.value) && p.value.length > 0) {
        setProducts(p.value as Product[]);
        localStorage.setItem('malishop_products', JSON.stringify(p.value));
      }
      if (c.status === 'fulfilled' && Array.isArray(c.value) && c.value.length > 0) {
        setCategories(c.value as Category[]);
        localStorage.setItem('malishop_categories', JSON.stringify(c.value));
      }
      if (o.status === 'fulfilled' && Array.isArray(o.value)) {
        let currentOrders = o.value;
        // Synchroniser automatiquement vers la base en ligne toute commande locale en attente
        try {
          const rawLocal = localStorage.getItem('malishop_orders');
          if (rawLocal) {
            const localList: any[] = JSON.parse(rawLocal);
            const serverIds = new Set((currentOrders || []).map((so: any) => so.id));
            const demoIds = new Set(demoOrders.map((d) => d.id));
            const unSynced = localList.filter((lo) => lo && lo.id && !serverIds.has(lo.id) && !demoIds.has(lo.id));
            if (unSynced.length > 0) {
              for (const uns of unSynced) {
                try {
                  await api.orders.create(uns);
                } catch (err) {}
              }
              const freshOrders = await api.orders.list();
              if (Array.isArray(freshOrders) && freshOrders.length > 0) {
                currentOrders = freshOrders;
              }
            }
          }
        } catch (e) {}
        setOrders(currentOrders);
        localStorage.setItem('malishop_orders', JSON.stringify(currentOrders));
      }
      if (b.status === 'fulfilled' && Array.isArray(b.value) && b.value.length > 0) {
        setBrands(b.value as Brand[]);
        localStorage.setItem('malishop_brands', JSON.stringify(b.value));
      }
    } catch (err) {
      console.warn('API locale non disponible, utilisation des données locales.', err);
    }
  };

  useEffect(() => { loadData(); }, []);

  const saveSetting = async (key: string, value: string) => {
    setSettings((s) => {
      const updated = { ...s, [key]: value };
      localStorage.setItem('malishop_settings', JSON.stringify(updated));
      return updated;
    });
    setSettingsChanged(true);
  };

  const persistSettings = async () => {
    localStorage.setItem('malishop_settings', JSON.stringify(settings));
    try {
      await api.settings.save(settings);
    } catch {}
    setSettingsChanged(false);
    onSettingsChanged();
    notify('Page personnalisée avec succès');
  };

  const deleteProduct = async (id: string) => {
    try {
      await api.products.delete(id);
    } catch { /* mode démo */ }
    setProducts((p) => {
      const updated = p.filter((x) => x.id !== id);
      localStorage.setItem('malishop_products', JSON.stringify(updated));
      return updated;
    });
    onSettingsChanged();
    notify('Produit supprimé');
  };

  const saveProduct = async (product: Partial<Product>) => {
    const existing = products.find((p) => p.id === product.id);
    const prodId = product.id || existing?.id || `p${Date.now()}`;

    // Conserver le slug existant ou en générer un unique
    let finalSlug = (product.slug || existing?.slug || '').trim().toLowerCase();
    if (!finalSlug) {
      const baseSlug = (product.name || existing?.name || 'produit')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      finalSlug = baseSlug ? `${baseSlug}-${prodId.replace(/^p/, '')}` : `prod-${prodId}`;
    }

    const price = Math.max(0, Number(product.price_fcfa !== undefined ? product.price_fcfa : (existing?.price_fcfa ?? 0)));
    const rawOldPrice = product.old_price_fcfa !== undefined ? product.old_price_fcfa : existing?.old_price_fcfa;
    const cleanOldPrice = rawOldPrice && Number(rawOldPrice) > price ? Number(rawOldPrice) : null;

    const payload: Product = {
      id: prodId,
      name: product.name || existing?.name || 'Nouveau produit',
      slug: finalSlug,
      brand: product.brand || existing?.brand || 'Générique',
      description: product.description ?? existing?.description ?? '',
      price_fcfa: price,
      old_price_fcfa: cleanOldPrice,
      image_url: product.image_url || existing?.image_url || '',
      badge: product.badge !== undefined ? product.badge : (existing?.badge || null),
      rating: product.rating || existing?.rating || 4.8,
      review_count: product.review_count || existing?.review_count || 0,
      stock_count: Math.max(0, Number(product.stock_count !== undefined ? product.stock_count : (existing?.stock_count ?? 0))),
      featured: product.featured !== undefined ? product.featured : (existing?.featured || false),
      specs: product.specs || existing?.specs || [],
      gallery: product.gallery || existing?.gallery || (product.image_url ? [product.image_url] : []),
      tiered_pricing: product.tiered_pricing || existing?.tiered_pricing || [],
      tags: product.tags || existing?.tags || [],
      min_order_qty: product.min_order_qty || existing?.min_order_qty || 1,
      sold_count: product.sold_count || existing?.sold_count || 0,
      category_id: product.category_id || existing?.category_id || categories[0]?.id || 'c1',
      deal_ends_at: product.deal_ends_at !== undefined ? product.deal_ends_at : (existing?.deal_ends_at || null),
    };

    try {
      let savedResult: Product | undefined;
      if (product.id) {
        savedResult = await api.products.update(product.id, payload);
      } else {
        savedResult = await api.products.create(payload);
      }

      const finalSaved: Product = savedResult && savedResult.id ? savedResult : payload;

      setProducts((current) => {
        let updated: Product[];
        if (product.id) {
          updated = current.map((p) => (p.id === product.id ? { ...p, ...finalSaved } : p));
        } else {
          updated = [finalSaved, ...current];
        }
        localStorage.setItem('malishop_products', JSON.stringify(updated));
        return updated;
      });

      setShowProductForm(false);
      setEditingProduct(null);
      onSettingsChanged();
      notify('Produit enregistré avec succès dans la base de données');
    } catch (err: any) {
      console.error('Erreur API sauvegarde produit:', err);
      notify(`Erreur lors de l'enregistrement : ${err.message || 'Échec de connexion au serveur'}`);
      throw err;
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const targetOrder = orders.find((x) => x.id === id);
    const wasDelivered = targetOrder?.status === 'delivered';
    const isNowDelivered = status === 'delivered';

    try {
      await api.orders.updateStatus(id, status);
    } catch { /* mode démo */ }

    setOrders((o) => {
      const updated = o.map((x) => (x.id === id ? { ...x, status } : x));
      localStorage.setItem('malishop_orders', JSON.stringify(updated));
      return updated;
    });

    // Recharger et synchroniser les produits après mise à jour du statut
    try {
      const updatedProducts = await api.products.list();
      if (Array.isArray(updatedProducts) && updatedProducts.length > 0) {
        setProducts(updatedProducts);
        localStorage.setItem('malishop_products', JSON.stringify(updatedProducts));
      }
    } catch {
      // Fallback mode hors-ligne
      if (targetOrder && targetOrder.items) {
        setProducts((currentProds) => {
          const newProds = currentProds.map((prod) => {
            const item = targetOrder.items.find((it: any) => (it.product_id || it.id) === prod.id);
            if (!item) return prod;
            let stock = prod.stock_count;
            let sold = prod.sold_count || 0;
            if (!wasDelivered && isNowDelivered) {
              stock = Math.max(0, stock - item.quantity);
              sold += item.quantity;
            } else if (wasDelivered && !isNowDelivered) {
              stock += item.quantity;
              sold = Math.max(0, sold - item.quantity);
            }
            return { ...prod, stock_count: stock, sold_count: sold };
          });
          localStorage.setItem('malishop_products', JSON.stringify(newProds));
          return newProds;
        });
      }
    }

    onSettingsChanged();
    window.dispatchEvent(new Event('malishop_products_updated'));

    notify(`Statut de la commande mis à jour (${status === 'delivered' ? 'Livrée — Stock déduit' : status})`);
  };

  const saveCategory = async (cat: Partial<Category>) => {
    const payload: Category = {
      id: cat.id || `c${Date.now()}`,
      name: cat.name || '',
      slug: cat.slug || cat.name?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || `cat-${Date.now()}`,
      description: cat.description || '',
      icon: cat.icon || 'Package',
      accent: cat.accent || 'blue',
      sort_order: cat.sort_order ?? categories.length,
    };

    try {
      if (cat.id) {
        await api.categories.update(cat.id, payload);
      } else {
        await api.categories.create(payload);
      }
    } catch (err) {
      console.warn('Erreur API sauvegarde catégorie:', err);
    }

    setCategories((current) => {
      let updated: Category[];
      if (cat.id) {
        updated = current.map((c) => (c.id === cat.id ? { ...c, ...payload } : c));
      } else {
        updated = [...current, payload];
      }
      localStorage.setItem('malishop_categories', JSON.stringify(updated));
      return updated;
    });

    setShowCategoryForm(false);
    setEditingCategory(null);
    onSettingsChanged();
    notify('Catégorie enregistrée avec succès');
  };

  const deleteCategory = async (id: string) => {
    try {
      await api.categories.delete(id);
    } catch (err: any) {
      console.warn(err);
    }
    setCategories((c) => {
      const updated = c.filter((x) => x.id !== id);
      localStorage.setItem('malishop_categories', JSON.stringify(updated));
      return updated;
    });
    setDeleteConfirmCat(null);
    onSettingsChanged();
    notify('Catégorie supprimée');
  };

  /* ── Marques CRUD ── */
  const openBrandForm = (brand: Brand | null) => {
    setEditingBrand(brand);
    setBrandForm(brand ? { ...brand } : { name: '', description: '', logo_url: '', visible: true });
    setShowBrandForm(true);
  };

  const saveBrand = async () => {
    if (!brandForm.name?.trim()) { notify('Le nom de la marque est requis'); return; }
    const oldName = editingBrand?.name;
    const newName = brandForm.name.trim();
    const payload: Brand = {
      id: editingBrand?.id || `b${Date.now()}`,
      name: newName,
      description: brandForm.description || '',
      logo_url: brandForm.logo_url || '',
      visible: brandForm.visible !== false,
    };

    // 1. Sauvegarder via l'API backend si disponible
    try {
      if (editingBrand) {
        await api.brands.update(editingBrand.id, { ...payload, old_name: oldName });
      } else {
        await api.brands.create(payload);
      }
    } catch (e) {
      console.warn('API saveBrand error:', e);
    }

    // 2. Mettre à jour l'état local des marques
    setBrands((prev) => {
      const updated = editingBrand
        ? prev.map((b) => (b.id === editingBrand.id ? payload : b))
        : [...prev, payload];
      localStorage.setItem('malishop_brands', JSON.stringify(updated));
      return updated;
    });

    // 3. CASCADE PRODUITS : Si le nom de la marque a changé, mettre à jour tous les produits qui portaient l'ancien nom !
    if (editingBrand && oldName && oldName !== newName) {
      setProducts((currentProducts) => {
        const updatedProducts = currentProducts.map((p) =>
          p.brand?.toLowerCase() === oldName.toLowerCase() ? { ...p, brand: newName } : p
        );
        localStorage.setItem('malishop_products', JSON.stringify(updatedProducts));
        return updatedProducts;
      });
    }

    setShowBrandForm(false);
    setEditingBrand(null);
    setBrandForm({});
    onSettingsChanged();
    notify(editingBrand ? `Marque "${newName}" mise à jour avec succès` : `Marque "${newName}" ajoutée`);
  };

  const deleteBrand = async (id: string) => {
    try {
      await api.brands.delete(id);
    } catch (e) {
      console.warn('API deleteBrand error:', e);
    }
    setBrands((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      localStorage.setItem('malishop_brands', JSON.stringify(updated));
      return updated;
    });
    setDeleteConfirmBrand(null);
    onSettingsChanged();
    notify('Marque supprimée');
  };

  const toggleBrandVisibility = async (id: string) => {
    const targetBrand = brands.find((b) => b.id === id);
    if (!targetBrand) return;
    const newVisible = !targetBrand.visible;
    try {
      await api.brands.update(id, { ...targetBrand, visible: newVisible });
    } catch (e) {
      console.warn('API toggle visibility error:', e);
    }
    setBrands((prev) => {
      const updated = prev.map((b) => b.id === id ? { ...b, visible: newVisible } : b);
      localStorage.setItem('malishop_brands', JSON.stringify(updated));
      return updated;
    });
    onSettingsChanged();
  };


  const statusColors: Record<string, string> = {
    pending: '#e8a765', confirmed: '#4a9d7e', preparing: '#5b8ec9', shipped: '#7b6cd9', delivered: '#3da777', cancelled: '#db675b',
  };

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total_fcfa || 0), 0);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const deliveredOrdersCount = orders.filter((o) => o.status === 'delivered').length;
  const lowStockProducts = products.filter((p) => (p.stock_count || 0) <= 5);
  const topSellingProducts = [...products].sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0)).slice(0, 5);
  const recentOrders = [...orders].slice(0, 6);

  if (tab === 'login' || !authed) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <section className="admin-modal" onClick={(e) => e.stopPropagation()}>
          <div className="admin-login">
            <div className="admin-login-icon"><Lock size={28} /></div>
            <h2>Espace administrateur</h2>
            <p>Entrez votre mot de passe pour personnaliser votre boutique.</p>
            <div className="admin-password-row">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && login()} placeholder="Mot de passe" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            {error && <p className="form-error">{error}</p>}
            <button className="primary-button full-width" onClick={login} disabled={loginLoading}>
              {loginLoading ? <Loader2 size={16} className="spin" /> : 'Se connecter'}
            </button>
            <button className="text-button center" onClick={onClose} style={{ marginTop: 14 }}>Retour à la boutique</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="admin-overlay">
      <div className="admin-sidebar">
        <div className="admin-brand"><Settings size={20} /> <span>Administration</span></div>
        <nav className="admin-nav">
          <button className={tab === 'dashboard' ? 'active' : ''} onClick={() => setTab('dashboard')}>
            <LayoutDashboard size={17} /> Tableau de bord
          </button>
          <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>
            <Package size={17} /> Produits ({products.length})
          </button>
          <button className={tab === 'categories' ? 'active' : ''} onClick={() => setTab('categories')}>
            <Tag size={17} /> Catégories ({categories.length})
          </button>
          <button className={tab === 'brands' ? 'active' : ''} onClick={() => setTab('brands')}>
            <Star size={17} /> Marques ({brands.length})
          </button>
          <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>
            <ShoppingCart size={17} /> Commandes ({orders.length})
          </button>
          <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>
            <LayoutGrid size={17} /> Contenu de la boutique
          </button>
          <button className={tab === 'security' ? 'active' : ''} onClick={() => setTab('security')}>
            <Shield size={17} /> Sécurité & Accès
          </button>
        </nav>
        <button className="admin-close" onClick={onClose}><X size={18} /> Fermer</button>
      </div>

      <div className="admin-content">
        {/* ─── TAB TABLEAU DE BORD ───────────────────────────────────────────── */}
        {tab === 'dashboard' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>📊 Tableau de Bord</h2>
                <p>Vue d'ensemble en temps réel de votre boutique Diarra Distribution / MaliShop.</p>
              </div>
              <div className="admin-header-actions">
                <button className="primary-button" onClick={() => { setEditingProduct(null); setShowProductForm(true); setTab('products'); }}>
                  <Plus size={16} /> Nouveau produit
                </button>
              </div>
            </div>

            {/* Cartes KPI */}
            <div className="admin-kpi-grid">
              <div className="kpi-card revenue">
                <div className="kpi-card-header">
                  <span className="kpi-title">Chiffre d'Affaires</span>
                  <div className="kpi-icon-wrap green"><TrendingUp size={20} /></div>
                </div>
                <strong className="kpi-amount">{formatPrice(totalRevenue)} FCFA</strong>
                <div className="kpi-meta">
                  <span className="kpi-badge positive">✅ Commandes payées/en cours</span>
                </div>
              </div>

              <div className="kpi-card orders">
                <div className="kpi-card-header">
                  <span className="kpi-title">Commandes Totales</span>
                  <div className="kpi-icon-wrap orange"><ShoppingCart size={20} /></div>
                </div>
                <strong className="kpi-amount">{orders.length}</strong>
                <div className="kpi-meta">
                  <span className="kpi-sub-item"><b>{pendingOrdersCount}</b> en attente</span>
                  <span className="kpi-sub-item">· <b>{deliveredOrdersCount}</b> livrées</span>
                </div>
              </div>

              <div className="kpi-card products">
                <div className="kpi-card-header">
                  <span className="kpi-title">Catalogue Produits</span>
                  <div className="kpi-icon-wrap blue"><Package size={20} /></div>
                </div>
                <strong className="kpi-amount">{products.length}</strong>
                <div className="kpi-meta">
                  <span className="kpi-sub-item"><b>{categories.length}</b> univers / rayons</span>
                </div>
              </div>

              <div className="kpi-card alerts">
                <div className="kpi-card-header">
                  <span className="kpi-title">Stocks Faibles (≤ 5)</span>
                  <div className="kpi-icon-wrap red"><AlertTriangle size={20} /></div>
                </div>
                <strong className="kpi-amount">{lowStockProducts.length}</strong>
                <div className="kpi-meta">
                  <span className={lowStockProducts.length > 0 ? 'kpi-badge warning' : 'kpi-badge positive'}>
                    {lowStockProducts.length > 0 ? '⚠️ Réapprovisionnement requis' : '✅ Tous les stocks sont OK'}
                  </span>
                </div>
              </div>
            </div>

            {/* Grille principale du tableau de bord */}
            <div className="dashboard-main-grid">
              {/* Colonne Gauche : Dernières Commandes */}
              <div className="dashboard-card">
                <div className="dashboard-card-header">
                  <div>
                    <h3>📦 Dernières Commandes</h3>
                    <small>Suivi en direct des achats clients</small>
                  </div>
                  <button className="text-button" onClick={() => setTab('orders')}>
                    Voir tout ({orders.length}) <ArrowUpRight size={14} />
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="admin-empty-compact">
                    <ShoppingCart size={28} />
                    <p>Aucune commande enregistrée pour l'instant.</p>
                  </div>
                ) : (
                  <div className="dashboard-orders-list">
                    {recentOrders.map((o) => (
                      <div className="dashboard-order-row" key={o.id}>
                        <div className="dash-order-left">
                          <div className="dash-order-id">
                            <strong>#{o.id.slice(0, 8).toUpperCase()}</strong>
                            <small>{new Date(o.created_at).toLocaleDateString('fr-FR')}</small>
                          </div>
                          <div className="dash-order-customer">
                            <span>👤 {o.customer_name || 'Client'}</span>
                            <small>📍 {o.city} · {o.phone}</small>
                          </div>
                        </div>
                        <div className="dash-order-right">
                          <strong className="dash-order-total">{formatPrice(o.total_fcfa)} F</strong>
                          <span
                            className="dash-status-pill"
                            style={{ backgroundColor: statusColors[o.status] || '#64748b' }}
                          >
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Colonne Droite : Top Ventes & Stocks Faibles */}
              <div className="dashboard-side-column">
                {/* Top Ventes */}
                <div className="dashboard-card">
                  <div className="dashboard-card-header">
                    <div>
                      <h3>🔥 Top Ventes</h3>
                      <small>Produits les plus populaires</small>
                    </div>
                    <button className="text-button" onClick={() => setTab('products')}>
                      Catalogue <ArrowUpRight size={14} />
                    </button>
                  </div>
                  <div className="top-products-list">
                    {topSellingProducts.map((p, idx) => (
                      <div className="top-product-item" key={p.id}>
                        <span className={`top-rank rank-${idx + 1}`}>{idx + 1}</span>
                        <img src={p.image_url} alt={p.name} />
                        <div className="top-product-info">
                          <strong>{p.name}</strong>
                          <small>{formatPrice(p.price_fcfa)} FCFA</small>
                        </div>
                        <span className="top-sold-badge">{p.sold_count} vendus</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alertes de Stock */}
                {lowStockProducts.length > 0 && (
                  <div className="dashboard-card warning-card">
                    <div className="dashboard-card-header">
                      <div>
                        <h3>⚠️ Alertes Stock Faible</h3>
                        <small>Articles bientôt épuisés</small>
                      </div>
                    </div>
                    <div className="low-stock-list">
                      {lowStockProducts.map((p) => (
                        <div className="low-stock-item" key={p.id}>
                          <img src={p.image_url} alt={p.name} />
                          <div className="low-stock-info">
                            <strong>{p.name}</strong>
                            <small>{p.brand}</small>
                          </div>
                          <span className="stock-critical-badge">{p.stock_count} restant{p.stock_count > 1 ? 's' : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB PARAMÈTRES CONTENU ────────────────────────────────────────── */}
        {tab === 'settings' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div><h2>Contenu & Personnalisation</h2><p>Personnalisez tous les éléments, logos et textes de votre boutique.</p></div>
              <button className={`primary-button ${settingsChanged ? 'pulse' : ''}`} disabled={!settingsChanged} onClick={persistSettings}>{settingsChanged ? 'Enregistrer les modifications' : 'Tout est enregistré'} {settingsChanged && <Check size={15} />}</button>
            </div>

            {/* ─── NOUVEAU : EN-TÊTE & BARRE DE NAVIGATION ───────────────────── */}
            <div className="settings-group">
              <h3>🧭 En-tête & Barre de navigation (Header)</h3>
              
              <div className="settings-row">
                <label>
                  <span>Nom de la boutique (Préfixe)</span>
                  <input
                    value={settings['brand_name_prefix'] || ''}
                    placeholder="Mali (ou Diarra)"
                    onChange={(e) => saveSetting('brand_name_prefix', e.target.value)}
                  />
                </label>
                <label>
                  <span>Suffixe coloré</span>
                  <input
                    value={settings['brand_name_suffix'] || ''}
                    placeholder="shop (ou Distribution)"
                    onChange={(e) => saveSetting('brand_name_suffix', e.target.value)}
                  />
                </label>
              </div>

              <label>
                <span>Image du Logo (Optionnel - URL)</span>
                <input
                  value={settings['brand_logo_image'] || ''}
                  placeholder="https://... ou laisser vide pour l'icône dorée"
                  onChange={(e) => saveSetting('brand_logo_image', e.target.value)}
                />
              </label>

              <label>
                <span>Liens du menu de navigation (séparés par des virgules)</span>
                <input
                  value={settings['header_nav_links'] || ''}
                  placeholder="Accueil, Boutique, Électroménager, Téléphonie, Audio & Image"
                  onChange={(e) => saveSetting('header_nav_links', e.target.value)}
                />
                <small style={{ display: 'block', marginTop: '4px', fontSize: '11px', color: 'var(--muted)' }}>
                  💡 Astuce : tapez les noms exacts de vos catégories pour qu'un clic filtre automatiquement la boutique.
                </small>
              </label>

              <label>
                <span>Texte d'aide de la recherche (Placeholder)</span>
                <input
                  value={settings['header_search_placeholder'] || ''}
                  placeholder="Rechercher un produit, une marque, un modèle..."
                  onChange={(e) => saveSetting('header_search_placeholder', e.target.value)}
                />
              </label>

              <div className="settings-row">
                <label>
                  <span>Libellé Bouton Compte</span>
                  <input
                    value={settings['header_account_label'] || ''}
                    placeholder="Compte (ou Mon Espace)"
                    onChange={(e) => saveSetting('header_account_label', e.target.value)}
                  />
                </label>
                <label>
                  <span>Libellé Bouton Favoris</span>
                  <input
                    value={settings['header_fav_label'] || ''}
                    placeholder="Favoris (ou Mes Envies)"
                    onChange={(e) => saveSetting('header_fav_label', e.target.value)}
                  />
                </label>
                <label>
                  <span>Libellé Bouton Panier</span>
                  <input
                    value={settings['header_cart_label'] || ''}
                    placeholder="Panier"
                    onChange={(e) => saveSetting('header_cart_label', e.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="settings-group">
              <h3>⚡ Bandeau d'annonce supérieur</h3>
              <label><span>Message d'annonce (Livraison, promo...)</span><input value={settings['announcement_text'] || ''} placeholder="Livraison offerte à Bamako dès 250 000 F" onChange={(e) => saveSetting('announcement_text', e.target.value)} /></label>
              <label><span>Numéro d'assistance / Téléphone</span><input value={settings['announcement_phone'] || ''} placeholder="+223 74 79 82 16" onChange={(e) => saveSetting('announcement_phone', e.target.value)} /></label>
            </div>

            {/* ─── SECTION WHATSAPP CLIENT ──────────────────────────────────── */}
            <div className="settings-group">
              <h3>💬 Intégration WhatsApp pour les Clients</h3>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 14px 0' }}>
                Permettez à vos clients de vous contacter directement, de poser des questions et de passer des commandes via WhatsApp.
              </p>

              <div className="settings-row">
                <label>
                  <span>Numéro WhatsApp du magasin</span>
                  <input
                    value={settings['whatsapp_phone'] || ''}
                    placeholder="+223 74 79 82 16"
                    onChange={(e) => saveSetting('whatsapp_phone', e.target.value)}
                  />
                  <small style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                    Format avec ou sans indicatif (ex: +223 74 79 82 16 ou 74 79 82 16)
                  </small>
                </label>
                <label>
                  <span>Message d'accueil par défaut</span>
                  <input
                    value={settings['whatsapp_default_message'] || ''}
                    placeholder="Bonjour DIARRA Distribution, j'aimerais avoir des renseignements."
                    onChange={(e) => saveSetting('whatsapp_default_message', e.target.value)}
                  />
                  <small style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                    Message pré-rempli lorsque le client clique sur le bouton flottant
                  </small>
                </label>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                <label className="filter-toggle">
                  <input
                    type="checkbox"
                    checked={settings['whatsapp_floating_enabled'] !== 'false'}
                    onChange={(e) => saveSetting('whatsapp_floating_enabled', e.target.checked ? 'true' : 'false')}
                  />
                  <span>🟢 Afficher le widget flottant WhatsApp en bas de l'écran</span>
                </label>

                <label className="filter-toggle">
                  <input
                    type="checkbox"
                    checked={settings['whatsapp_order_enabled'] !== 'false'}
                    onChange={(e) => saveSetting('whatsapp_order_enabled', e.target.checked ? 'true' : 'false')}
                  />
                  <span>🛍️ Afficher le bouton « Commander sur WhatsApp » sur les fiches produits et le panier</span>
                </label>
              </div>
            </div>

            {/* ─── NOUVEAU : SECTION OFFRES FLASH LIMITÉES ──────────────────── */}
            <div className="settings-group">
              <h3>🔥 Section Offres Flash Limitées (Ventes Flash)</h3>
              <label className="filter-toggle" style={{ marginBottom: '14px' }}>
                <input
                  type="checkbox"
                  checked={settings['flash_deals_enabled'] !== 'false'}
                  onChange={(e) => saveSetting('flash_deals_enabled', e.target.checked ? 'true' : 'false')}
                />
                <span>Afficher la section Offres Flash sur la page d'accueil</span>
              </label>

              <div className="settings-row">
                <label>
                  <span>Titre de la section</span>
                  <input
                    value={settings['flash_deals_title'] || ''}
                    placeholder="Offres Flash Limitées"
                    onChange={(e) => saveSetting('flash_deals_title', e.target.value)}
                  />
                </label>
                <label>
                  <span>Sous-titre / Message d'urgence</span>
                  <input
                    value={settings['flash_deals_subtitle'] || ''}
                    placeholder="Profitez des réductions exceptionnelles avant la fin du compte à rebours !"
                    onChange={(e) => saveSetting('flash_deals_subtitle', e.target.value)}
                  />
                </label>
              </div>
              <small style={{ display: 'block', marginTop: '6px', fontSize: '12px', color: 'var(--muted)' }}>
                💡 Pour ajouter un produit en Vente Flash : Allez dans l'onglet <strong>Produits</strong> &gt; Modifier un produit &gt; activez l'option <strong>« ⚡ Activer comme Offre Flash »</strong>.
              </small>
            </div>

            {/* ─── SECTION BANNIÈRE PRINCIPALE (CARROUSEL HERO) ─────────────── */}
            <div className="settings-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ margin: 0 }}>🎨 Bannière principale — Carrousel Hero</h3>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 0 0' }}>
                    Personnalisez les textes (titres, surlignage, descriptions), boutons et images pour chacun des 3 slides.
                  </p>
                </div>
                <label className="filter-toggle" style={{ margin: 0, padding: '8px 14px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={settings['hero_autorotate'] === 'true'}
                    onChange={(e) => saveSetting('hero_autorotate', e.target.checked ? 'true' : 'false')}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>🔄 Rotation automatique (7s)</span>
                </label>
              </div>

              {/* Onglets de sélection du slide */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {[
                  { key: '0', label: '🍳 Slide 1 (Accueil / Rouge)', subtitle: 'Bureau, Cuisine & Électro', color: '#fb923c' },
                  { key: '1', label: '🔥 Slide 2 (Bleu nuit)', subtitle: 'Téléphonie High-Tech', color: '#38bdf8' },
                  { key: '2', label: '⚡ Slide 3 (Vert)', subtitle: 'Électroménager & Électronique', color: '#10b981' },
                ].map((st) => (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => setActiveHeroSlideTab(st.key as '0' | '1' | '2')}
                    style={{
                      flex: '1 1 180px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: activeHeroSlideTab === st.key ? `2px solid ${st.color}` : '1px solid var(--border)',
                      background: activeHeroSlideTab === st.key ? 'rgba(255,255,255,0.08)' : 'var(--surface)',
                      color: activeHeroSlideTab === st.key ? '#fff' : 'var(--muted)',
                      fontWeight: activeHeroSlideTab === st.key ? 700 : 500,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    <span style={{ fontSize: '13px', color: activeHeroSlideTab === st.key ? st.color : 'inherit' }}>{st.label}</span>
                    <small style={{ fontSize: '11px', opacity: 0.8 }}>{st.subtitle}</small>
                  </button>
                ))}
              </div>

              {/* Formulaire du slide actif */}
              {[
                {
                  key: '0',
                  label: 'Slide 1 — Accueil / Bureau & Cuisine (Thème Rouge Rubis)',
                  defaultEyebrow: 'Collection Cuisine & Électro',
                  defaultEyebrowIcon: '🍳',
                  defaultTitle: 'Équipez votre',
                  defaultTitleHl: 'Bureau',
                  defaultDesc: 'tous pour lecteur code barre',
                  defaultBtnLabel: "Explorer l'Électroménager",
                  defaultBtnLink: 'Électroménager',
                  defaultBadgeVal: '12 mois',
                  defaultBadgeLabel: 'Garantie produit',
                  defaultImg: '/uploads/imagesjpg_1788005548047_22034.jpg',
                  defaultTag: 'Lecteur Code barre',
                  defaultSub: 'Livraison express Bamako',
                },
                {
                  key: '1',
                  label: 'Slide 2 — Téléphonie & High-Tech (Thème Bleu Nuit)',
                  defaultEyebrow: 'Offres Flash Exclusives',
                  defaultEyebrowIcon: '🔥',
                  defaultTitle: 'Téléphonie &',
                  defaultTitleHl: 'High-Tech',
                  defaultDesc: 'Smartphones, tablettes, accessoires — les meilleures marques à prix imbattables, livrés chez vous.',
                  defaultBtnLabel: 'Voir les offres',
                  defaultBtnLink: 'Téléphonie',
                  defaultBadgeVal: '-30%',
                  defaultBadgeLabel: "Économisez jusqu'à",
                  defaultImg: 'https://images.pexels.com/photos/947407/pexels-photo-947407.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
                  defaultTag: 'Samsung & Apple',
                  defaultSub: 'Stock limité — Commandez vite',
                },
                {
                  key: '2',
                  label: 'Slide 3 — Électroménager & Électronique (Thème Vert)',
                  defaultEyebrow: 'Nouveautés 2026',
                  defaultEyebrowIcon: '⚡',
                  defaultTitle: 'DIARRA',
                  defaultTitleHl: 'Distribution',
                  defaultDesc: "Le meilleur de l'électroménager et de l'électronique, sélectionné pour votre quotidien au Mali.",
                  defaultBtnLabel: 'Découvrir la boutique',
                  defaultBtnLink: 'boutique',
                  defaultBadgeVal: '+2 000',
                  defaultBadgeLabel: 'Clients satisfaits',
                  defaultImg: 'https://images.pexels.com/photos/5556176/pexels-photo-5556176.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
                  defaultTag: 'Réfrigérateur Pro',
                  defaultSub: 'Le choix N°1 à Bamako',
                },
              ]
                .filter((s) => s.key === activeHeroSlideTab)
                .map((slide, idx) => {
                  const key = slide.key;
                  const imgVal = settings[`hero_slide${key}_image`] || '';
                  const previewSrc = imgVal || slide.defaultImg;
                  const mode = slideImageMode[key] || 'upload';
                  const isUploading = slideUploading[key] || false;
                  const uploadErr = slideUploadError[key] || '';
                  const fileRef = slideFileRefs[Number(key)];

                  return (
                    <div
                      key={key}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: '14px',
                        padding: '20px',
                        background: 'var(--surface)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '18px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                        <strong style={{ fontSize: '15px' }}>{slide.label}</strong>
                      </div>

                      {/* 1. Zone Titres & Textes (Zone encadrée en rouge) */}
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px' }}>
                        <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--accent, #10b981)', fontWeight: 700, display: 'block', marginBottom: '12px' }}>
                          ✍️ Titres & Description (Zone principale)
                        </span>

                        <div className="settings-row" style={{ marginBottom: '12px' }}>
                          <label style={{ flex: 1 }}>
                            <span>Titre principal</span>
                            <input
                              value={settings[`hero_slide${key}_title`] ?? ''}
                              placeholder={slide.defaultTitle}
                              onChange={(e) => saveSetting(`hero_slide${key}_title`, e.target.value)}
                            />
                          </label>
                          <label style={{ flex: 1 }}>
                            <span>Texte surligné en dégradé (Couleur)</span>
                            <input
                              value={settings[`hero_slide${key}_title_hl`] ?? ''}
                              placeholder={slide.defaultTitleHl}
                              onChange={(e) => saveSetting(`hero_slide${key}_title_hl`, e.target.value)}
                            />
                          </label>
                        </div>

                        <label style={{ marginBottom: '12px', display: 'block' }}>
                          <span>Description du slide</span>
                          <textarea
                            rows={2}
                            value={settings[`hero_slide${key}_desc`] ?? ''}
                            placeholder={slide.defaultDesc}
                            onChange={(e) => saveSetting(`hero_slide${key}_desc`, e.target.value)}
                          />
                        </label>

                        <div className="settings-row">
                          <label style={{ flex: '0 0 90px' }}>
                            <span>Icône badge</span>
                            <input
                              value={settings[`hero_slide${key}_eyebrow_icon`] ?? ''}
                              placeholder={slide.defaultEyebrowIcon}
                              onChange={(e) => saveSetting(`hero_slide${key}_eyebrow_icon`, e.target.value)}
                              style={{ textAlign: 'center', fontSize: '16px' }}
                            />
                          </label>
                          <label style={{ flex: 1 }}>
                            <span>Texte du petit bandeau supérieur</span>
                            <input
                              value={settings[`hero_slide${key}_eyebrow`] ?? ''}
                              placeholder={slide.defaultEyebrow}
                              onChange={(e) => saveSetting(`hero_slide${key}_eyebrow`, e.target.value)}
                            />
                          </label>
                        </div>
                      </div>

                      {/* 2. Bouton d'action & Statistiques */}
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px' }}>
                        <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--accent, #10b981)', fontWeight: 700, display: 'block', marginBottom: '12px' }}>
                          🔘 Bouton d'action & Pastille statistique
                        </span>

                        <div className="settings-row" style={{ marginBottom: '12px' }}>
                          <label style={{ flex: 1 }}>
                            <span>Libellé du bouton</span>
                            <input
                              value={settings[`hero_slide${key}_btn_label`] ?? ''}
                              placeholder={slide.defaultBtnLabel}
                              onChange={(e) => saveSetting(`hero_slide${key}_btn_label`, e.target.value)}
                            />
                          </label>
                          <label style={{ flex: 1 }}>
                            <span>Lien / Catégorie cible au clic</span>
                            <input
                              list="hero-categories-datalist"
                              value={settings[`hero_slide${key}_btn_link`] ?? ''}
                              placeholder={slide.defaultBtnLink}
                              onChange={(e) => saveSetting(`hero_slide${key}_btn_link`, e.target.value)}
                            />
                            <datalist id="hero-categories-datalist">
                              <option value="boutique" />
                              <option value="Tous les produits" />
                              {categories.map((c) => (
                                <option key={c.id} value={c.name} />
                              ))}
                            </datalist>
                          </label>
                        </div>

                        <div className="settings-row">
                          <label style={{ flex: 1 }}>
                            <span>Valeur statistique / Réduction</span>
                            <input
                              value={settings[`hero_slide${key}_badge_val`] ?? ''}
                              placeholder={slide.defaultBadgeVal}
                              onChange={(e) => saveSetting(`hero_slide${key}_badge_val`, e.target.value)}
                            />
                          </label>
                          <label style={{ flex: 1 }}>
                            <span>Libellé sous la valeur</span>
                            <input
                              value={settings[`hero_slide${key}_badge_label`] ?? ''}
                              placeholder={slide.defaultBadgeLabel}
                              onChange={(e) => saveSetting(`hero_slide${key}_badge_label`, e.target.value)}
                            />
                          </label>
                        </div>
                      </div>

                      {/* 3. Visuel & Image du slide */}
                      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px' }}>
                        <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--accent, #10b981)', fontWeight: 700, display: 'block', marginBottom: '12px' }}>
                          🖼️ Image & Étiquette flottante du slide
                        </span>

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                          {/* Aperçu en direct */}
                          <div style={{ flexShrink: 0, width: '140px', height: '110px', borderRadius: '10px', overflow: 'hidden', border: '2px solid var(--border)', background: '#111', position: 'relative' }}>
                            {isUploading && (
                              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', zIndex: 2 }}>
                                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#fff' }} />
                              </div>
                            )}
                            <img
                              src={previewSrc}
                              alt={`Aperçu slide ${key}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { (e.target as HTMLImageElement).src = slide.defaultImg; }}
                            />
                          </div>

                          {/* Contrôles Upload / URL */}
                          <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div className="image-mode-switch">
                              <button
                                type="button"
                                className={mode === 'upload' ? 'active' : ''}
                                onClick={() => setSlideImageMode((m) => ({ ...m, [key]: 'upload' }))}
                              >
                                <Upload size={12} /> Téléverser un fichier
                              </button>
                              <button
                                type="button"
                                className={mode === 'url' ? 'active' : ''}
                                onClick={() => setSlideImageMode((m) => ({ ...m, [key]: 'url' }))}
                              >
                                <LinkIcon size={12} /> Lien URL
                              </button>
                            </div>

                            <input
                              type="file"
                              ref={fileRef}
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleSlideImageUpload(key, file);
                                e.target.value = '';
                              }}
                            />

                            {mode === 'upload' ? (
                              imgVal ? (
                                <div className="image-preview-card" style={{ padding: '10px 12px' }}>
                                  <div className="preview-details" style={{ gap: '6px' }}>
                                    <strong style={{ fontSize: '12px' }}>✅ Image personnalisée active</strong>
                                    <span className="preview-path" style={{ fontSize: '11px' }}>
                                      {imgVal.startsWith('data:') ? 'Image locale' : imgVal.slice(0, 55) + (imgVal.length > 55 ? '…' : '')}
                                    </span>
                                    <div className="preview-actions">
                                      <button
                                        type="button"
                                        className="preview-btn-change"
                                        onClick={() => fileRef.current?.click()}
                                        disabled={isUploading}
                                      >
                                        <Upload size={12} /> Remplacer
                                      </button>
                                      <button
                                        type="button"
                                        className="preview-btn-remove"
                                        onClick={() => saveSetting(`hero_slide${key}_image`, '')}
                                      >
                                        <Trash2 size={12} /> Réinitialiser
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className={`image-dropzone${isUploading ? ' uploading' : ''}`}
                                  style={{ minHeight: '80px', padding: '14px' }}
                                  onDragOver={(e) => e.preventDefault()}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    const file = e.dataTransfer.files?.[0];
                                    if (file) handleSlideImageUpload(key, file);
                                  }}
                                  onClick={() => !isUploading && fileRef.current?.click()}
                                >
                                  <div className="dropzone-content">
                                    {isUploading ? (
                                      <><Loader2 size={22} className="spin-icon" /><strong>Téléversement…</strong></>
                                    ) : (
                                      <>
                                        <div className="dropzone-icon"><Upload size={20} /></div>
                                        <strong style={{ fontSize: '12px' }}>Cliquez ou glissez une image ici</strong>
                                        <small>JPG, PNG, WebP — Max 10 Mo</small>
                                        <button type="button" className="browse-files-btn" style={{ fontSize: '12px', padding: '6px 14px' }}>
                                          <ImageIcon size={13} /> Parcourir
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )
                            ) : (
                              <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', margin: 0 }}>
                                <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>URL de l'image</span>
                                <input
                                  value={imgVal}
                                  placeholder={slide.defaultImg}
                                  onChange={(e) => saveSetting(`hero_slide${key}_image`, e.target.value)}
                                  style={{ fontSize: '12px' }}
                                />
                              </label>
                            )}

                            {uploadErr && <p style={{ color: '#f87171', fontSize: '12px', margin: 0 }}>⚠️ {uploadErr}</p>}

                            <div style={{ display: 'flex', gap: '8px' }}>
                              <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', margin: 0 }}>
                                <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Étiquette sur l'image</span>
                                <input
                                  value={settings[`hero_slide${key}_tag`] ?? ''}
                                  placeholder={slide.defaultTag}
                                  onChange={(e) => saveSetting(`hero_slide${key}_tag`, e.target.value)}
                                  style={{ fontSize: '12px' }}
                                />
                              </label>
                              <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', margin: 0 }}>
                                <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Sous-titre étiquette</span>
                                <input
                                  value={settings[`hero_slide${key}_tagsub`] ?? ''}
                                  placeholder={slide.defaultSub}
                                  onChange={(e) => saveSetting(`hero_slide${key}_tagsub`, e.target.value)}
                                  style={{ fontSize: '12px' }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="settings-group">
              <h3>Section promotionnelle</h3>
              <label><span>Petit titre</span><input value={settings['promo_eyebrow'] || ''} onChange={(e) => saveSetting('promo_eyebrow', e.target.value)} /></label>
              <label><span>Titre</span><input value={settings['promo_title'] || ''} onChange={(e) => saveSetting('promo_title', e.target.value)} /></label>
              <label><span>Description</span><textarea value={settings['promo_description'] || ''} onChange={(e) => saveSetting('promo_description', e.target.value)} /></label>
              <label><span>Texte du bouton</span><input value={settings['promo_button'] || ''} onChange={(e) => saveSetting('promo_button', e.target.value)} /></label>
              <div className="settings-row">
                <label><span>Réduction affichée</span><input value={settings['promo_discount'] || ''} onChange={(e) => saveSetting('promo_discount', e.target.value)} /></label>
                <label><span>Texte réduction</span><input value={settings['promo_discount_label'] || ''} onChange={(e) => saveSetting('promo_discount_label', e.target.value)} /></label>
              </div>
            </div>
            <div className="settings-group">
              <h3>Pied de page</h3>
              <label><span>Slogan</span><input value={settings['footer_tagline'] || ''} onChange={(e) => saveSetting('footer_tagline', e.target.value)} /></label>
              <label><span>Copyright</span><input value={settings['footer_copyright'] || ''} onChange={(e) => saveSetting('footer_copyright', e.target.value)} /></label>
            </div>
            <div className="settings-group">
              <h3><Shield size={17} /> Sécurité & Mot de passe administrateur</h3>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
                Pour personnaliser votre mot de passe administrateur de façon sécurisée et sans impacter votre base de données :
              </p>
              <button
                type="button"
                className="primary-button"
                onClick={() => setTab('security')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                <Shield size={16} /> Gérer le mot de passe administrateur
              </button>
            </div>
          </div>
        )}

        {/* ─── TAB SÉCURITÉ & ACCÈS ADMIN ──────────────────────────────────── */}
        {tab === 'security' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>🔐 Sécurité & Accès Administrateur</h2>
                <p>Personnalisez le mot de passe d'accès à l'espace d'administration de votre boutique.</p>
              </div>
            </div>

            <div className="admin-security-card">
              <div className="admin-security-banner">
                <div className="admin-security-icon">
                  <Shield size={28} />
                </div>
                <div>
                  <h3>Mot de passe d'administration</h3>
                  <p>
                    Ce mot de passe protège l'accès à la modification de vos produits, prix, commandes et paramètres.
                    Toute modification est enregistrée directement dans votre base de données en ligne <strong>sans risque pour vos produits ni vos données</strong>.
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateAdminPassword} className="admin-security-form">
                <div className="security-form-group">
                  <label>
                    <span>Mot de passe actuel (si déjà configuré)</span>
                    <div className="admin-password-row">
                      <input
                        type={showCurrentAdminPassword ? 'text' : 'password'}
                        value={currentAdminPassword}
                        onChange={(e) => setCurrentAdminPassword(e.target.value)}
                        placeholder="Entrez votre mot de passe actuel"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentAdminPassword(!showCurrentAdminPassword)}
                        title={showCurrentAdminPassword ? 'Masquer' : 'Afficher'}
                      >
                        {showCurrentAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </label>
                </div>

                <div className="security-form-grid">
                  <label>
                    <span>Nouveau mot de passe *</span>
                    <div className="admin-password-row">
                      <input
                        type={showNewAdminPassword ? 'text' : 'password'}
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="Min. 4 caractères"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewAdminPassword(!showNewAdminPassword)}
                        title={showNewAdminPassword ? 'Masquer' : 'Afficher'}
                      >
                        {showNewAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </label>

                  <label>
                    <span>Confirmer le nouveau mot de passe *</span>
                    <div className="admin-password-row">
                      <input
                        type={showConfirmAdminPassword ? 'text' : 'password'}
                        value={confirmAdminPassword}
                        onChange={(e) => setConfirmAdminPassword(e.target.value)}
                        placeholder="Répétez le nouveau mot de passe"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmAdminPassword(!showConfirmAdminPassword)}
                        title={showConfirmAdminPassword ? 'Masquer' : 'Afficher'}
                      >
                        {showConfirmAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </label>
                </div>

                {passwordMsg.text && (
                  <div className={`security-alert ${passwordMsg.type === 'success' ? 'security-alert-success' : 'security-alert-error'}`}>
                    {passwordMsg.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
                    <span>{passwordMsg.text}</span>
                  </div>
                )}

                <div className="security-form-actions">
                  <button
                    type="submit"
                    className="primary-button"
                    disabled={updatingPassword || !newAdminPassword.trim()}
                  >
                    {updatingPassword ? (
                      <>
                        <Loader2 size={16} className="spin" /> Enregistrement en cours...
                      </>
                    ) : (
                      <>
                        <KeyRound size={16} /> Enregistrer le nouveau mot de passe
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {tab === 'products' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>Produits ({products.length})</h2>
                <p>Gérez votre catalogue de produits et vos offres promotionnelles.</p>
              </div>
              <button className="primary-button" onClick={() => { setEditingProduct(null); setShowProductForm(true); }}><Plus size={16} /> Ajouter un produit</button>
            </div>

            {/* Filtre rapide Produits / Offres Flash */}
            {!showProductForm && (
              <div className="admin-filter-bar">
                <button
                  className={`admin-filter-pill ${productFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setProductFilter('all')}
                >
                  Tous les produits ({products.length})
                </button>
                <button
                  className={`admin-filter-pill ${productFilter === 'flash' ? 'active' : ''}`}
                  onClick={() => setProductFilter('flash')}
                >
                  <Flame size={14} fill="currentColor" /> Offres Flash actives ({products.filter((p) => p.deal_ends_at && p.old_price_fcfa).length})
                </button>
              </div>
            )}

            {showProductForm ? (
              <ProductForm product={editingProduct} categories={categories} brands={brands} onSave={saveProduct} onCancel={() => { setShowProductForm(false); setEditingProduct(null); }} />
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Produit</th><th>Marque</th><th>Prix</th><th>Statut Flash</th><th>Stock</th><th>Vendus</th><th>Actions</th></tr></thead>
                  <tbody>
                    {products
                      .filter((p) => productFilter === 'all' || (productFilter === 'flash' && p.deal_ends_at && p.old_price_fcfa))
                      .map((p) => {
                        const isFlash = Boolean(p.deal_ends_at && p.old_price_fcfa);
                        const discount = p.old_price_fcfa ? Math.round((1 - p.price_fcfa / p.old_price_fcfa) * 100) : 0;
                        return (
                          <tr key={p.id}>
                            <td className="admin-product-cell">
                              <img src={p.image_url} alt={p.name} />
                              <div>
                                <span>{p.name}</span>
                                {p.badge && <small className="admin-prod-badge">{p.badge}</small>}
                              </div>
                            </td>
                            <td>{p.brand}</td>
                            <td>
                              <strong>{formatPrice(p.price_fcfa)} F</strong>
                              {p.old_price_fcfa && <del className="admin-old-price">{formatPrice(p.old_price_fcfa)} F</del>}
                            </td>
                            <td>
                              {isFlash ? (
                                <span className="flash-table-badge">
                                  <Flame size={12} fill="currentColor" /> Flash -{discount}%
                                </span>
                              ) : (
                                <span className="normal-table-badge">Standard</span>
                              )}
                            </td>
                            <td>{p.stock_count}</td>
                            <td>{p.sold_count}</td>
                            <td className="admin-actions">
                              <button onClick={() => { setEditingProduct(p); setShowProductForm(true); }}>Modifier</button>
                              <button className="danger" onClick={() => deleteProduct(p.id)}><Trash2 size={14} /></button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'categories' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div><h2>Catégories ({categories.length})</h2><p>Gérez les catégories de votre boutique.</p></div>
              {!showCategoryForm && (
                <button className="primary-button" onClick={() => { setEditingCategory(null); setShowCategoryForm(true); }}>
                  <Plus size={16} /> Ajouter
                </button>
              )}
            </div>

            {showCategoryForm && (
              <CategoryForm
                category={editingCategory}
                sortOrderDefault={categories.length}
                onSave={saveCategory}
                onCancel={() => { setShowCategoryForm(false); setEditingCategory(null); }}
              />
            )}

            {!showCategoryForm && (
              <div className="admin-cat-list">
                {categories.map((c) => (
                  <div className="admin-cat-row" key={c.id}>
                    <span className={`admin-cat-icon accent-${c.accent}`}>
                      <Tag size={16} />
                    </span>
                    <div className="admin-cat-info">
                      <strong>{c.name}</strong>
                      <small>{c.description || <em>Pas de description</em>}</small>
                      <span className="admin-cat-meta">Icône : {c.icon} · Couleur : {c.accent} · Ordre : {c.sort_order}</span>
                    </div>
                    <div className="admin-cat-actions">
                      <button
                        className="icon-btn-edit"
                        title="Modifier"
                        onClick={() => { setEditingCategory(c); setShowCategoryForm(true); }}
                      >
                        <Pencil size={15} />
                      </button>
                      {deleteConfirmCat === c.id ? (
                        <span className="delete-confirm-inline">
                          <span>Supprimer ?</span>
                          <button className="danger-sm" onClick={() => deleteCategory(c.id)}>Oui</button>
                          <button className="cancel-sm" onClick={() => setDeleteConfirmCat(null)}>Non</button>
                        </span>
                      ) : (
                        <button
                          className="icon-btn-danger"
                          title="Supprimer"
                          onClick={() => setDeleteConfirmCat(c.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="admin-empty">
                    <FolderOpen size={32} />
                    <p>Aucune catégorie. Cliquez sur « Ajouter » pour commencer.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB MARQUES ──────────────────────────────────────────────────── */}
        {tab === 'brands' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>🏷️ Marques ({brands.length})</h2>
                <p>Gérez les marques disponibles dans les filtres de votre boutique.</p>
              </div>
              {!showBrandForm && (
                <button className="primary-button" onClick={() => openBrandForm(null)}>
                  <Plus size={16} /> Ajouter une marque
                </button>
              )}
            </div>

            {/* Formulaire d'ajout / édition */}
            {showBrandForm && (
              <div className="admin-form-box">
                <h3>{editingBrand ? '✏️ Modifier la marque' : '➕ Nouvelle marque'}</h3>
                <div className="settings-row">
                  <label>
                    <span>Nom de la marque *</span>
                    <input
                      value={brandForm.name || ''}
                      placeholder="ex: Samsung, LG, Apple..."
                      onChange={(e) => setBrandForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </label>
                  <label>
                    <span>Description courte</span>
                    <input
                      value={brandForm.description || ''}
                      placeholder="ex: Smartphones haut de gamme"
                      onChange={(e) => setBrandForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </label>
                </div>
                <label>
                  <span>URL du logo (optionnel)</span>
                  <input
                    value={brandForm.logo_url || ''}
                    placeholder="https://exemple.com/logo.png"
                    onChange={(e) => setBrandForm((f) => ({ ...f, logo_url: e.target.value }))}
                  />
                </label>
                {brandForm.logo_url && (
                  <div className="brand-logo-preview">
                    <img src={brandForm.logo_url} alt="Aperçu logo" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
                <label className="filter-toggle" style={{ marginTop: '12px' }}>
                  <input
                    type="checkbox"
                    checked={brandForm.visible !== false}
                    onChange={(e) => setBrandForm((f) => ({ ...f, visible: e.target.checked }))}
                  />
                  <span>Visible dans les filtres de la boutique</span>
                </label>
                <div className="admin-form-actions">
                  <button className="primary-button" onClick={saveBrand}>
                    <Check size={16} /> {editingBrand ? 'Mettre à jour' : 'Ajouter'}
                  </button>
                  <button className="cancel-button" onClick={() => { setShowBrandForm(false); setEditingBrand(null); setBrandForm({}); }}>
                    <X size={16} /> Annuler
                  </button>
                </div>
              </div>
            )}

            {/* Liste des marques */}
            {!showBrandForm && (
              <div className="admin-brands-list">
                {brands.length === 0 ? (
                  <div className="admin-empty">
                    <Star size={32} />
                    <p>Aucune marque. Cliquez sur « Ajouter une marque » pour commencer.</p>
                  </div>
                ) : (
                  brands.map((b) => (
                    <div className={`admin-brand-row ${!b.visible ? 'brand-hidden' : ''}`} key={b.id}>
                      <div className="admin-brand-logo">
                        {b.logo_url ? (
                          <img src={b.logo_url} alt={b.name} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        ) : (
                          <div className="brand-logo-placeholder"><Star size={18} /></div>
                        )}
                      </div>
                      <div className="admin-brand-info">
                        <strong>{b.name}</strong>
                        {b.description && <small>{b.description}</small>}
                        <span className={`brand-visibility-badge ${b.visible ? 'visible' : 'hidden'}`}>
                          {b.visible ? '👁 Visible dans les filtres' : '🚫 Masquée des filtres'}
                        </span>
                        <span className="brand-product-count">
                          {products.filter((p) => p.brand === b.name).length} produit(s)
                        </span>
                      </div>
                      <div className="admin-brand-actions">
                        <button
                          className={`icon-btn-toggle ${b.visible ? 'active' : ''}`}
                          title={b.visible ? 'Masquer' : 'Afficher'}
                          onClick={() => toggleBrandVisibility(b.id)}
                        >
                          {b.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                        <button
                          className="icon-btn-edit"
                          title="Modifier"
                          onClick={() => openBrandForm(b)}
                        >
                          <Pencil size={15} />
                        </button>
                        {deleteConfirmBrand === b.id ? (
                          <span className="delete-confirm-inline">
                            <span>Supprimer ?</span>
                            <button className="danger-sm" onClick={() => deleteBrand(b.id)}>Oui</button>
                            <button className="cancel-sm" onClick={() => setDeleteConfirmBrand(null)}>Non</button>
                          </span>
                        ) : (
                          <button
                            className="icon-btn-danger"
                            title="Supprimer"
                            onClick={() => setDeleteConfirmBrand(b.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="admin-brands-info">
              <small>💡 Les marques masquées n'apparaissent plus dans le panneau de filtres de la boutique. Les produits associés restent accessibles dans le catalogue.</small>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <h2>Commandes ({orders.length})</h2>
                <p>Suivez et mettez à jour le statut des commandes enregistrées en ligne.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '6px 12px', borderRadius: '999px', fontWeight: 700 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                  Base PostgreSQL en ligne connectée
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    notify('Actualisation des commandes...');
                    try {
                      const fresh = await api.orders.list();
                      if (Array.isArray(fresh)) {
                        setOrders(fresh);
                        localStorage.setItem('malishop_orders', JSON.stringify(fresh));
                        notify('Commandes actualisées avec succès !');
                      }
                    } catch {
                      notify('Erreur de connexion avec la base en ligne.');
                    }
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', border: '1px solid #cbd5e1', background: 'white', color: '#334155' }}
                >
                  <RefreshCw size={14} /> Actualiser
                </button>
              </div>
            </div>
            {orders.length === 0 ? (
              <div className="admin-empty"><ShoppingCart size={32} /><p>Aucune commande pour le moment.</p></div>
            ) : (
              <div className="admin-orders">
                {orders.map((o) => (
                  <div className="admin-order-card" key={o.id}>
                    <div className="admin-order-top">
                      <div><strong>#{o.id.slice(0, 8).toUpperCase()}</strong><span>{new Date(o.created_at).toLocaleDateString('fr-FR')}</span></div>
                      <span className="admin-order-status" style={{ background: statusColors[o.status] || '#999' }}>{o.status}</span>
                    </div>
                    <div className="admin-order-info">
                      <span>{o.customer_name}</span><span>{o.phone}</span><span>{o.city}</span>
                    </div>
                    {o.items && o.items.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', margin: '6px 0' }}>
                        {o.items.map((it: any, idx: number) => (
                          <span key={idx} style={{ fontSize: '11px', background: '#f1f5f9', color: '#334155', padding: '2px 6px', borderRadius: '4px', fontWeight: 500 }}>
                            📦 {it.product_name} × {it.quantity}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="admin-order-bottom">
                      <strong>{formatPrice(o.total_fcfa)} F</strong>
                      <select value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)}>
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmée</option>
                        <option value="preparing">En préparation</option>
                        <option value="shipped">Expédiée</option>
                        <option value="delivered">Livrée</option>
                        <option value="cancelled">Annulée</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {toast && <div className="toast admin-toast"><Check size={16} /> {toast}</div>}
    </div>
  );
}

function ProductForm({ product, categories, brands = [], onSave, onCancel }: { product: Product | null; categories: Category[]; brands?: Brand[]; onSave: (p: Partial<Product>) => Promise<void> | void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    brand: product?.brand || '',
    description: product?.description || '',
    price_fcfa: product?.price_fcfa || 0,
    old_price_fcfa: product?.old_price_fcfa || 0,
    image_url: product?.image_url || '',
    badge: product?.badge || '',
    stock_count: product?.stock_count || 0,
    featured: product?.featured || false,
    category_id: product?.category_id || categories[0]?.id || '',
    is_flash_deal: Boolean(product?.deal_ends_at),
    deal_ends_at: product?.deal_ends_at || '',
  });

  const [isSaving, setIsSaving] = useState(false);

  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP, etc.).');
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        try {
          // Upload vers le backend local
          const res = await api.upload.image({ image: base64, filename: file.name });
          if (res?.url) {
            update('image_url', res.url);
          } else {
            update('image_url', base64);
          }
        } catch {
          // Fallback base64 direct si l'API n'a pas répondu
          update('image_url', base64);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadError('Erreur lors de la lecture du fichier.');
      setIsUploading(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="product-form">
      <h3>{product ? 'Modifier le produit' : 'Nouveau produit'}</h3>
      <div className="form-grid">
        <label><span>Nom</span><input value={form.name} onChange={(e) => update('name', e.target.value)} /></label>
        <label>
          <span>Marque</span>
          <input
            list="admin-brands-datalist"
            value={form.brand}
            placeholder="Sélectionner ou saisir une marque..."
            onChange={(e) => update('brand', e.target.value)}
          />
          <datalist id="admin-brands-datalist">
            {brands.map((b) => (
              <option key={b.id} value={b.name} />
            ))}
          </datalist>
        </label>
      </div>

      {/* ─── SECTION IMAGE AVEC UPLOAD ET URL ────────────────────────────────── */}
      <div className="form-image-section">
        <div className="image-section-header">
          <span>Image du produit *</span>
          <div className="image-mode-switch">
            <button
              type="button"
              className={imageMode === 'upload' ? 'active' : ''}
              onClick={() => setImageMode('upload')}
            >
              <Upload size={13} /> Téléverser un fichier
            </button>
            <button
              type="button"
              className={imageMode === 'url' ? 'active' : ''}
              onClick={() => setImageMode('url')}
            >
              <LinkIcon size={13} /> Lien URL
            </button>
          </div>
        </div>

        {imageMode === 'upload' ? (
          <div className="image-upload-wrapper">
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileInputChange}
              accept="image/*"
              style={{ display: 'none' }}
            />

            {!form.image_url ? (
              <div
                className={`image-dropzone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <div className="dropzone-content">
                    <Loader2 size={32} className="spin-icon" />
                    <strong>Téléversement de l'image...</strong>
                  </div>
                ) : (
                  <div className="dropzone-content">
                    <div className="dropzone-icon">
                      <Upload size={28} />
                    </div>
                    <strong>Cliquez pour choisir une photo ou glissez-la ici</strong>
                    <small>Formats supportés : JPG, PNG, WebP, GIF (Max 10 Mo)</small>
                    <button type="button" className="browse-files-btn">
                      <ImageIcon size={15} /> Parcourir mes photos
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="image-preview-card">
                <div className="preview-thumbnail">
                  <img src={form.image_url} alt="Aperçu du produit" />
                </div>
                <div className="preview-details">
                  <strong>✅ Image sélectionnée</strong>
                  <span className="preview-path">{form.image_url.startsWith('data:') ? 'Image locale prête' : form.image_url}</span>
                  <div className="preview-actions">
                    <button
                      type="button"
                      className="preview-btn-change"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={13} /> Remplacer l'image
                    </button>
                    <button
                      type="button"
                      className="preview-btn-remove"
                      onClick={() => update('image_url', '')}
                    >
                      <Trash2 size={13} /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {uploadError && <p className="form-error">{uploadError}</p>}
          </div>
        ) : (
          <div className="image-url-wrapper">
            <input
              value={form.image_url}
              onChange={(e) => update('image_url', e.target.value)}
              placeholder="https://images.pexels.com/... ou https://..."
            />
            {form.image_url && (
              <div className="image-url-preview">
                <img src={form.image_url} alt="Aperçu" onError={() => setUploadError('URL d\'image invalide ou inaccessible')} />
                <span>Aperçu en direct</span>
              </div>
            )}
          </div>
        )}
      </div>

      <label><span>Description</span><textarea value={form.description} onChange={(e) => update('description', e.target.value)} /></label>
      <div className="form-grid">
        <label>
          <span>Prix promo / de vente (FCFA) *</span>
          <input
            type="number"
            min="0"
            value={form.price_fcfa === 0 ? '' : form.price_fcfa}
            onChange={(e) => update('price_fcfa', e.target.value === '' ? 0 : Number(e.target.value))}
            placeholder="0"
          />
        </label>
        <label>
          <span>Ancien prix avant réduction (FCFA)</span>
          <input
            type="number"
            min="0"
            value={form.old_price_fcfa === 0 || !form.old_price_fcfa ? '' : form.old_price_fcfa}
            onChange={(e) => update('old_price_fcfa', e.target.value === '' ? 0 : Number(e.target.value))}
            placeholder="Ex : 120000 (barré)"
          />
        </label>
      </div>

      {/* ─── NOUVEAU : CONFIGURATION OFFRE FLASH LIMITÉE ────────────────────── */}
      <div className="flash-deal-box">
        <div className="flash-deal-header-row">
          <div className="flash-deal-title-col">
            <span className="flash-badge-pill"><Flame size={14} /> Offre Flash Limitée</span>
            <p>Afficher ce produit dans la section "Offres Flash Limitées" avec compte à rebours interactif</p>
          </div>
          <label className="filter-toggle" style={{ margin: 0 }}>
            <input
              type="checkbox"
              checked={form.is_flash_deal}
              onChange={(e) => {
                const checked = e.target.checked;
                update('is_flash_deal', checked);
                if (checked && !form.deal_ends_at) {
                  // Défaut : +48h
                  const defaultEndDate = new Date(Date.now() + 48 * 3600 * 1000).toISOString();
                  update('deal_ends_at', defaultEndDate);
                }
              }}
            />
            <strong>{form.is_flash_deal ? 'Activé' : 'Désactivé'}</strong>
          </label>
        </div>

        {form.is_flash_deal && (
          <div className="flash-deal-details">
            <div className="flash-deal-presets">
              <span className="preset-label">Raccourcis de durée :</span>
              <div className="preset-buttons">
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => update('deal_ends_at', new Date(Date.now() + 24 * 3600 * 1000).toISOString())}
                >
                  ⏱️ +24h (1 jour)
                </button>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => update('deal_ends_at', new Date(Date.now() + 48 * 3600 * 1000).toISOString())}
                >
                  ⏱️ +48h (2 jours)
                </button>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => update('deal_ends_at', new Date(Date.now() + 72 * 3600 * 1000).toISOString())}
                >
                  ⏱️ +72h (3 jours)
                </button>
                <button
                  type="button"
                  className="preset-btn"
                  onClick={() => update('deal_ends_at', new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString())}
                >
                  ⏱️ +7 jours
                </button>
              </div>
            </div>

            <div className="form-grid" style={{ marginTop: '12px', alignItems: 'flex-start' }}>
              <label>
                <span>Date & Heure de fin de l'Offre Flash *</span>
                <input
                  type="datetime-local"
                  value={form.deal_ends_at ? new Date(form.deal_ends_at).toISOString().slice(0, 16) : ''}
                  onChange={(e) => update('deal_ends_at', e.target.value ? new Date(e.target.value).toISOString() : '')}
                />
              </label>

              <div className="flash-summary-card">
                <span>Aperçu de la réduction :</span>
                {form.old_price_fcfa && form.old_price_fcfa > form.price_fcfa ? (
                  <div className="discount-calc">
                    <span className="discount-pill">-{Math.round((1 - form.price_fcfa / form.old_price_fcfa) * 100)}%</span>
                    <small>Économie de {(form.old_price_fcfa - form.price_fcfa).toLocaleString('fr-FR')} FCFA</small>
                  </div>
                ) : (
                  <small className="discount-warning">⚠️ Pour afficher le badge de réduction -XX%, renseignez un Ancien prix supérieur au Prix de vente ci-dessus.</small>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="form-grid">
        <label><span>Stock disponible</span><input type="number" value={form.stock_count} onChange={(e) => update('stock_count', Number(e.target.value))} /></label>
        <label><span>Badge personnalisé</span><input value={form.badge} onChange={(e) => update('badge', e.target.value)} placeholder="Ex : -15%, Nouveau, Promo..." /></label>
      </div>
      <label><span>Catégorie</span><select value={form.category_id} onChange={(e) => update('category_id', e.target.value)}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label className="filter-toggle"><input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} /><span>Mettre en avant sur la page d'accueil (Vedette)</span></label>
      <div className="product-form-actions">
        <button className="text-button" onClick={onCancel} disabled={isSaving}>Annuler</button>
        <button
          className="primary-button"
          disabled={isSaving}
          onClick={async () => {
            const finalDealEnds = form.is_flash_deal
              ? (form.deal_ends_at || new Date(Date.now() + 48 * 3600 * 1000).toISOString())
              : null;
            const priceNum = Math.max(0, Number(form.price_fcfa) || 0);
            const rawOldPrice = Number(form.old_price_fcfa) || 0;
            const cleanOldPrice = rawOldPrice > priceNum ? rawOldPrice : null;

            setIsSaving(true);
            try {
              await onSave({
                ...(product || {}),
                ...form,
                id: product?.id,
                slug: product?.slug || form.slug,
                price_fcfa: priceNum,
                old_price_fcfa: cleanOldPrice,
                badge: form.badge ? form.badge.trim() : null,
                deal_ends_at: finalDealEnds,
              });
            } catch {
              // l'erreur a déjà été affichée via notify() dans saveProduct
            } finally {
              setIsSaving(false);
            }
          }}
        >
          {isSaving ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Enregistrement en cours...
            </>
          ) : (
            'Enregistrer le produit'
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Formulaire Catégorie ──────────────────────────────────────────────────────
const ACCENT_OPTIONS = ['blue', 'green', 'yellow', 'orange', 'teal', 'red', 'purple', 'pink'];
const ICON_OPTIONS = ['Package', 'Refrigerator', 'Smartphone', 'Headphones', 'CookingPot', 'Cable', 'Laptop', 'Tv', 'Watch', 'Camera', 'Monitor', 'Speaker'];

function CategoryForm({ category, sortOrderDefault, onSave, onCancel }: {
  category: Category | null;
  sortOrderDefault: number;
  onSave: (c: Partial<Category>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    icon: category?.icon || 'Package',
    accent: category?.accent || 'blue',
    sort_order: category?.sort_order ?? sortOrderDefault,
  });
  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleNameChange = (val: string) => {
    const autoSlug = val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setForm((f) => ({ ...f, name: val, slug: f.slug && category ? f.slug : autoSlug }));
  };

  return (
    <div className="product-form cat-form">
      <h3>{category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h3>

      <div className="form-grid">
        <label>
          <span>Nom *</span>
          <input value={form.name} onChange={(e) => handleNameChange(e.target.value)} placeholder="Ex : Informatique" />
        </label>
        <label>
          <span>Slug (URL)</span>
          <input value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="ex: informatique" />
        </label>
      </div>

      <label>
        <span>Description</span>
        <input value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Courte description affichée sous le nom" />
      </label>

      <div className="form-grid">
        <label>
          <span>Icône</span>
          <select value={form.icon} onChange={(e) => update('icon', e.target.value)}>
            {ICON_OPTIONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
          </select>
        </label>
        <label>
          <span>Couleur d'accent</span>
          <select value={form.accent} onChange={(e) => update('accent', e.target.value)}>
            {ACCENT_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
      </div>

      <label>
        <span>Ordre d'affichage</span>
        <input type="number" min={0} value={form.sort_order} onChange={(e) => update('sort_order', Number(e.target.value))} />
      </label>

      {/* Aperçu */}
      <div className="cat-form-preview">
        <span>Aperçu :</span>
        <span className={`admin-cat-icon accent-${form.accent}`}><Tag size={16} /></span>
        <strong>{form.name || 'Nom de la catégorie'}</strong>
        {form.description && <small>{form.description}</small>}
      </div>

      <div className="product-form-actions">
        <button className="text-button" onClick={onCancel}>Annuler</button>
        <button
          className="primary-button"
          disabled={!form.name.trim()}
          onClick={() => onSave({ ...form, id: category?.id })}
        >
          {category ? 'Enregistrer les modifications' : 'Créer la catégorie'}
        </button>
      </div>
    </div>
  );
}
