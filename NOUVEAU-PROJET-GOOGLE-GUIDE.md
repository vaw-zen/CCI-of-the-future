# 🚀 Guide Configuration Google Cloud - CCI Services (Nouveau Projet)

## ✅ Situation Actuelle
- ✅ Ancien projet "MindCare" supprimé 
- ✅ Anciennes clés remplacées par des placeholders
- ✅ Configuration propre prête pour nouveau projet

## 🎯 Objectif
Créer un nouveau projet Google Cloud dédié exclusivement à CCI Services avec de nouvelles clés OAuth2.

---

## 📋 ÉTAPES À SUIVRE MAINTENANT

### 🔧 Étape 1: Nouveau Projet Google Cloud
1. **Allez sur [Google Cloud Console](https://console.cloud.google.com/)**
2. **Cliquez sur le sélecteur de projet** en haut à gauche
3. **Cliquez sur "NEW PROJECT"**
4. **Remplissez les informations :**
   - **Project name:** `CCI Services GSC 2025`
   - **Project ID:** `cci-services-gsc-2025` (ou laissez Google générer)
   - **Organization:** Laissez vide si pas d'organisation
5. **Cliquez "CREATE"**
6. **Attendez la création** (quelques secondes)
7. **Sélectionnez le nouveau projet** avant de continuer

### 🔌 Étape 2: Activer l'API Google Search Console
1. **Dans le nouveau projet**, allez dans le menu ☰
2. **APIs & Services** > **Library**
3. **Recherchez** "Google Search Console API"
4. **Cliquez** sur "Google Search Console API"
5. **Cliquez "ENABLE"**
6. **Attendez l'activation** (quelques secondes)

### 🔐 Étape 3: Configurer OAuth Consent Screen
1. **APIs & Services** > **OAuth consent screen**
2. **Choisissez "External"** (sauf si vous avez Google Workspace)
3. **Remplissez les informations obligatoires :**
   ```
   App name: CCI Services GSC Monitor
   User support email: chaaben.fares94@gmail.com
   App domain (optionnel): cciservices.online
   Developer contact: chaaben.fares94@gmail.com
   ```
4. **Cliquez "SAVE AND CONTINUE"**
5. **Scopes page** - Cliquez "ADD OR REMOVE SCOPES"
6. **Ajoutez ce scope :**
   ```
   https://www.googleapis.com/auth/webmasters.readonly
   ```
7. **Cliquez "UPDATE"** puis "SAVE AND CONTINUE"
8. **Test users** - Ajoutez votre email : `chaaben.fares94@gmail.com`
9. **Cliquez "SAVE AND CONTINUE"**

### 🔑 Étape 4: Créer OAuth 2.0 Client ID
1. **APIs & Services** > **Credentials**
2. **Cliquez "CREATE CREDENTIALS"** > **"OAuth 2.0 Client ID"**
3. **Application type:** "Web application"
4. **Name:** `CCI Services GSC Client`
5. **Authorized JavaScript origins :**
   ```
   https://cciservices.online
   http://localhost:3000
   ```
6. **Authorized redirect URIs :**
   ```
   https://cciservices.online/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google
   ```
7. **Cliquez "CREATE"**

### 📥 Étape 5: Télécharger les Credentials
1. **Une popup s'ouvre** avec vos nouvelles clés
2. **COPIEZ** le Client ID (commence par des chiffres)
3. **COPIEZ** le Client Secret (commence par GOCSPX-)
4. **Optionnel :** Téléchargez le fichier JSON

---

## 🔄 MISE À JOUR .env.local

Remplacez les placeholders dans votre `.env.local` :

```bash
# Google Search Console API Configuration - CCI Services UNIQUEMENT
GOOGLE_CLIENT_ID=VOTRE_NOUVEAU_CLIENT_ID_ICI
GOOGLE_CLIENT_SECRET=VOTRE_NOUVEAU_CLIENT_SECRET_ICI
GOOGLE_PROJECT_ID=cci-services-gsc-2025
GOOGLE_REFRESH_TOKEN=your-refresh-token-after-auth
GOOGLE_ACCESS_TOKEN=your-access-token-after-auth
GSC_SITE_URL=https://cciservices.online
```

---

## 🧪 TEST DE CONFIGURATION

Après avoir mis à jour les clés, testez la configuration :

```bash
node scripts/test-gsc-config.cjs
```

---

## 📞 EN CAS DE PROBLÈME

### Erreur "redirect_uri_mismatch" :
- ✅ Vérifiez que vous utilisez le BON projet (CCI Services)
- ✅ Vérifiez les URLs autorisées dans OAuth2
- ✅ Assurez-vous d'utiliser les NOUVELLES clés

### Erreur "invalid_client" :
- ✅ Vérifiez que l'API Search Console est activée
- ✅ Vérifiez que les clés sont correctement copiées
- ✅ Pas d'espaces en début/fin de clés

### Erreur "access_denied" :
- ✅ Vérifiez OAuth consent screen configuré
- ✅ Ajoutez votre email comme test user
- ✅ Vérifiez les scopes configurés

---

## ✅ CHECKLIST FINALE

- [ ] Nouveau projet Google Cloud créé
- [ ] API Search Console activée
- [ ] OAuth consent screen configuré
- [ ] Client ID OAuth2 créé
- [ ] URLs autorisées configurées
- [ ] Clés copiées dans .env.local
- [ ] Test de configuration réussi

---

## 🎯 RÉSULTAT ATTENDU

Après ces étapes, vous devriez pouvoir :
- ✅ Autoriser l'application sans erreur "MindCare"
- ✅ Accéder aux données Google Search Console
- ✅ Utiliser les scripts de monitoring GSC
- ✅ Automatiser la surveillance d'indexation

---

**📝 Note importante :** Ce nouveau projet est dédié UNIQUEMENT à CCI Services. Aucune confusion possible avec d'autres projets !

**📞 Support :** Si vous rencontrez des difficultés, partagez le message d'erreur exact pour un diagnostic précis.