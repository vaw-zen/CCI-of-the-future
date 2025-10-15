# Script de Nettoyage CCI Services
# Supprime les références à l'ancien projet MindCare

echo "🧹 Nettoyage des anciens credentials..."

# Nettoyer .env.local
if [ -f ".env.local" ]; then
    echo "Nettoyage de .env.local..."
    cp .env.local .env.local.backup
    sed -i '/mindcare/Id' .env.local
    sed -i '/MindCare/d' .env.local
fi

# Nettoyer les credentials locaux
rm -f credentials.json
rm -f google-credentials.json  
rm -f client_secret.json

echo "✅ Nettoyage terminé!"
echo "📝 Sauvegarde créée: .env.local.backup"
