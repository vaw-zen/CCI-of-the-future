# 🤖 GUIDE GITHUB ACTIONS - CCI SERVICES AUTO-POST

## 📍 **Localisation du Fichier d'Automation**

### **Chemin Complet** :
```
C:\Users\chaab\Documents\CCI-of-the-future\.github\workflows\daily-facebook-post.yml
```

### **Pourquoi VS Code ne l'affiche pas ?** 
Le dossier `.github` commence par un point, ce qui peut le rendre "caché" dans certains éditeurs.

### **Comment Accéder au Fichier** :
1. **Via Explorateur Windows** :
   - Ouvrir l'Explorateur de fichiers
   - Aller dans `C:\Users\chaab\Documents\CCI-of-the-future\`
   - Double-cliquer sur `.github` puis `workflows`
   - Le fichier `daily-facebook-post.yml` (4.8KB) s'y trouve

2. **Via Terminal** :
   ```powershell
   cd "C:\Users\chaab\Documents\CCI-of-the-future"
   notepad .github\workflows\daily-facebook-post.yml
   ```

3. **Via VS Code** :
   - Fichier → Ouvrir un fichier
   - Naviguer vers le chemin complet
   - Ou utiliser Ctrl+O et taper le chemin

## ⚙️ **Configuration Requise**

### **Variables d'Environnement (GitHub Secrets)** :
Dans votre repo GitHub, aller dans **Settings → Secrets and variables → Actions** :

```
FB_PAGE_ID=YOUR_FACEBOOK_PAGE_ID
FB_PAGE_ACCESS_TOKEN=YOUR_FACEBOOK_ACCESS_TOKEN  
GEMINI_API_KEY=YOUR_GOOGLE_GEMINI_API_KEY
FB_API_VERSION=v23.0 (optionnel)
NEXT_PUBLIC_SITE_URL=https://cciservices.online (optionnel)
```

## 🚀 **Comment Utiliser l'Automation**

### **1. Activation Automatique** :
- L'automation se déclenche **automatiquement** chaque jour à **10h00 Tunisie**
- Rotation des types de posts : tip → motivation → service → seasonal

### **2. Déclenchement Manuel** :
1. Aller sur GitHub.com → votre repo
2. Cliquer sur l'onglet **"Actions"**
3. Sélectionner **"Daily Facebook Post with Gemini AI"**
4. Cliquer **"Run workflow"**
5. Choisir le type de post (optionnel)
6. Ajouter un prompt personnalisé (optionnel)
7. Cliquer **"Run workflow"**

## 📊 **Monitoring et Logs**

### **Vérifier les Résultats** :
1. **GitHub Actions Tab** : Voir l'historique des exécutions
2. **Summary** : Résumé avec Post ID Facebook et contenu généré
3. **Logs Détaillés** : Débogage en cas de problème

### **Types de Logs** :
- ✅ **Success** : Post ID Facebook + contenu généré
- ❌ **Error** : Message d'erreur détaillé
- 🔍 **Debug** : API response complète

## 🛠️ **Dépannage**

### **Problèmes Courants** :
1. **Missing secrets** : Vérifier que toutes les variables sont configurées
2. **Facebook API error** : Vérifier que le token n'a pas expiré
3. **Gemini API error** : Vérifier la clé API et les quotas
4. **Build failed** : Problème de dependencies Node.js

### **Solutions** :
- **Re-run workflow** : Essayer de relancer en cas d'erreur temporaire
- **Check secrets** : Vérifier la configuration des variables
- **Update tokens** : Renouveler les tokens expirés
- **Contact support** : En cas de problème persistant

## 📈 **Fonctionnalités Avancées**

### **Rotation Intelligente** :
- Utilise le jour de l'année pour alterner les types de posts
- Assure une variété de contenu sur la semaine

### **Images CCI Services** :
- 100% images locales de vos services
- Sélection intelligente selon le type de contenu
- 5 catégories : salon, tapis, marbre, post-chantier, tapisserie

### **Contenu IA Optimisé** :
- Français naturel pour Facebook
- 200-400 caractères optimaux
- Call-to-actions spécifiques CCI Services
- Emojis intégrés naturellement

---
*Guide GitHub Actions CCI Services - Octobre 2025*
*Automation Status: ✅ ACTIVE*