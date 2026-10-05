/**
 * DIARRA Distribution — Script d'automatisation des publications sociales
 * Publie automatiquement sur la Page Facebook et Instagram
 *
 * Variables d'environnement requises :
 * - FB_PAGE_ID : ID de votre page Facebook
 * - FB_PAGE_ACCESS_TOKEN : Jeton d'accès permanent de la Page Meta
 * - IG_USER_ID : (Optionnel) ID du compte Instagram Business relié
 * - SITE_URL : URL du site (par défaut: https://diarradis3.vercel.app)
 *
 * Usage local / test :
 *   node scripts/auto-poster.js --dry-run
 *   node scripts/auto-poster.js
 */

const SITE_URL = process.env.SITE_URL || 'https://diarradis3.vercel.app';
const BANNER_URL = `${SITE_URL}/og-banner.jpg`;
const WHATSAPP_PHONE = '+223 74 79 82 16';
const WHATSAPP_LINK = 'https://wa.me/22374798216';

// 4 messages variés et attractifs pour alterner toutes les 6 heures
const POST_TEMPLATES = [
  {
    type: 'machines',
    title: '🏭 ÉQUIPEMENTS & MACHINES PROFESSIONNELLES AU MALI',
    body: `Besoin de machines performantes pour booster votre activité ou votre atelier ?

Chez DIARRA Distribution, découvrez notre large gamme de machines fiables, robustes et garanties adaptées à vos besoins professionnels.

✅ Qualité supérieure certifiée
✅ Conseil technique et accompagnement
✅ Livraison rapide à Bamako et partout au Mali

👉 Commandez dès maintenant en ligne :
🔗 ${SITE_URL}

📲 Contact direct & WhatsApp : ${WHATSAPP_PHONE}
💬 WhatsApp rapide : ${WHATSAPP_LINK}

#DiarraDistribution #Mali #Bamako #MachinesProfessionnelles #CommerceGeneral #EntrepreneuriatMali #IndustrieMali`
  },
  {
    type: 'etageres',
    title: '📦 ÉTAGÈRES & RAYONNAGES MAGASINS & ENTREPÔTS',
    body: `Optimisez l'espace de votre boutique, supermarché ou entrepôt avec nos étagères ultra résistantes !

DIARRA Distribution vous fournit les meilleures solutions de rangement et rayonnage professionnel :

✅ Robustesse et grande capacité de charge
✅ Montage simple, propre et sécurisé
✅ Modèles adaptés pour superettes, boutiques et dépôts

👉 Consultez nos modèles et commandez en ligne :
🔗 ${SITE_URL}

📞 Téléphone / WhatsApp : ${WHATSAPP_PHONE}
📍 Bamako, Mali — Livraison dans toutes les régions.

#Etageres #Rayonnage #MagasinMali #DiarraDistribution #Bamako #CommerceGeneral #Agencement`
  },
  {
    type: 'catalogue',
    title: '🛒 COMMERCE GÉNÉRAL — ACHETEZ EN LIGNE EN TOUTE SÉCURITÉ',
    body: `Bienvenue sur la boutique en ligne officielle de DIARRA Distribution !

Accédez en quelques clics à notre catalogue complet de machines, équipements, étagères et matériels de qualité supérieure avec les meilleurs prix du marché.

⭐ Paiement sécurisé (Orange Money, Moov Money, Paiement à la livraison)
⭐ Service client disponible 7j/7
⭐ Livraison directe à domicile ou en atelier

👉 Visitez le catalogue complet ici :
🔗 ${SITE_URL}

📲 Discutez avec nous sur WhatsApp : ${WHATSAPP_LINK}
📞 Assistance : ${WHATSAPP_PHONE}

#DiarraDistribution #VenteEnLigneMali #BamakoShop #CommerceMali #QualiteGarantie`
  },
  {
    type: 'arrivage',
    title: '✨ NOUVEL ARRIVAGE CHEZ DIARRA DISTRIBUTION !',
    body: `Des nouveautés viennent d'arriver dans votre magasin DIARRA Distribution à Bamako !

Machines de dernière génération, étagères renforcées et équipements industriels disponibles en stock limité.

Ne manquez pas nos offres spéciales du moment !

👉 Voir les nouveautés et promotions :
🔗 ${SITE_URL}

📞 Commandes immédiates : ${WHATSAPP_PHONE}
💬 Écrivez-nous sur WhatsApp : ${WHATSAPP_LINK}

#Nouveaute #ArrivageMali #DiarraDistribution #MachinesMali #EtageresBamako #Opportunite`
  }
];

// Sélectionne le template selon l'heure de la journée (0h, 6h, 12h, 18h)
function selectTemplate() {
  const hour = new Date().getUTCHours();
  // Index basé sur le quart de la journée (0, 1, 2 ou 3)
  const slot = Math.floor(hour / 6) % POST_TEMPLATES.length;
  return POST_TEMPLATES[slot];
}

/**
 * Publication sur la Page Facebook via Graph API
 */
