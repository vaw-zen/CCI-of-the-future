# 🔑 Guide Rapide - Télécharger la Clé Service Account

## ✅ Situation Actuelle
- ✅ Service Account configuré : `cci-8bd10@appspot.gserviceaccount.com`
- ✅ Ajouté comme propriétaire dans Google Search Console
- ❌ Fichier de clé privée manquant

## 🚀 Actions à Faire MAINTENANT

### Étape 1: Télécharger la Clé
1. **Allez sur [Google Cloud Console](https://console.cloud.google.com/)**
2. **Sélectionnez le projet:** `cci-8bd10`
3. **Menu ☰** > **IAM & Admin** > **Service Accounts**
4. **Trouvez:** `cci-8bd10@appspot.gserviceaccount.com`
5. **Cliquez sur les 3 points** à droite > **Manage keys**
6. **Add Key** > **Create new key**
7. **Format:** JSON
8. **Cliquez CREATE**
9. **Téléchargement automatique** du fichier

### Étape 2: Placer le Fichier
1. **Renommez** le fichier téléchargé en : `google-service-account-key.json`
2. **Placez-le** dans : `C:\Users\chaab\Documents\CCI-of-the-future\`
3. **Vérifiez** qu'il est au même niveau que `package.json`

### Étape 3: Tester la Configuration
```bash
node scripts/service-account-setup.cjs
```

## 🎯 Résultat Attendu
Après ces étapes :
- ✅ Fichier de clé: `google-service-account-key.json`
- ✅ Validation réussie
- ✅ Connexion GSC fonctionnelle
- ✅ Scripts de monitoring opérationnels

## 🔒 Sécurité
⚠️ **IMPORTANT:** Ne partagez jamais ce fichier de clé !
- Ajoutez `google-service-account-key.json` à `.gitignore`
- Ne le commitez pas dans le repository
- Gardez-le seulement en local

## 📞 Support
Une fois le fichier placé, exécutez :
```bash
node scripts/service-account-setup.cjs
```

Si tout est vert ✅, votre configuration GSC sera complète !

---

**Prochaine étape :** Télécharger la clé JSON depuis Google Cloud Console