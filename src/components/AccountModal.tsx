import { useEffect, useState } from 'react';
import { Check, Eye, EyeOff, Lock, LogOut, MapPin, Package, Phone, ShoppingBag, User, UserCheck, UserPlus, X } from 'lucide-react';
import { api } from '@/lib/api';
import type { Customer } from '@/lib/types';

const formatPrice = (value: number) => new Intl.NumberFormat('fr-FR').format(value);

type AccountModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentCustomer: Customer | null;
  onLoginSuccess: (customer: Customer) => void;
  onLogout: () => void;
  requiredForCheckout?: boolean;
};

export function AccountModal({
  isOpen,
  onClose,
  currentCustomer,
  onLoginSuccess,
  onLogout,
  requiredForCheckout = false,
}: AccountModalProps) {
  const [tab, setTab] = useState<'login' | 'register' | 'profile' | 'orders'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Formulaire Connexion
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Formulaire Inscription
  const [regForm, setRegForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    city: 'Bamako',
    address: '',
  });

  // Édition profil
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Bamako',
    address: '',
  });

  // Commandes du client
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (currentCustomer) {
      setTab('profile');
      setEditForm({
        name: currentCustomer.name || '',
        phone: currentCustomer.phone || '',
        email: currentCustomer.email || '',
        city: currentCustomer.city || 'Bamako',
        address: currentCustomer.address || '',
      });
      loadMyOrders(currentCustomer.id);
    } else {
      setTab(requiredForCheckout ? 'register' : 'login');
    }
    setError('');
  }, [currentCustomer, isOpen, requiredForCheckout]);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const loadMyOrders = async (customerId: string) => {
    setLoadingOrders(true);
    try {
      const orders = await api.customers.orders(customerId);
      setMyOrders(orders || []);
    } catch {
      setMyOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginIdentifier.trim() || !loginPassword) {
      setError('Veuillez renseigner votre identifiant et votre mot de passe.');
      return;
    }

    setLoading(true);
    try {
      // 1. Essayer l'API serveur
      const res = await api.auth.login({
        identifier: loginIdentifier.trim(),
        password: loginPassword,
      });

      if (res.customer) {
        localStorage.setItem('malishop_customer', JSON.stringify(res.customer));
        onLoginSuccess(res.customer);
        notify(`Bienvenue ${res.customer.name} !`);
        setLoginPassword('');
      } else {
        setError('Identifiants incorrects.');
      }
    } catch {
      // 2. Fallback : authentification locale via localStorage
      try {
        const localCustomers: any[] = JSON.parse(localStorage.getItem('malishop_local_customers') || '[]');
        const id = loginIdentifier.trim().toLowerCase();
        const found = localCustomers.find(
          (c) => (c.phone === id || c.email?.toLowerCase() === id) && c.password === loginPassword
        );
        if (found) {
          const { password: _p, ...safe } = found;
          localStorage.setItem('malishop_customer', JSON.stringify(safe));
          onLoginSuccess(safe);
          notify(`Bienvenue ${safe.name} !`);
          setLoginPassword('');
        } else {
          setError('Identifiants incorrects. Vérifiez votre téléphone/e-mail et mot de passe.');
        }
      } catch {
        setError('Impossible de se connecter. Vérifiez votre connexion.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regForm.name.trim() || !regForm.phone.trim() || !regForm.password) {
      setError('Veuillez remplir les champs obligatoires (Nom, Téléphone, Mot de passe).');
      return;
    }

    if (regForm.password.length < 4) {
      setError('Le mot de passe doit contenir au moins 4 caractères.');
      return;
    }

    setLoading(true);
    try {
      // 1. Essayer l'API serveur
      const res = await api.auth.register({
        name: regForm.name.trim(),
        phone: regForm.phone.trim(),
        email: regForm.email.trim() || undefined,
        password: regForm.password,
        city: regForm.city,
        address: regForm.address.trim(),
      });

      if (res.customer) {
        localStorage.setItem('malishop_customer', JSON.stringify(res.customer));
        onLoginSuccess(res.customer);
        notify('Compte créé avec succès !');
      } else {
        setError('Erreur lors de la création du compte.');
      }
    } catch {
      // 2. Fallback : inscription locale via localStorage
      try {
        const localCustomers: any[] = JSON.parse(localStorage.getItem('malishop_local_customers') || '[]');

        // Vérifier doublon téléphone
        const exists = localCustomers.find(
          (c) => c.phone === regForm.phone.trim() || (regForm.email && c.email?.toLowerCase() === regForm.email.trim().toLowerCase())
        );
        if (exists) {
          setError('Un compte avec ce numéro ou cet e-mail existe déjà.');
          setLoading(false);
          return;
        }

        const newCustomer = {
          id: `local_${Date.now()}`,
          name: regForm.name.trim(),
          phone: regForm.phone.trim(),
          email: regForm.email.trim() || null,
          password: regForm.password,
          city: regForm.city,
          address: regForm.address.trim(),
          created_at: new Date().toISOString(),
        };

        localCustomers.push(newCustomer);
        localStorage.setItem('malishop_local_customers', JSON.stringify(localCustomers));

        const { password: _p, ...safe } = newCustomer;
        localStorage.setItem('malishop_customer', JSON.stringify(safe));
        onLoginSuccess(safe);
        notify('Compte créé avec succès !');
      } catch {
        setError('Impossible de créer le compte. Réessayez.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) return;

    setLoading(true);
    try {
      const updated = await api.customers.update(currentCustomer.id, editForm);
      localStorage.setItem('malishop_customer', JSON.stringify(updated));
      onLoginSuccess(updated);
      setEditMode(false);
      notify('Profil mis à jour avec succès !');
    } catch {
      // Fallback local
      const updatedLocal = { ...currentCustomer, ...editForm };
      localStorage.setItem('malishop_customer', JSON.stringify(updatedLocal));

      // Mettre à jour aussi dans la liste locale si applicable
      try {
        const localCustomers: any[] = JSON.parse(localStorage.getItem('malishop_local_customers') || '[]');
        const idx = localCustomers.findIndex((c) => c.id === currentCustomer.id);
        if (idx !== -1) {
          localCustomers[idx] = { ...localCustomers[idx], ...editForm };
          localStorage.setItem('malishop_local_customers', JSON.stringify(localCustomers));
        }
      } catch {}

      onLoginSuccess(updatedLocal);
      setEditMode(false);
      notify('Profil mis à jour !');
    } finally {
      setLoading(false);
    }
  };


  if (!isOpen) return null;

  const statusColors: Record<string, string> = {
    pending: '#e8a765',
    confirmed: '#4a9d7e',
    preparing: '#5b8ec9',
    shipped: '#7b6cd9',
    delivered: '#3da777',
    cancelled: '#db675b',
  };

  const statusLabels: Record<string, string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    preparing: 'En préparation',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="account-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header Modal */}
        <div className="account-modal-header">
          <div className="account-header-title">
            <div className="account-avatar-icon">
              {currentCustomer ? <UserCheck size={22} /> : <User size={22} />}
            </div>
            <div>
              <h3>{currentCustomer ? currentCustomer.name : 'Espace Client'}</h3>
              <p>{currentCustomer ? currentCustomer.phone : 'Commandez plus rapidement et suivez vos achats'}</p>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Fermer">
            <X size={20} />
          </button>
        </div>

        {/* Message d'obligation pour commander */}
        {requiredForCheckout && !currentCustomer && (
          <div className="account-checkout-banner">
            <ShoppingBag size={18} />
            <div>
              <strong>Compte requis pour commander</strong>
              <p>Créez votre compte ou connectez-vous pour que nous puissions livrer votre commande à la bonne adresse.</p>
            </div>
          </div>
        )}

        {/* ─── VUE CONNECTÉ : PROFIL & COMMANDES ───────────────────────────── */}
        {currentCustomer ? (
          <div className="account-logged-view">
            {/* Onglets navigation compte */}
            <div className="account-nav-tabs">
              <button
                className={`account-tab-btn ${tab === 'profile' ? 'active' : ''}`}
                onClick={() => setTab('profile')}
              >
                <User size={15} /> Mon Profil
              </button>
              <button
                className={`account-tab-btn ${tab === 'orders' ? 'active' : ''}`}
                onClick={() => { setTab('orders'); loadMyOrders(currentCustomer.id); }}
              >
                <Package size={15} /> Mes Commandes ({myOrders.length})
              </button>
            </div>

            {/* Onglet Profil */}
            {tab === 'profile' && (
              <div className="account-tab-content">
                {!editMode ? (
                  <div className="account-profile-card">
                    <div className="profile-field">
                      <span className="label">Nom complet</span>
                      <strong className="value">{currentCustomer.name}</strong>
                    </div>
                    <div className="profile-field">
                      <span className="label">Téléphone</span>
                      <span className="value">{currentCustomer.phone}</span>
                    </div>
                    {currentCustomer.email && (
                      <div className="profile-field">
                        <span className="label">E-mail</span>
                        <span className="value">{currentCustomer.email}</span>
                      </div>
                    )}
                    <div className="profile-field">
                      <span className="label">Ville de livraison</span>
                      <span className="value">{currentCustomer.city}</span>
                    </div>
                    <div className="profile-field">
                      <span className="label">Quartier / Adresse</span>
                      <span className="value">{currentCustomer.address || 'Non renseignée'}</span>
                    </div>

                    <div className="account-profile-actions">
                      <button className="secondary-button" onClick={() => setEditMode(true)}>
                        Modifier mes informations
                      </button>
                      <button className="danger-button" onClick={onLogout}>
                        <LogOut size={15} /> Se déconnecter
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile} className="account-form">
                    <div className="form-grid">
                      <label>
                        <span>Nom complet *</span>
                        <input
                          required
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      </label>
                      <label>
                        <span>Téléphone *</span>
                        <input
                          required
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        />
                      </label>
                    </div>

                    <label>
                      <span>E-mail</span>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      />
                    </label>

                    <div className="form-grid">
                      <label>
                        <span>Ville</span>
                        <select
                          value={editForm.city}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        >
                          <option>Bamako</option>
                          <option>Sikasso</option>
                          <option>Ségou</option>
                          <option>Kayes</option>
                          <option>Mopti</option>
                        </select>
                      </label>
                      <label>
                        <span>Adresse / Quartier</span>
                        <input
                          value={editForm.address}
                          onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        />
                      </label>
                    </div>

                    {error && <p className="form-error">{error}</p>}

                    <div className="account-form-buttons">
                      <button type="button" className="text-button" onClick={() => setEditMode(false)}>
                        Annuler
                      </button>
                      <button type="submit" className="primary-button" disabled={loading}>
                        {loading ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Onglet Commandes */}
            {tab === 'orders' && (
              <div className="account-tab-content">
                {loadingOrders ? (
                  <p className="loading-state">Chargement de vos commandes...</p>
                ) : myOrders.length === 0 ? (
                  <div className="account-empty-orders">
                    <Package size={36} />
                    <h4>Aucune commande pour le moment</h4>
                    <p>Vos commandes passées apparaîtront ici avec leur suivi de livraison.</p>
                  </div>
                ) : (
                  <div className="customer-orders-list">
                    {myOrders.map((order) => (
                      <div key={order.id} className="customer-order-card">
                        <div className="customer-order-top">
                          <div>
                            <strong>Commande #{order.id.slice(0, 8).toUpperCase()}</strong>
                            <span className="order-date">
                              {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <span
                            className="order-status-badge"
                            style={{ backgroundColor: statusColors[order.status] || '#888' }}
                          >
                            {statusLabels[order.status] || order.status}
                          </span>
                        </div>

                        {/* Liste des articles */}
                        <div className="customer-order-items">
                          {order.items && order.items.map((it: any) => (
                            <div key={it.id} className="customer-order-item-row">
                              <span>{it.quantity}x {it.product_name}</span>
                              <strong>{formatPrice(it.unit_price_fcfa * it.quantity)} F</strong>
                            </div>
                          ))}
                        </div>

                        <div className="customer-order-bottom">
                          <span className="delivery-loc">
                            <MapPin size={13} /> {order.city} · {order.address}
                          </span>
                          <strong className="order-total-price">
                            Total : {formatPrice(order.total_fcfa)} FCFA
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ─── VUE NON CONNECTÉ : CONNEXION OU INSCRIPTION ────────────────── */
          <div className="account-auth-view">
            <div className="account-auth-switch">
              <button
                className={`switch-btn ${tab === 'login' ? 'active' : ''}`}
                onClick={() => { setTab('login'); setError(''); }}
              >
                <User size={15} /> Se connecter
              </button>
              <button
                className={`switch-btn ${tab === 'register' ? 'active' : ''}`}
                onClick={() => { setTab('register'); setError(''); }}
              >
                <UserPlus size={15} /> Créer un compte
              </button>
            </div>

            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="account-form">
                <label>
                  <span>Numéro de téléphone ou E-mail</span>
                  <div className="input-with-icon">
                    <Phone size={16} />
                    <input
                      required
                      placeholder="Ex : 70 00 00 00"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                    />
                  </div>
                </label>

                <label>
                  <span>Mot de passe</span>
                  <div className="input-with-icon">
                    <Lock size={16} />
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Votre mot de passe"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="eye-toggle"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPassword(!showPassword); }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>

                {error && <p className="form-error">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="primary-button full-width"
                >
                  {loading ? 'Connexion en cours...' : 'Se connecter'}
                </button>

                <p className="account-switch-hint">
                  Vous n'avez pas encore de compte ?{' '}
                  <button type="button" onClick={() => { setTab('register'); setError(''); }}>
                    Créer un compte
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="account-form">
                <div className="form-grid">
                  <label>
                    <span>Nom complet *</span>
                    <input
                      required
                      placeholder="Ex : Amadou Diarra"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Téléphone *</span>
                    <input
                      required
                      placeholder="Ex : 70 12 34 56"
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    />
                  </label>
                </div>

                <div className="form-grid">
                  <label>
                    <span>E-mail <small>(optionnel)</small></span>
                    <input
                      type="email"
                      placeholder="vous@exemple.com"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    />
                  </label>
                  <label>
                    <span>Mot de passe *</span>
                    <div className="input-with-icon">
                      <Lock size={16} />
                      <input
                        required
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Au moins 4 caractères"
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      />
                      <button
                        type="button"
                        className="eye-toggle"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPassword(!showPassword); }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </label>
                </div>

                <div className="form-grid">
                  <label>
                    <span>Ville</span>
                    <select
                      value={regForm.city}
                      onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                    >
                      <option>Bamako</option>
                      <option>Sikasso</option>
                      <option>Ségou</option>
                      <option>Kayes</option>
                      <option>Mopti</option>
                    </select>
                  </label>
                  <label>
                    <span>Quartier / Adresse *</span>
                    <input
                      required
                      placeholder="Ex : Hamdallaye ACI, rue 240"
                      value={regForm.address}
                      onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                    />
                  </label>
                </div>

                {error && <p className="form-error">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="primary-button full-width"
                >
                  {loading ? 'Création du compte...' : 'Créer mon compte et continuer'}
                </button>

                <p className="account-switch-hint">
                  Déjà inscrit ?{' '}
                  <button type="button" onClick={() => { setTab('login'); setError(''); }}>
                    Se connecter
                  </button>
                </p>
              </form>
            )}
          </div>
        )}

        {toast && (
          <div className="toast account-toast">
            <Check size={16} /> {toast}
          </div>
        )}
      </section>
    </div>
  );
}