async function postToFacebookPage({ pageId, accessToken, message, imageUrl, link }) {
  console.log(`\n📢 [Facebook] Publication sur la page ${pageId}...`);

  // Méthode 1 : Publication avec photo (meilleur engagement visuel)
  const photoUrl = `https://graph.facebook.com/v19.0/${pageId}/photos`;
  const photoParams = new URLSearchParams({
    url: imageUrl,
    caption: message,
    access_token: accessToken
  });

  try {
    const res = await fetch(photoUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: photoParams
    });

    const data = await res.json();

    if (data.error) {
      console.warn(`⚠️ [Facebook] Échec en mode photo (${data.error.message}), tentative via /feed...`);
      // Méthode 2 : Repli sur le flux standard avec lien cliquable
      const feedUrl = `https://graph.facebook.com/v19.0/${pageId}/feed`;
      const feedParams = new URLSearchParams({
        message,
        link,
        access_token: accessToken
      });

      const feedRes = await fetch(feedUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: feedParams
      });
      const feedData = await feedRes.json();

      if (feedData.error) {
        throw new Error(`Erreur Facebook API: ${feedData.error.message} (code ${feedData.error.code})`);
      }
      console.log(`✅ [Facebook] Publication réussie via feed ! Post ID: ${feedData.id}`);
      return feedData;
    }

    console.log(`✅ [Facebook] Publication photo réussie ! Post ID: ${data.id || data.post_id}`);
    return data;
  } catch (err) {
    console.error(`❌ [Facebook] Erreur :`, err.message);
    throw err;
  }
}

/**
 * Publication sur Instagram Business via Graph API
 */
async function postToInstagram({ igUserId, accessToken, imageUrl, caption }) {
  console.log(`\n📸 [Instagram] Publication sur le compte ${igUserId}...`);

  try {
    // Étape 1 : Créer le conteneur média
    const createMediaUrl = `https://graph.facebook.com/v19.0/${igUserId}/media`;
    const mediaParams = new URLSearchParams({
      image_url: imageUrl,
      caption,
      access_token: accessToken
    });

    const createRes = await fetch(createMediaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: mediaParams
    });
    const createData = await createRes.json();

    if (createData.error) {
      throw new Error(`Étape 1 Instagram échouée: ${createData.error.message}`);
    }

    const creationId = createData.id;
    console.log(`  ✓ Conteneur média créé (ID: ${creationId}). Attente publication...`);

    // Petite pause de 3 secondes pour laisser Instagram traiter l'image
    await new Promise((r) => setTimeout(r, 3000));

    // Étape 2 : Publier le média
    const publishUrl = `https://graph.facebook.com/v19.0/${igUserId}/media_publish`;
    const publishParams = new URLSearchParams({
      creation_id: creationId,
      access_token: accessToken
    });

    const publishRes = await fetch(publishUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: publishParams
    });
    const publishData = await publishRes.json();

    if (publishData.error) {
      throw new Error(`Étape 2 Instagram échouée: ${publishData.error.message}`);
    }

    console.log(`✅ [Instagram] Publication réussie ! Post ID: ${publishData.id}`);
    return publishData;
  } catch (err) {
    console.error(`❌ [Instagram] Erreur :`, err.message);
    throw err;
  }
}

/**
 * Exécution principale
 */
async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const now = new Date().toISOString();
  console.log(`════════════════════════════════════════════════════════════`);
  console.log(`🤖 DIARRA Distribution — Auto-Poster Réseaux Sociaux`);
  console.log(`🕒 Heure d'exécution : ${now}`);
  console.log(`════════════════════════════════════════════════════════════`);

  const template = selectTemplate();
  const fullMessage = `${template.title}\n\n${template.body}`;

  console.log(`\n📋 Thème du post sélectionné : [${template.type.toUpperCase()}]`);
  console.log(`🖼️ Image : ${BANNER_URL}`);
  console.log(`🔗 Lien : ${SITE_URL}`);
  console.log(`\n--- APERÇU DU TEXTE DU POST ---\n${fullMessage}\n--------------------------------`);

  if (isDryRun) {
    console.log(`\n🧪 MODE SIMULATION (--dry-run) : Aucun appel d'API n'a été émis.`);
    console.log(`✅ Tout fonctionne correctement !`);
    return;
  }

  const fbPageId = process.env.FB_PAGE_ID;
  const fbAccessToken = process.env.FB_PAGE_ACCESS_TOKEN;
  const igUserId = process.env.IG_USER_ID;

  let hasError = false;

  // 1. Publication Facebook
  if (fbPageId && fbAccessToken) {
    try {
      await postToFacebookPage({
        pageId: fbPageId,
        accessToken: fbAccessToken,
        message: fullMessage,
        imageUrl: BANNER_URL,
        link: SITE_URL
      });
    } catch (err) {
      hasError = true;
    }
  } else {
    console.log(`\nℹ️ [Facebook] Non configuré (FB_PAGE_ID ou FB_PAGE_ACCESS_TOKEN manquant).`);
  }

  // 2. Publication Instagram
  if (igUserId && fbAccessToken) {
    try {
      await postToInstagram({
        igUserId,
        accessToken: fbAccessToken,
        imageUrl: BANNER_URL,
        caption: fullMessage
      });
    } catch (err) {
      console.warn(`⚠️ [Instagram] Note: Assurez-vous que le compte est un compte Instagram Professionnel.`);
      hasError = true;
    }
  } else {
    console.log(`\nℹ️ [Instagram] Optionnel : Non configuré (IG_USER_ID manquant).`);
  }

  if (!fbPageId && !igUserId) {
    console.log(`\n⚠️ Aucune information d'identification fournie.`);
    console.log(`Veuillez renseigner FB_PAGE_ID et FB_PAGE_ACCESS_TOKEN.`);
    console.log(`Pour tester sans identifiants : node scripts/auto-poster.js --dry-run`);
  }

  if (hasError) {
    console.error(`\n❌ Une ou plusieurs publications ont échoué.`);
    process.exit(1);
  } else {
    console.log(`\n🎉 Exécution terminée avec succès !`);
  }
}

main().catch((err) => {
  console.error('Erreur fatale:', err);
  process.exit(1);
});
