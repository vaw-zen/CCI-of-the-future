# 🔑 Guide de Configuration Google Search Console API

## ⚠️ PROBLÈME IDENTIFIÉ - Confusion entre Projets

### 🚨 Erreur Actuelle
```
Access blocked: MindCare's request is invalid
Error 400: redirect_uri_mismatch
```

**Cause :** Vous utilisez les credentials OAuth2 du projet "MindCare" au lieu de créer un nouveau projet pour CCI Services.

## 📋 SOLUTION - Créer un Nouveau Projet Dédié

## ✅ EXCELLENT - Projet Supprimé !

Maintenant que vous avez supprimé l'ancien projet "MindCare", nous pouvons créer un projet propre pour CCI Services.

## 🚀 Étapes Simplifiées - Nouveau Départ

### 1. Créer un NOUVEAU Projet Google Cloud (Séparé de MindCare)
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. **IMPORTANT :** Créez un NOUVEAU projet (ne réutilisez pas MindCare)
   - Cliquez sur le sélecteur de projet en haut
   - Cliquez sur "NEW PROJECT"
   - Nom du projet : `CCI-Services-GSC` ou `CCI-Services-API`
   - Notez le Project ID généré
3. Sélectionnez ce nouveau projet avant de continuer

### 2. Activer l'API Google Search Console (Nouveau Projet)
1. Dans Google Cloud Console, allez dans "APIs & Services" > "Library"
2. Recherchez "Google Search Console API"
3. Cliquez sur "Enable" pour activer l'API

### 3. Créer des Identifiants OAuth2 (UNIQUEMENT pour CCI Services)
1. **VÉRIFIEZ** que vous êtes dans le bon projet : `CCI-Services-GSC`
2. Allez dans "APIs & Services" > "Credentials"
3. Cliquez sur "Create Credentials" > "OAuth 2.0 Client ID"
4. Si l'écran de consentement n'est pas configuré :
   - Allez dans "OAuth consent screen"
   - Choisissez "External" si vous n'avez pas Google Workspace
   - Remplissez les informations obligatoires :
     - **App name:** `CCI Services GSC Monitor`
     - **User support email:** `chaaben.fares94@gmail.com`
     - **Developer contact:** `chaaben.fares94@gmail.com`
   - Ajoutez les scopes nécessaires : `https://www.googleapis.com/auth/webmasters.readonly`
5. Retournez dans "Credentials" et créez OAuth 2.0 Client ID
6. Choisissez "Web application" comme type d'application
7. **Nom:** `CCI Services GSC Client`
8. Ajoutez les URLs autorisées POUR CCI SERVICES UNIQUEMENT :
   - **Authorized JavaScript origins:** 
     - `https://cciservices.online`
     - `http://localhost:3000` (pour développement)
   - **Authorized redirect URIs:**
     - `https://cciservices.online/api/auth/callback`
     - `http://localhost:3000/api/auth/callback`
   - **Authorized redirect URIs:** `https://cciservices.online/auth/google/callback`

### 4. Obtenir les Tokens d'Accès

