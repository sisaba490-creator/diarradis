import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 3001;

// Pool de connexion PostgreSQL
const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5433'),
  database: process.env.PG_DATABASE || 'diarradis_db',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
});

pool.connect(async (err) => {
  if (err) {
    console.error('❌ Erreur de connexion PostgreSQL:', err.message);
  } else {
    console.log(`✅ Connecté à PostgreSQL 17 — base: ${process.env.PG_DATABASE || 'diarradis_db'}`);
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS store_brands (
          id text PRIMARY KEY,
          name text NOT NULL UNIQUE,
          logo_url text DEFAULT '',
          description text DEFAULT '',
          visible boolean NOT NULL DEFAULT true,
          created_at timestamptz NOT NULL DEFAULT now()
        );
      `);
      const countRes = await pool.query('SELECT COUNT(*) FROM store_brands');
      if (parseInt(countRes.rows[0].count) === 0) {
        const prodBrands = await pool.query("SELECT DISTINCT brand FROM store_products WHERE brand IS NOT NULL AND brand != ''");
        for (const row of prodBrands.rows) {
          const id = `b_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          await pool.query(
            'INSERT INTO store_brands (id, name, visible) VALUES ($1, $2, true) ON CONFLICT (name) DO NOTHING',
            [id, row.brand]
          );
        }
      }
    } catch (e) {
      console.warn('Init store_brands table notice:', e.message);
    }
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(uploadsDir));

// ─── UPLOAD D'IMAGE ──────────────────────────────────────────────────────────

