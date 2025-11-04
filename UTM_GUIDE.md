# Guide UTM - Paramètres Marketing pour CCI Services

## 🎯 Qu'est-ce que les paramètres UTM ?

Les paramètres UTM permettent de suivre **d'où viennent vos visiteurs** dans Google Analytics. Ils répondent aux questions :
- Quelle plateforme a envoyé le visiteur ? (Facebook, Instagram, Google Ads)
- Quel type de contenu ? (Post, Reel, Story, Publicité)
- Quelle campagne spécifique ? (Promo été, Nouveau service, etc.)

## ✅ Ce qui a été configuré

### 1. Capture automatique dans Google Analytics
✅ Les paramètres UTM sont maintenant **automatiquement capturés** dans GA4
✅ Un événement `utm_arrival` est envoyé pour chaque visite avec UTM
✅ Les paramètres sont stockés en `sessionStorage` et `localStorage`

### 2. Générateur UTM intelligent
✅ Module `utmGenerator.js` pour créer des liens cohérents
✅ Presets pour toutes les plateformes (Facebook, Instagram, Google, Email)
✅ Validation automatique des paramètres

## 📱 Comment utiliser les UTM dans vos posts

### Facebook - Post organique
```
Lien à partager :
https://cciservices.online?utm_source=facebook&utm_medium=social&utm_campaign=organic_post&utm_content=nettoyage_moquette
```

### Facebook - Reel
```
https://cciservices.online/services?utm_source=facebook&utm_medium=social&utm_campaign=reels&utm_content=avant_apres_marbre
```

### Instagram - Bio
```
https://cciservices.online?utm_source=instagram&utm_medium=social&utm_campaign=bio_link
```

### Instagram - Story avec lien
```
https://cciservices.online/devis?utm_source=instagram&utm_medium=social&utm_campaign=stories&utm_content=promo_ete
```

### WhatsApp Status
```
https://cciservices.online?utm_source=whatsapp&utm_medium=messaging&utm_campaign=status&utm_content=nouveau_service
```

## 🔧 Utiliser le générateur de liens (pour développeurs)

```javascript
import { generateUTMUrl, UTM_PRESETS, QuickLinks } from '@/utils/utmGenerator';

// Méthode 1 : Utilisation directe
const url = generateUTMUrl('https://cciservices.online/marbre', {
  source: 'facebook',
  medium: 'social',
  campaign: 'service_marbre',
  content: 'video_demo'
});

// Méthode 2 : Avec les presets
const url2 = generateUTMUrl('https://cciservices.online/salon', UTM_PRESETS.INSTAGRAM_REEL);

// Méthode 3 : Quick Links (le plus simple)
const facebookLink = QuickLinks.facebookServicePost('tapis');
// Résultat: https://cciservices.online/tapis?utm_source=facebook&utm_medium=social&utm_campaign=service_promotion&utm_content=tapis
```

## 📊 Voir vos UTM dans Google Analytics

### 1. Rapports en temps réel
1. Allez dans **Rapports > Temps réel**
2. Cliquez sur un visiteur actif
3. Vous verrez les paramètres UTM dans les détails

### 2. Rapports d'acquisition
1. Allez dans **Rapports > Acquisition > Acquisition de trafic**
2. Changez la dimension principale en **Source / Support** (utm_source / utm_medium)
3. Vous verrez d'où viennent vos visiteurs

### 3. Créer un rapport personnalisé
1. Allez dans **Explorer**
2. Créez un rapport avec ces dimensions :
   - **Source** (utm_source)
   - **Support** (utm_medium)
   - **Campagne** (utm_campaign)
   - **Contenu** (utm_content)
3. Métriques recommandées :
   - Sessions
   - Nouveaux utilisateurs
   - Conversions (leads)
   - Durée d'engagement

## 🧪 Tester vos liens UTM

### Test manuel
1. Ouvrez votre navigateur en **mode privé/incognito**
2. Copiez-collez votre lien UTM dans la barre d'adresse
3. Ouvrez la console (F12) et vous verrez :
   ```
   UTM Parameters detected: {
     source: "facebook",
     medium: "social",
     campaign: "organic_post",
     content: "nettoyage_moquette"
   }
   ```
4. Vérifiez dans **Google Analytics > Temps réel** (après ~30 secondes)

