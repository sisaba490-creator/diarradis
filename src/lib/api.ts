// Client API local — communique avec le serveur Express (PostgreSQL 17)

const BASE = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // ─── Marques ─────────────────────────────────────────────────────────────────
  brands: {
    list: () => fetchJSON<any[]>(`${BASE}/brands`),
    create: (data: any) =>
      fetchJSON<any>(`${BASE}/brands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchJSON<any>(`${BASE}/brands/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchJSON<any>(`${BASE}/brands/${id}`, { method: 'DELETE' }),
  },

  // ─── Catégories ───────────────────────────────────────────────────────────────
  categories: {
    list: () => fetchJSON<any[]>(`${BASE}/categories`),
    create: (data: any) =>
      fetchJSON<any>(`${BASE}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchJSON<any>(`${BASE}/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchJSON<any>(`${BASE}/categories/${id}`, { method: 'DELETE' }),
  },

  // ─── Produits ───────────────────────────────────────────────────────────────
  products: {
    list: () => fetchJSON<any[]>(`${BASE}/products`),
    create: (data: any) =>
      fetchJSON<any>(`${BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      fetchJSON<any>(`${BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      fetchJSON<any>(`${BASE}/products/${id}`, { method: 'DELETE' }),
  },

  // ─── Avis ───────────────────────────────────────────────────────────────────
  reviews: {
    list: () => fetchJSON<any[]>(`${BASE}/reviews`),
    create: (data: any) =>
      fetchJSON<any>(`${BASE}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  },

  // ─── Commandes ──────────────────────────────────────────────────────────────
  orders: {
    list: () => fetchJSON<any[]>(`${BASE}/orders`),
    create: (data: any) =>
      fetchJSON<any>(`${BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: string) =>
      fetchJSON<any>(`${BASE}/orders/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }),
    delete: (id: string) =>
      fetchJSON<any>(`${BASE}/orders/${id}`, { method: 'DELETE' }),
  },

  // ─── Paramètres ─────────────────────────────────────────────────────────────
  settings: {
    get: () => fetchJSON<Record<string, string>>(`${BASE}/settings`),
    save: (settings: Record<string, string>) =>
      fetchJSON<any>(`${BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      }),
  },

  // ─── Authentification & Clients ─────────────────────────────────────────────
  auth: {
    register: (data: { name: string; phone: string; email?: string; password: string; city?: string; address?: string }) =>
      fetchJSON<{ success: boolean; customer: any; message: string }>(`${BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    login: (data: { identifier: string; password: string }) =>
      fetchJSON<{ success: boolean; customer: any; message: string }>(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  },

  customers: {
    get: (id: string) => fetchJSON<any>(`${BASE}/customers/${id}`),
    update: (id: string, data: any) =>
      fetchJSON<any>(`${BASE}/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
    orders: (id: string) => fetchJSON<any[]>(`${BASE}/customers/${id}/orders`),
  },

  // ─── Upload de fichiers ─────────────────────────────────────────────────────
  upload: {
    image: (data: { image: string; filename?: string }) =>
      fetchJSON<{ url: string }>(`${BASE}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  },

  // ─── Sécurité Admin ─────────────────────────────────────────────────────────
  admin: {
    login: (password: string) =>
      fetchJSON<{ success: boolean; message?: string }>(`${BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      }),
    changePassword: (data: { currentPassword?: string; newPassword: string }) =>
      fetchJSON<{ success: boolean; message?: string }>(`${BASE}/admin/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  },

  // ─── Santé ──────────────────────────────────────────────────────────────────
  health: () => fetchJSON<any>(`${BASE}/health`),
};

