# Configuration du Reset Password avec Supabase

## 🔧 Configuration requise dans Supabase

Pour que la fonctionnalité de réinitialisation de mot de passe fonctionne correctement, vous devez configurer les URLs de redirection dans votre projet Supabase.

### 1. Accédez à votre projet Supabase
- Allez sur [supabase.com](https://supabase.com)
- Connectez-vous et sélectionnez votre projet

### 2. Configuration des URLs de redirection
1. Dans le menu de gauche, cliquez sur **Authentication**
2. Allez dans l'onglet **URL Configuration**
3. Dans la section **Redirect URLs**, ajoutez les URLs suivantes :

**Pour le développement local :**
```
http://localhost:3000/admin/reset-password
```

**Pour la production (remplacez yourdomain.com par votre domaine) :**
```
https://yourdomain.com/admin/reset-password
```

### 3. Configuration des templates d'email (optionnel)
1. Allez dans l'onglet **Email Templates**
2. Sélectionnez **Reset Password**
3. Vous pouvez personnaliser le template d'email si nécessaire

## 🚀 Comment utiliser la fonctionnalité

### Pour l'administrateur qui a oublié son mot de passe :

1. **Aller à la page de connexion**
   - Accédez à `/admin/login`

2. **Demander une réinitialisation**
   - Cliquez sur "Mot de passe oublié ?"
   - Saisissez votre email d'administrateur
   - Cliquez sur "Envoyer le lien de réinitialisation"

3. **Vérifier votre email**
   - Supabase enverra un email avec un lien de réinitialisation
   - Cliquez sur le lien dans l'email

4. **Réinitialiser le mot de passe**
   - Vous serez redirigé vers `/admin/reset-password`
   - Saisissez votre nouveau mot de passe
   - Confirmez le nouveau mot de passe
   - Cliquez sur "Mettre à jour le mot de passe"

5. **Connexion avec le nouveau mot de passe**
   - Vous serez redirigé vers la page de connexion
   - Connectez-vous avec votre nouveau mot de passe

## 🔒 Sécurité

- Les liens de réinitialisation expirent automatiquement
- Les mots de passe doivent contenir au moins 6 caractères
- La confirmation du mot de passe est obligatoire
- Seuls les utilisateurs authentifiés peuvent accéder au dashboard admin

## 🛠️ Dépannage

### Le lien de réinitialisation ne fonctionne pas
- Vérifiez que les URLs de redirection sont correctement configurées dans Supabase
- Assurez-vous que l'URL correspond exactement (avec ou sans trailing slash)
- Vérifiez que le lien n'a pas expiré

### Email non reçu
- Vérifiez vos spams
- Assurez-vous que l'email est bien enregistré dans la table admin_users
- Vérifiez la configuration SMTP de Supabase

### Erreur lors de la mise à jour
- Vérifiez que le lien n'a pas expiré
- Assurez-vous que les mots de passe correspondent
- Vérifiez la longueur minimale du mot de passe (6 caractères)

## 📁 Fichiers concernés

- `/src/app/admin/login/page.jsx` - Page de connexion avec option reset
- `/src/app/admin/reset-password/page.jsx` - Page de réinitialisation
- `/src/app/admin/reset-password/reset.module.css` - Styles de la page reset
- `/src/hooks/useAdminAuth.js` - Hook d'authentification admin
- `middleware.js` - Protection des routes admin

## 🎯 Test de la fonctionnalité

1. Assurez-vous d'avoir un admin dans votre base de données
2. Allez sur `/admin/login`
3. Cliquez sur "Mot de passe oublié ?"
4. Saisissez l'email de l'admin
5. Vérifiez la réception de l'email
6. Suivez le lien et testez la réinitialisation