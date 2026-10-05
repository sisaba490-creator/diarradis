# 🤖 Guide d'Activation : Publication Automatique sur Facebook & Instagram

Ce système publie automatiquement votre lien **https://diarradis3.vercel.app/** ainsi que vos affiches et coordonnées **toutes les 6 heures (4 fois par jour : 00h, 06h, 12h, 18h UTC)** directement sur votre Page Facebook et Instagram sans que vous n'ayez besoin de laisser votre ordinateur allumé.

---

## 📋 Étape 1 : Récupérer l'ID de votre Page Facebook

1. Allez sur votre profil Facebook et basculez sur votre **Page Facebook professionnelle (DIARRA Distribution)**.
2. Dans le menu de gauche de la Page, cliquez sur **À propos** (ou allez dans **Paramètres** → **Nouvelle expérience pour les Pages**).
3. Vous pouvez également voir l'ID dans la barre d'adresse de votre navigateur ou dans les informations de la page.
4. Notez cet identifiant numérique (ex: `102938475610293`). C'est votre **`FB_PAGE_ID`**.

---

## 🔑 Étape 2 : Générer votre Jeton d'Accès Permanent (Page Access Token)

1. Rendez-vous sur **[Meta for Developers (developers.facebook.com)](https://developers.facebook.com/)** et connectez-vous avec votre compte Facebook.
2. Cliquez sur **Mes applications** en haut à droite → **Créer une application**.
3. Choisissez le type **Autre** ou **Entreprise**, donnez un nom (ex: *DiarraBot*) et validez.
4. Allez ensuite sur l'outil officiel **Graph API Explorer** :  
   👉 **https://developers.facebook.com/tools/explorer/**
5. Dans le panneau de droite :
   - Sous **Application Meta**, sélectionnez votre application *DiarraBot*.
   - Sous **Utilisateur ou Page**, sélectionnez **votre Page Facebook DIARRA Distribution** (très important : choisissez la Page, pas votre profil personnel).
   - Sous **Autorisations (Permissions)**, ajoutez :
     - `pages_manage_posts`
     - `pages_read_engagement`
     - `pages_show_list`
     - *(Si Instagram Business lié)* : `instagram_basic`, `instagram_content_publish`
6. Cliquez sur **Generate Access Token** (Générer le jeton d'accès) et acceptez les autorisations sur Facebook.
7. *(Recommandé)* Pour rendre ce jeton permanent (qui n'expire pas) :
   - Ouvrez l'outil Access Token Debugger : https://developers.facebook.com/tools/debug/accesstoken/
   - Collez le jeton généré et cliquez sur **Prolonger le jeton d'accès (Extend Access Token)**.
8. Copiez ce jeton. C'est votre **`FB_PAGE_ACCESS_TOKEN`**.

---

## 🔒 Étape 3 : Ajouter les Clés dans votre Dépôt GitHub

Le robot s'exécute dans le cloud via GitHub Actions. Pour qu'il ait accès à vos identifiants en toute sécurité :

1. Ouvrez votre projet sur GitHub : **https://github.com/sisaba490-creator/diarradis**
2. Cliquez sur l'onglet **Settings** (Paramètres du dépôt).
3. Dans la colonne de gauche, déroulez **Secrets and variables** → cliquez sur **Actions**.
4. Cliquez sur le bouton vert **New repository secret** :
   - **Secret 1 :**
     - Name : `FB_PAGE_ID`
     - Secret : *(Collez l'ID de votre page Facebook obtenu à l'étape 1)*
     - Cliquez sur **Add secret**.
   - **Secret 2 :**
     - Name : `FB_PAGE_ACCESS_TOKEN`
     - Secret : *(Collez le jeton obtenu à l'étape 2)*
     - Cliquez sur **Add secret**.
   - **Secret 3 (Optionnel, uniquement si vous avez un Instagram Pro relié) :**
     - Name : `IG_USER_ID`
     - Secret : *(Votre ID Instagram Business)*
     - Cliquez sur **Add secret**.

---

## 🚀 Étape 4 : Tester la Publication Immédiatement

Vous n'avez pas besoin d'attendre 6 heures pour voir si ça marche !

1. Sur votre dépôt GitHub, cliquez sur l'onglet **Actions**.
2. Dans la liste de gauche, cliquez sur le workflow **Publication Automatique Réseaux Sociaux**.
3. Cliquez sur le bouton **Run workflow** à droite.
4. Le robot s'exécute en quelques secondes :
   - Vous verrez le post apparaître directement sur votre **Page Facebook** avec la photo officielle, le texte accrocheur, le lien et vos numéros WhatsApp !
5. **Désormais, le robot publiera automatiquement toutes les 6 heures (00h, 06h, 12h, 18h) sans aucune action manuelle de votre part !** 🎉
