# 🔑 CONFIGURATION GITHUB SECRETS POUR L'AUTOMATION

## 📍 **Où Configurer les Variables dans GitHub**

1. Aller sur **GitHub.com** → votre repo **CCI-of-the-future**
2. Cliquer sur **Settings** (onglet en haut)
3. Dans le menu de gauche → **Secrets and variables** → **Actions**
4. Cliquer **"New repository secret"** pour chaque variable

## 🔧 **Variables Obligatoires à Ajouter**

### **1. GEMINI_API_KEY**
```
Name: GEMINI_API_KEY
Value: AIzaSyBiEQFqtxkgn_3S2lNFpLMonnVp45QlhZk
```
*Clé API Google Gemini pour génération de contenu IA*

### **2. FB_PAGE_ID**  
```
Name: FB_PAGE_ID
Value: 102106381365856
```
*ID de votre page Facebook CCI Services*

### **3. FB_PAGE_ACCESS_TOKEN**
```
Name: FB_PAGE_ACCESS_TOKEN  
Value: EAAbZBmVLcT2MBPtbdEZBEGvZCg32NH0V0Jgp1KwbCB1h0UeMJN5j0QXwGCuRCe94XYIIeEHtas5ZBz7OQ4JBSwQga8vEepyKwzpaLTnV0xDJcSyxqPHJAlJaV7ZC2YSvAGTTPRAzS7iStGjWd7DbX1WVrKywpU6lUlHL13b7v0GvbX6LHiIJuXOHlHTWTC9F5Bxc2kPtSKLUHOGhC
```
*Token d'accès pour publier sur votre page Facebook*

## 🔧 **Variables Optionnelles (Recommandées)**

### **4. FB_API_VERSION**
```
Name: FB_API_VERSION
Value: v23.0
```
*Version de l'API Facebook (par défaut v23.0)*

### **5. NEXT_PUBLIC_SITE_URL**
```
Name: NEXT_PUBLIC_SITE_URL  
Value: https://cciservices.online
```
*URL de votre site web CCI Services*

## ✅ **Liste de Vérification**

Après avoir ajouté les secrets, vous devriez voir dans **Settings → Secrets and variables → Actions** :

- [x] `GEMINI_API_KEY` ✅
- [x] `FB_PAGE_ID` ✅  
- [x] `FB_PAGE_ACCESS_TOKEN` ✅
- [x] `FB_API_VERSION` ✅ (optionnel)
- [x] `NEXT_PUBLIC_SITE_URL` ✅ (optionnel)

## 🚀 **Test de l'Automation**

### **Après Configuration** :
1. Aller dans **Actions** → **"Daily Facebook Post with Gemini AI"**
2. Cliquer **"Run workflow"** 
3. Choisir **"tip"** comme type de post
4. Cliquer **"Run workflow"** (bouton vert)
5. Attendre 2-3 minutes
6. Vérifier le résultat dans les logs

### **Résultat Attendu** :
```
✅ Successfully posted to Facebook!
📱 Post ID: 1234567890
🖼️ Image: https://cciservices.online/home/...
📝 Content: [Contenu généré en français]
```

## ⚠️ **Points Importants**

### **Sécurité** :
- ❌ **Ne jamais** copier ces valeurs dans un fichier public
- ✅ **Toujours** utiliser GitHub Secrets
- 🔄 **Renouveler** le FB_PAGE_ACCESS_TOKEN si expiré

### **Tokens Facebook** :
- **Durée** : Le token peut expirer (vérifier périodiquement)
- **Permissions** : Doit avoir `pages_manage_posts` et `pages_read_engagement`
- **Test** : Utiliser d'abord le déclenchement manuel

### **Quotas Gemini** :
- **Gratuit** : 15 requêtes/minute, 1500/jour
- **Payant** : Quotas plus élevés si nécessaire

## 🛠️ **Dépannage**

### **Si l'automation échoue** :
1. **Vérifier** que tous les secrets sont configurés
2. **Tester** manuellement d'abord  
3. **Regarder** les logs détaillés dans Actions
4. **Renouveler** le token Facebook si nécessaire

### **Erreurs Courantes** :
- `Missing configuration` → Secrets manquants
- `Facebook API error` → Token expiré ou permissions
- `Gemini API error` → Quota dépassé ou clé invalide

---
*Guide Configuration GitHub Secrets - Octobre 2025*  
*Status: ✅ PRÊT POUR ACTIVATION*