app.post('/api/upload', async (req, res) => {
  try {
    const { image, filename } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    // Décodage base64
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      let ext = matches[1].split('/')[1] || 'jpg';
      if (ext === 'jpeg') ext = 'jpg';
      if (ext === 'svg+xml') ext = 'svg';
      const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, '');
      const cleanPrefix = filename ? filename.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30) : 'prod';
      const uniqueName = `${cleanPrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${cleanExt}`;
      const filePath = path.join(uploadsDir, uniqueName);
      const buffer = Buffer.from(matches[2], 'base64');
      fs.writeFileSync(filePath, buffer);
      return res.json({ url: `/uploads/${uniqueName}` });
    }

    // Si c'est déjà une URL HTTP valide
    return res.json({ url: image });
  } catch (err) {
    console.error('Erreur lors de l\'upload:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── MARQUES ─────────────────────────────────────────────────────────────────

app.get('/api/brands', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM store_brands ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/brands', async (req, res) => {
  const { id, name, logo_url, description, visible } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO store_brands (id, name, logo_url, description, visible)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (name) DO UPDATE SET logo_url = EXCLUDED.logo_url, description = EXCLUDED.description, visible = EXCLUDED.visible
       RETURNING *`,
      [id || `b${Date.now()}`, name, logo_url || '', description || '', visible !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/brands/:id', async (req, res) => {
  const { id } = req.params;
  const { name, logo_url, description, visible, old_name } = req.body;
  try {
    // Récupérer le nom actuel de la marque dans la DB (si elle existe)
    let previousName = old_name;
    if (!previousName) {
      const existing = await pool.query('SELECT name FROM store_brands WHERE id = $1', [id]);
      if (existing.rows.length > 0) {
        previousName = existing.rows[0].name;
      }
    }

    // UPSERT : créer ou mettre à jour selon que la marque existe déjà en DB
    const result = await pool.query(
      `INSERT INTO store_brands (id, name, logo_url, description, visible)
       VALUES ($5, $1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET name=$1, logo_url=$2, description=$3, visible=$4
       RETURNING *`,
      [name, logo_url || '', description || '', visible !== false, id]
    );

    // CASCADE : Si le nom a changé, renommer la marque dans tous les produits
    if (previousName && previousName !== name) {
      await pool.query(
        'UPDATE store_products SET brand = $1 WHERE brand = $2',
        [name, previousName]
      );
      console.log(`✅ Produits de la marque "${previousName}" renommés en "${name}"`);
    }

    res.json(result.rows[0] || { id, name, logo_url: logo_url || '', description: description || '', visible: visible !== false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/brands/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM store_brands WHERE id=$1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── CATÉGORIES ──────────────────────────────────────────────────────────────

app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM store_categories ORDER BY sort_order ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', async (req, res) => {
  const { id, name, slug, description, icon, accent, sort_order } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO store_categories (id, name, slug, description, icon, accent, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [id || `c${Date.now()}`, name, slug, description || '', icon || 'Package', accent || 'blue', sort_order || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name, slug, description, icon, accent, sort_order } = req.body;
  try {
    const result = await pool.query(
      `UPDATE store_categories SET name=$1, slug=$2, description=$3, icon=$4, accent=$5, sort_order=$6
       WHERE id=$7 RETURNING *`,
      [name, slug, description, icon, accent, sort_order, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const prodCheck = await pool.query('SELECT COUNT(*) FROM store_products WHERE category_id = $1', [req.params.id]);
    if (parseInt(prodCheck.rows[0].count) > 0) {
      return res.status(400).json({
        error: `Impossible de supprimer cette catégorie : ${prodCheck.rows[0].count} produit(s) y sont rattaché(s).`
      });
    }
    await pool.query('DELETE FROM store_categories WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ─── PRODUITS ────────────────────────────────────────────────────────────────

app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM store_products ORDER BY featured DESC, sold_count DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  const {
    id, category_id, name, slug, brand, description,
    price_fcfa, old_price_fcfa, image_url, badge, rating,
    review_count, stock_count, featured, specs, gallery,
    tiered_pricing, tags, min_order_qty, sold_count, deal_ends_at
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO store_products
       (id, category_id, name, slug, brand, description, price_fcfa, old_price_fcfa, image_url, badge,
        rating, review_count, stock_count, featured, specs, gallery, tiered_pricing, tags, min_order_qty, sold_count, deal_ends_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21) RETURNING *`,
      [
        id || `p${Date.now()}`, category_id, name, slug, brand, description || '',
        price_fcfa, old_price_fcfa || null, image_url, badge || null,
        rating || 4.5, review_count || 0, stock_count || 0, featured || false,
        JSON.stringify(specs || []), JSON.stringify(gallery || []),
        JSON.stringify(tiered_pricing || []), tags || [],
        min_order_qty || 1, sold_count || 0, deal_ends_at || null
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const {
    category_id, name, slug, brand, description, price_fcfa, old_price_fcfa,
    image_url, badge, rating, review_count, stock_count, featured,
    specs, gallery, tiered_pricing, tags, min_order_qty, sold_count, deal_ends_at
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE store_products SET
       category_id=$1, name=$2, slug=$3, brand=$4, description=$5, price_fcfa=$6,
       old_price_fcfa=$7, image_url=$8, badge=$9, rating=$10, review_count=$11,
       stock_count=$12, featured=$13, specs=$14, gallery=$15, tiered_pricing=$16,
       tags=$17, min_order_qty=$18, sold_count=$19, deal_ends_at=$20
       WHERE id=$21 RETURNING *`,
      [
        category_id, name, slug, brand, description, price_fcfa,
        old_price_fcfa || null, image_url, badge || null, rating, review_count,
        stock_count, featured, JSON.stringify(specs || []), JSON.stringify(gallery || []),
        JSON.stringify(tiered_pricing || []), tags || [], min_order_qty, sold_count,
        deal_ends_at || null, id
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM store_products WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── AVIS ─────────────────────────────────────────────────────────────────────

app.get('/api/reviews', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM store_reviews ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  const { product_id, author_name, rating, comment, verified } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO store_reviews (id, product_id, author_name, rating, comment, verified)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [`r${Date.now()}`, product_id, author_name, rating, comment || '', verified || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── AUTHENTIFICATION & CLIENTS ───────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  const { name, phone, email, password, city, address } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ error: 'Le nom, le numéro de téléphone et le mot de passe sont obligatoires.' });
  }

  try {
    // Vérifier si le téléphone existe déjà
    const existing = await pool.query(
      'SELECT id FROM store_customers WHERE phone = $1 OR (email IS NOT NULL AND email != \'\' AND email = $2)',
      [phone.trim(), email ? email.trim().toLowerCase() : null]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Un compte avec ce numéro de téléphone ou cet e-mail existe déjà.' });
    }

    const customerId = `cust_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const result = await pool.query(
      `INSERT INTO store_customers (id, name, phone, email, password, city, address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, phone, email, city, address, created_at`,
      [customerId, name.trim(), phone.trim(), email ? email.trim().toLowerCase() : null, password, city || 'Bamako', address || '']
    );

    res.status(201).json({
      success: true,
      customer: result.rows[0],
      message: 'Compte créé avec succès !'
    });
  } catch (err) {
    console.error('Erreur inscription client:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Identifiant (téléphone/e-mail) et mot de passe requis.' });
  }

  try {
    const cleanId = identifier.trim();
    const result = await pool.query(
      `SELECT id, name, phone, email, password, city, address, created_at
       FROM store_customers
       WHERE phone = $1 OR (email IS NOT NULL AND LOWER(email) = LOWER($1))`,
      [cleanId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Aucun compte trouvé avec ce numéro ou e-mail.' });
    }

    const customer = result.rows[0];
    if (customer.password !== password) {
      return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }

    const { password: _, ...customerSafe } = customer;
    res.json({
      success: true,
      customer: customerSafe,
      message: 'Connexion réussie !'
    });
  } catch (err) {
    console.error('Erreur connexion client:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, phone, email, city, address, created_at FROM store_customers WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client introuvable.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  const { name, phone, email, city, address } = req.body;
  try {
    const result = await pool.query(
      `UPDATE store_customers
       SET name = $1, phone = $2, email = $3, city = $4, address = $5
       WHERE id = $6
       RETURNING id, name, phone, email, city, address, created_at`,
      [name, phone, email || null, city || 'Bamako', address || '', req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client introuvable.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/customers/:id/orders', async (req, res) => {
  try {
    const orders = await pool.query(
      'SELECT * FROM store_orders WHERE customer_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );
    const items = await pool.query('SELECT * FROM store_order_items ORDER BY created_at ASC');
    const result = orders.rows.map(order => ({
      ...order,
      items: items.rows.filter(item => item.order_id === order.id)
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── COMMANDES ───────────────────────────────────────────────────────────────

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await pool.query('SELECT * FROM store_orders ORDER BY created_at DESC LIMIT 100');
    const items = await pool.query('SELECT * FROM store_order_items ORDER BY created_at ASC');
    const result = orders.rows.map(order => ({
      ...order,
      items: items.rows.filter(item => item.order_id === order.id)
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      customer_id, customer_name, phone, email, city, address,
      payment_method, subtotal_fcfa, delivery_fcfa, total_fcfa, notes, items, status
    } = req.body;

    const initialStatus = status || 'pending';
    const orderId = `o${Date.now()}`;
    const orderResult = await client.query(
      `INSERT INTO store_orders
       (id, customer_id, customer_name, phone, email, city, address, payment_method,
        subtotal_fcfa, delivery_fcfa, total_fcfa, notes, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [orderId, customer_id || null, customer_name, phone, email || null, city, address,
       payment_method, subtotal_fcfa, delivery_fcfa, total_fcfa, notes || null, initialStatus]
    );

    if (items && items.length > 0) {
      for (const item of items) {
        await client.query(
          `INSERT INTO store_order_items (id, order_id, product_id, product_name, unit_price_fcfa, quantity)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [`oi${Date.now()}_${Math.random().toString(36).slice(2)}`, orderId,
           item.product_id || null, item.product_name, item.unit_price_fcfa, item.quantity]
        );
        // Le stock n'est décrémenté que si la commande est créée directement avec le statut livré
        if (initialStatus === 'delivered' && item.product_id) {
          await client.query(
            `UPDATE store_products SET stock_count = GREATEST(0, stock_count - $1), sold_count = sold_count + $1 WHERE id = $2`,
            [item.quantity, item.product_id]
          );
        }
      }
    }

    await client.query('COMMIT');
    res.status(201).json(orderResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});


app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Récupérer la commande actuelle
    const orderCheck = await client.query('SELECT * FROM store_orders WHERE id = $1', [id]);
    if (orderCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    const currentOrder = orderCheck.rows[0];
    const oldStatus = currentOrder.status;
    const newStatus = status;

    // Récupérer les articles commandés
    const itemsRes = await client.query(
      'SELECT product_id, quantity FROM store_order_items WHERE order_id = $1',
      [id]
    );
    const items = itemsRes.rows;

    // Si la commande passe à "delivered" alors qu'elle ne l'était pas -> déduire le stock
    if (newStatus === 'delivered' && oldStatus !== 'delivered') {
      for (const item of items) {
        if (item.product_id) {
          await client.query(
            `UPDATE store_products 
             SET stock_count = GREATEST(0, stock_count - $1),
                 sold_count = sold_count + $1
             WHERE id = $2`,
            [item.quantity, item.product_id]
          );
        }
      }
    }
    // Si la commande était "delivered" et passe à un autre statut (ex: annulée ou retour en attente) -> réintégrer le stock
    else if (oldStatus === 'delivered' && newStatus !== 'delivered') {
      for (const item of items) {
        if (item.product_id) {
          await client.query(
            `UPDATE store_products 
             SET stock_count = stock_count + $1,
                 sold_count = GREATEST(0, sold_count - $1)
             WHERE id = $2`,
            [item.quantity, item.product_id]
          );
        }
      }
    }

    const result = await client.query(
      'UPDATE store_orders SET status = $1 WHERE id = $2 RETURNING *',
      [newStatus, id]
    );

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const orderCheck = await client.query('SELECT status FROM store_orders WHERE id = $1', [id]);
    if (orderCheck.rows.length > 0 && orderCheck.rows[0].status === 'delivered') {
      const itemsRes = await client.query(
        'SELECT product_id, quantity FROM store_order_items WHERE order_id = $1',
        [id]
      );
      for (const item of itemsRes.rows) {
        if (item.product_id) {
          await client.query(
            `UPDATE store_products 
             SET stock_count = stock_count + $1,
                 sold_count = GREATEST(0, sold_count - $1)
             WHERE id = $2`,
            [item.quantity, item.product_id]
          );
        }
      }
    }
    await client.query('DELETE FROM store_order_items WHERE order_id = $1', [id]);
    await client.query('DELETE FROM store_orders WHERE id = $1', [id]);
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ─── PARAMÈTRES DU SITE ───────────────────────────────────────────────────────

app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM site_settings');
    const map = {};
    result.rows.forEach(r => { map[r.key] = r.value; });
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  const { settings } = req.body; // { key: value, ... }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const [key, value] of Object.entries(settings)) {
      await client.query(
        `INSERT INTO site_settings (id, key, value)
         VALUES ($1, $2, $3)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
        [`s_${key}`, key, value]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ─── Santé API ────────────────────────────────────────────────────────────────

app.get('/api/health', async (req, res) => {
  try {
    const r = await pool.query('SELECT NOW() as time, current_database() as db');
    res.json({ status: 'ok', database: r.rows[0].db, time: r.rows[0].time });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur API MaliShop démarré sur http://localhost:${PORT}`);
  console.log(`   Endpoints disponibles :`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/categories`);
  console.log(`   GET  /api/products`);
  console.log(`   GET  /api/reviews`);
  console.log(`   GET  /api/orders`);
  console.log(`   GET  /api/settings`);
});