### Test avec l'outil de validation
```javascript
import { validateUTMUrl } from '@/utils/utmGenerator';

const validation = validateUTMUrl('https://cciservices.online?utm_source=facebook&utm_medium=social&utm_campaign=test');

console.log(validation);
// {
//   isValid: true,
//   hasSource: true,
//   hasMedium: true,
//   hasCampaign: true,
//   parameters: { source: 'facebook', medium: 'social', campaign: 'test' }
// }
```

## 📋 Bonnes pratiques

### ✅ À FAIRE
- Toujours utiliser **source + medium + campaign** (les 3 obligatoires)
- Utiliser des noms **descriptifs et cohérents**
- Garder les noms en **minuscules**
- Remplacer les espaces par **underscores** (`_`)
- Utiliser le générateur pour éviter les erreurs

### ❌ À ÉVITER
- ❌ Oublier l'un des 3 paramètres obligatoires
- ❌ Mélanger majuscules et minuscules
- ❌ Utiliser des espaces dans les valeurs
- ❌ Créer des noms différents pour la même chose (ex: "fb" vs "facebook")
- ❌ Créer des liens manuellement (risque d'erreur)

## 🎨 Structure recommandée pour vos campagnes

### Nomenclature conseillée :

#### utm_source (D'où vient le trafic)
- `facebook` - Posts Facebook
- `instagram` - Posts Instagram
- `google` - Recherche Google ou Google Ads
- `whatsapp` - Messages WhatsApp
- `email` - Emails/Newsletters
- `direct` - Lien direct partagé

#### utm_medium (Type de canal)
- `social` - Post organique sur réseau social
- `cpc` - Publicité payante (coût par clic)
- `email` - Email marketing
- `messaging` - Messages directs
- `referral` - Référence d'un autre site

#### utm_campaign (Nom de campagne)
- `organic_post` - Post organique standard
- `reels` - Contenu video court
- `stories` - Stories 24h
- `service_promotion` - Promotion d'un service spécifique
- `summer_promo` - Promotion saisonnière été
- `new_service` - Lancement nouveau service
- `bio_link` - Lien dans la bio

#### utm_content (Optionnel - variante de contenu)
- `nettoyage_moquette` - Sujet du post
- `avant_apres` - Type de contenu
- `video_demo` - Format du contenu
- `cta_principal` - Quel bouton/lien dans le post

## 🚀 Quick Start - Liens prêts à l'emploi

### Facebook
```
Post standard:
https://cciservices.online?utm_source=facebook&utm_medium=social&utm_campaign=organic_post

Reel service marbre:
https://cciservices.online/marbre?utm_source=facebook&utm_medium=social&utm_campaign=reels&utm_content=marbre_demo

Story promo:
https://cciservices.online/devis?utm_source=facebook&utm_medium=social&utm_campaign=stories&utm_content=promo_devis
```

### Instagram
```
Bio:
https://cciservices.online?utm_source=instagram&utm_medium=social&utm_campaign=bio_link

Post service tapis:
https://cciservices.online/tapis?utm_source=instagram&utm_medium=social&utm_campaign=organic_post&utm_content=tapis_avant_apres

Reel:
https://cciservices.online/services?utm_source=instagram&utm_medium=social&utm_campaign=reels&utm_content=tous_services
```

### WhatsApp
```
Status:
https://cciservices.online?utm_source=whatsapp&utm_medium=messaging&utm_campaign=status

Message direct:
https://cciservices.online/contact?utm_source=whatsapp&utm_medium=messaging&utm_campaign=direct_message
```

## 🔍 Debugging

Si vos UTM n'apparaissent pas dans GA4 :

1. **Vérifier que le lien contient les UTM**
   - Ouvrez le lien en mode incognito
   - Regardez l'URL dans la barre d'adresse
   - Les paramètres `?utm_source=...` doivent être visibles

2. **Vérifier la console du navigateur (F12)**
   - Vous devriez voir : `UTM Parameters detected: {...}`
   - Si absent, les UTM ne sont pas dans l'URL

3. **Attendre 24-48h pour les rapports**
   - Les données apparaissent immédiatement dans "Temps réel"
   - Mais les rapports complets prennent 24-48h

4. **Vérifier dans localStorage**
   ```javascript
   // Ouvrir la console du navigateur et taper :
   JSON.parse(localStorage.getItem('utm_history'))
   ```

## 📞 Support

Pour toute question sur les UTM ou les analytics :
- Vérifier ce guide d'abord
- Consulter `src/utils/utmGenerator.js` pour les exemples de code
- Tester avec l'outil de validation intégré

---

**Dernière mise à jour** : 4 novembre 2025
**Version** : 1.0
