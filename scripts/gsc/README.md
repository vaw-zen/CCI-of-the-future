# CCI Services - Google Search Console Tools

## 📂 Structure des dossiers

### 🔧 tools/
Scripts d'outils GSC principaux :
- `crisis-analysis.cjs` - Analyse de crise et tableau de bord
- `daily-monitor.cjs` - Monitoring quotidien automatisé
- `massive-submission.cjs` - Soumission massive d'URLs
- `data-analyzer.cjs` - Analyse des données GSC
- Et autres outils spécialisés...

### 📊 data/
Données et historiques :
- `daily-tracking.json` - Historique quotidien
- `url-lists/` - Listes d'URLs pour soumission
- `csv-exports/` - Exports GSC en CSV
- `baseline.json` - Données de référence

### 📝 reports/
Rapports générés automatiquement :
- `crisis-reports/` - Rapports de crise
- `daily-reports/` - Rapports quotidiens
- `analysis-reports/` - Analyses détaillées
- `dashboards/` - Tableaux de bord

### 🔑 credentials/
Clés d'authentification :
- `gsc-service-account.json` - Clé Google Search Console
- `indexing-api-key.json` - Clé Google Indexing API
- `.env` - Variables d'environnement

## 🚀 Utilisation

```bash
# Depuis le dossier /scripts/gsc/
node gsc-manager.cjs <command>

# Commandes principales
node gsc-manager.cjs crisis    # Analyse de crise
node gsc-manager.cjs submit    # Soumission massive
node gsc-manager.cjs daily     # Monitoring quotidien
```

## 📊 Workflow de récupération

1. **Analyse** : `crisis` pour évaluer la situation
2. **Action** : `submit` pour soumettre les URLs
3. **Suivi** : `daily` pour monitoring continu

---

*Générée automatiquement le 10/23/2025, 3:42:15 AM*