#### Option A: Utiliser Google OAuth2 Playground
1. Allez sur [OAuth2 Playground](https://developers.google.com/oauthplayground/)
2. Cliquez sur l'icône paramètres (engrenage) en haut à droite
3. Cochez "Use your own OAuth credentials"
4. Entrez votre Client ID et Client Secret
5. Dans la liste des APIs, trouvez "Google Search Console API v1"
6. Sélectionnez `https://www.googleapis.com/auth/webmasters.readonly`
7. Cliquez "Authorize APIs"
8. Autorisez l'accès à votre compte Google
9. Cliquez "Exchange authorization code for tokens"
10. Copiez le `refresh_token` et `access_token`

#### Option B: Script d'Authentification Automatique
```javascript
// scripts/setup-google-auth.js
const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = 'your-client-id';
const CLIENT_SECRET = 'your-client-secret';
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const scopes = ['https://www.googleapis.com/auth/webmasters.readonly'];
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
});

console.log('Authorize this app by visiting this url:', authUrl);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the code from that page here: ', (code) => {
  rl.close();
  oauth2Client.getAccessToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    console.log('Your tokens:', token);
  });
});
```

### 5. Mettre à Jour .env.local

Remplacez les valeurs de placeholder dans `.env.local` :

```bash
# Google Search Console API Configuration
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_REFRESH_TOKEN=1//0abcdefghijklmnopqrstuvwxyzABCDEF
GOOGLE_ACCESS_TOKEN=ya29.abcdefghijklmnopqrstuvwxyz
```

## 🔧 Configuration dans Google Search Console

### 1. Vérifier la Propriété du Site
1. Allez sur [Google Search Console](https://search.google.com/search-console)
2. Ajoutez votre propriété : `https://cciservices.online`
3. Vérifiez la propriété via une des méthodes :
   - Fichier HTML
   - Balise meta HTML
   - Google Analytics
   - Google Tag Manager
   - Enregistrement DNS

### 2. Configurer les Sitemaps
1. Dans Google Search Console, allez dans "Sitemaps"
2. Ajoutez ces sitemaps :
   - `https://cciservices.online/sitemap.xml`
   - `https://cciservices.online/articles-sitemap.xml`
   - `https://cciservices.online/posts-sitemap.xml`

### 3. Paramètres d'Indexation
1. Activez "Enhanced indexing with Google" si disponible
2. Configurez les notifications email pour les erreurs critiques
3. Vérifiez les paramètres de crawl budget

## 🚀 Test de Configuration

Une fois configuré, testez avec :

```bash
node scripts/test-gsc-api.cjs
```

### Script de Test
```javascript
// scripts/test-gsc-api.cjs
const { google } = require('googleapis');

async function testGSCAPI() {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      access_token: process.env.GOOGLE_ACCESS_TOKEN
    });

    const searchconsole = google.searchconsole({
      version: 'v1',
      auth: oauth2Client
    });

    const response = await searchconsole.sites.list();
    console.log('✅ GSC API Connection Success!');
    console.log('Sites:', response.data.siteEntry?.map(site => site.siteUrl) || []);

  } catch (error) {
    console.error('❌ GSC API Connection Failed:', error.message);
  }
}

testGSCAPI();
```

## 📊 Variables d'Environnement Ajoutées

### Configuration API
- `GOOGLE_CLIENT_ID` - ID client OAuth2
- `GOOGLE_CLIENT_SECRET` - Secret client OAuth2  
- `GOOGLE_REFRESH_TOKEN` - Token de rafraîchissement
- `GOOGLE_ACCESS_TOKEN` - Token d'accès (se renouvelle automatiquement)
- `GSC_SITE_URL` - URL de votre site dans GSC

### Configuration Site
- `SITE_URL` - URL principale du site
- `SITE_NAME` - Nom du site
- `DEFAULT_LANGUAGE` - Langue par défaut (fr)
- `SUPPORTED_LANGUAGES` - Langues supportées

### Monitoring
- `GSC_MONITORING_ENABLED` - Activer le monitoring (true/false)
- `GSC_CHECK_INTERVAL` - Intervalle de vérification (daily/weekly)
- `GSC_ALERT_EMAIL` - Email pour les alertes
- `GSC_WEBHOOK_URL` - URL webhook pour notifications

### Seuils de Performance
- `GSC_INDEXING_THRESHOLD` - Seuil d'indexation (90%)
- `GSC_HEALTH_THRESHOLD` - Seuil de santé (85%)
- `GSC_ALERT_THRESHOLD` - Seuil d'alerte (75%)

### Automatisation
- `AUTO_SUBMIT_NEW_ARTICLES` - Soumission automatique (true/false)
- `MONITOR_CRAWL_ERRORS` - Surveiller erreurs crawl (true/false)
- `TRACK_KEYWORD_RANKINGS` - Suivre classements (true/false)

## 🔐 Sécurité

### Bonnes Pratiques
1. **Ne jamais exposer** les tokens dans le code source
2. **Renouveler** les tokens d'accès régulièrement
3. **Limiter les scopes** aux permissions nécessaires
4. **Surveiller** l'utilisation de l'API dans Google Cloud Console
5. **Activer** l'audit des accès dans GSC

### Permissions Minimales
Pour le monitoring GSC, utilisez seulement :
- `https://www.googleapis.com/auth/webmasters.readonly`

Pour la soumission d'URLs :
- `https://www.googleapis.com/auth/webmasters`

## 📞 Support

En cas de problème :
1. Vérifiez les quotas API dans Google Cloud Console
2. Confirmez que l'API GSC est bien activée
3. Testez les tokens avec le script de test
4. Vérifiez les logs d'erreur dans les scripts de monitoring

---

**📝 Note:** Remplacez toutes les valeurs `your-*` par vos vraies clés API avant d'utiliser les scripts de monitoring en production.