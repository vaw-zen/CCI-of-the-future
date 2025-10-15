@echo off
REM Script d'Automatisation GSC CCI Services
REM Exécute le monitoring quotidien

echo 📊 Démarrage du monitoring GSC CCI Services...
cd /d "C:\Users\chaab\Documents\CCI-of-the-future"

echo 🔍 Monitoring quotidien en cours...
node scripts\gsc-monitoring.cjs

echo ✅ Monitoring terminé!
echo 📊 Consultez gsc-monitoring-dashboard.md pour les résultats

pause