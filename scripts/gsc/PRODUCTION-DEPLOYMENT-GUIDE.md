# 🚀 GUIDE DÉPLOIEMENT GSC PRODUCTION

## ✅ **FICHIERS DÉPLOYÉS EN PRODUCTION**

### 📦 **Fichiers Committed (9 files) :**

| Fichier | Description | Usage |
|---------|-------------|-------|
| `scripts/gsc/gsc-monitoring.cron` | Tâches cron automatisées | Quotidien 9h + Hebdo Dimanche 10h |
| `scripts/gsc/gsc-manager.cjs` | Centre de commande principal | Gestion unifiée des outils GSC |
| `scripts/gsc/config.json` | Configuration GSC | Paramètres d'analyse |
| `scripts/gsc/tools/monitoring-dashboard.cjs` | Monitoring quotidien | Cron job 9h - Santé GSC |
| `scripts/gsc/tools/complete-analysis.cjs` | Analyse hebdomadaire | Cron job Dimanche 10h - Rapport complet |
| `scripts/gsc/data/.gitkeep` | Structure répertoire data | Stockage données/historiques |
| `scripts/gsc/reports/.gitkeep` | Structure répertoire reports | Logs et rapports |
| `scripts/gsc/credentials/.gitkeep` | Structure répertoire credentials | Clés API (variables env) |
| `.gitignore` | Exceptions GSC ajoutées | Inclusion fichiers essentiels |

## 🔧 **CONFIGURATION PRODUCTION**

### **1. Variables d'Environnement :**
```bash
# Google Search Console API
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token

# Site Configuration
SITE_URL=https://cciservices.online
GSC_SITE_URL=https://cciservices.online/

# Paths
GSC_DATA_DIR=/app/scripts/gsc/data/
GSC_REPORTS_DIR=/app/scripts/gsc/reports/
```

### **2. Installation Dépendances :**
```bash
cd /app/scripts/gsc/
npm install googleapis fs path
```

### **3. Configuration Cron Jobs :**
```bash
# Ajouter au crontab du serveur
crontab -e

# Copier depuis gsc-monitoring.cron (adapter les chemins)
0 9 * * * cd /app/scripts/gsc && node tools/monitoring-dashboard.cjs >> reports/gsc-monitoring.log 2>&1
0 10 * * 0 cd /app/scripts/gsc && node tools/complete-analysis.cjs >> reports/gsc-analysis.log 2>&1
```

## 🧪 **TESTS PRODUCTION**

### **Test 1 - Vérification Structure :**
```bash
cd /app/scripts/gsc/
node gsc-manager.cjs status
```
**Attendu :** ✅ Santé globale 100%, tous les outils détectés

### **Test 2 - Monitoring Manuel :**
```bash
node tools/monitoring-dashboard.cjs
```
**Attendu :** Génération dashboard de santé GSC

### **Test 3 - Analyse Complète :**
```bash
node tools/complete-analysis.cjs
```
**Attendu :** Rapport d'analyse complet avec métriques

### **Test 4 - Logs :**
```bash
ls -la reports/
tail -f reports/gsc-monitoring.log
```
**Attendu :** Logs de monitoring visibles

## 📊 **MONITORING AUTOMATIQUE**

### **Quotidien (9h) - monitoring-dashboard.cjs :**
- ✅ Vérification santé GSC
- ✅ Taux d'indexation
- ✅ Nouvelles erreurs
- ✅ Alertes automatiques
- 📄 **Log :** `reports/gsc-monitoring.log`

### **Hebdomadaire (Dimanche 10h) - complete-analysis.cjs :**
- ✅ Analyse complète des performances
- ✅ Comparaison semaine précédente
- ✅ Recommandations d'optimisation
- ✅ Rapport détaillé
- 📄 **Log :** `reports/gsc-analysis.log`

## 🚨 **ALERTES & NOTIFICATIONS**

### **Critères d'Alerte :**
- 🔥 **Taux indexation < 90%**
- 🔥 **Nouvelles erreurs GSC**
- 🔥 **Pages non indexées > 10**
- 🔥 **Échec soumission URLs**

### **Actions Automatiques :**
- 📧 Notification équipe
- 📊 Dashboard mis à jour
- 🔄 Tentative correction automatique
- 📝 Log détaillé des erreurs

## 📋 **MAINTENANCE PRODUCTION**

### **Quotidienne :**
- [ ] Vérifier logs monitoring : `tail reports/gsc-monitoring.log`
- [ ] Contrôler santé système : `node gsc-manager.cjs status`
- [ ] Valider absence erreurs

### **Hebdomadaire :**
- [ ] Réviser rapport complet d'analyse
- [ ] Vérifier tendances d'indexation
- [ ] Optimiser si nécessaire

### **Mensuelle :**
- [ ] Nettoyer anciens logs
- [ ] Mettre à jour configuration si requis
- [ ] Réviser performances

## 🔑 **SÉCURITÉ**

### **Credentials :**
- ❌ **Jamais** de clés API dans le code
- ✅ **Variables d'environnement** uniquement
- ✅ **Rotation régulière** des clés
- ✅ **Accès minimal** requis

### **Logs :**
- ✅ **Rotation automatique** des logs
- ✅ **Pas d'informations sensibles**
- ✅ **Accès restreint** aux logs

## 📈 **MÉTRIQUES PRODUCTION**

### **KPIs Surveillés :**
- 📊 **Taux d'indexation** (objectif >90%)
- 📊 **Temps de détection erreurs** (objectif <24h)
- 📊 **Disponibilité monitoring** (objectif 99.9%)
- 📊 **Temps d'exécution scripts** (objectif <5min)

### **Rapports Générés :**
- 📄 **Dashboard quotidien** - Santé générale
- 📄 **Rapport hebdomadaire** - Analyse complète
- 📄 **Logs détaillés** - Debugging et historique

---

## ✅ **CHECKLIST DÉPLOIEMENT**

- [ ] ✅ **Fichiers commitées** (9 files)
- [ ] 🔧 **Variables environnement** configurées
- [ ] ⏰ **Cron jobs** installés
- [ ] 🧪 **Tests production** passés
- [ ] 📊 **Monitoring** opérationnel
- [ ] 🚨 **Alertes** configurées
- [ ] 📋 **Documentation** équipe

---

*Guide généré le ${new Date().toLocaleString()}*  
*Status : ✅ PRÊT POUR PRODUCTION*