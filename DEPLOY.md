# 🚀 Guide de déploiement — Diarradis sur Vercel

## Vue d'ensemble

| Composant | Service | Gratuit |
|---|---|---|
| Frontend + API | **Vercel** | ✅ |
| Base de données | **Neon** (PostgreSQL cloud) | ✅ (3 GB) |
| Images | **Cloudinary** | ✅ (25 GB) |

---

## Étape 1 — Créer la base de données Neon

1. Va sur [console.neon.tech](https://console.neon.tech) et crée un compte
2. Clique **"New Project"** → donne-lui le nom `diarradis`
3. Une fois créé, va dans **"Connection Details"**
4. Copie la **Connection String** (format : `postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require`)
5. Dans l'onglet **"SQL Editor"** de Neon, colle et exécute le contenu de `server/init_db.sql`

---

## Étape 2 — Créer un compte Cloudinary

1. Va sur [cloudinary.com](https://cloudinary.com) et crée un compte gratuit
2. Sur le **Dashboard**, note les 3 valeurs :
   - `Cloud Name`
   - `API Key`
   - `API Secret`

---

## Étape 3 — Installer Vercel CLI et se connecter

```powershell
npm install -g vercel
vercel login
```

---

## Étape 4 — Premier déploiement

```powershell
cd c:\projetdiarradis
vercel
```

Vercel posera des questions :
- **Set up and deploy?** → `Y`
- **Which scope?** → ton compte
- **Link to existing project?** → `N`
- **Project name?** → `diarradis`
- **Directory?** → `.`
- **Override build command?** → `N`

---

## Étape 5 — Configurer les variables d'environnement sur Vercel

```powershell
vercel env add DATABASE_URL
# → Colle ta Connection String Neon (postgresql://user:pass@...?sslmode=require)

vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET

vercel env add FRONTEND_URL
# → L'URL Vercel de ton projet (ex: https://diarradis.vercel.app)
```

> Tu peux aussi les ajouter via vercel.com → Ton projet → **Settings → Environment Variables**

---

## Étape 6 — Déploiement en production

```powershell
vercel --prod
```

✅ Ton app est maintenant en ligne !

---

## Étape 7 — Migrer les données existantes (optionnel)

```powershell
# Exporter depuis PostgreSQL local
& "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" -U postgres -p 5433 -d diarradis_db --data-only --no-owner -f backup.sql

# Importer dans Neon
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" "postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require" -f backup.sql
```

---

## Déploiements suivants

```powershell
vercel --prod
```

Ou configure le déploiement automatique via GitHub (push = redéploiement auto).

---

## Structure des fichiers créés

```
c:\projetdiarradis\
├── api/
│   └── index.js          ← Backend Express (Vercel serverless)
├── vercel.json           ← Configuration de routing Vercel
├── .env.example          ← Modèle des variables d'environnement
└── DEPLOY.md             ← Ce guide
```

---

## Dépannage

| Problème | Solution |
|---|---|
| `Error: DATABASE_URL not set` | Vérifier les env vars sur Vercel Dashboard |
| `SSL connection required` | Ajouter `?sslmode=require` à la DATABASE_URL |
| Images non affichées | Vérifier les clés Cloudinary |
| `Function timeout` | Plan gratuit Vercel = 10s max par requête |
