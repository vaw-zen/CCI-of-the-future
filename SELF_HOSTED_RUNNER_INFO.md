# 🏃‍♂️ CONFIGURATION RUNNER AUTO-HÉBERGÉ (OPTIONNEL)

## ⚠️ ATTENTION : Pas recommandé pour ce projet
# Les runners GitHub gratuits sont suffisants pour vos besoins

## 📥 Installation (si vraiment nécessaire)

### Étape 1: Créer le dossier
```powershell
# Créer dossier à la racine
mkdir C:\actions-runner
cd C:\actions-runner
```

### Étape 2: Télécharger le runner
```powershell
# Télécharger la dernière version
Invoke-WebRequest -Uri https://github.com/actions/runner/releases/download/v2.328.0/actions-runner-win-x64-2.328.0.zip -OutFile actions-runner-win-x64-2.328.0.zip

# Vérifier le hash (optionnel)
if((Get-FileHash -Path actions-runner-win-x64-2.328.0.zip -Algorithm SHA256).Hash.ToUpper() -ne 'a73ae192b8b2b782e1d90c08923030930b0b96ed394fe56413a073cc6f694877'.ToUpper()){ 
    throw 'Computed checksum did not match' 
}

# Extraire
Add-Type -AssemblyName System.IO.Compression.FileSystem 
[System.IO.Compression.ZipFile]::ExtractToDirectory("$PWD/actions-runner-win-x64-2.328.0.zip", "$PWD")
```

### Étape 3: Configuration
```powershell
# Configurer le runner
./config.cmd --url https://github.com/vaw-zen/CCI-of-the-future --token A377JCCCUTVI2MY2P6HVM53I4HAKC

# Lancer le runner
./run.cmd
```

## 🔧 Modifier le Workflow (si runner auto-hébergé)

Dans `.github/workflows/daily-facebook-post.yml`, changer :
```yaml
jobs:
  auto-post:
    runs-on: self-hosted  # Au lieu de ubuntu-latest
```

## 💡 RECOMMANDATION FINALE

❌ **Ne configurez PAS** de runner auto-hébergé  
✅ **Utilisez** les runners GitHub gratuits  
✅ **Configurez** simplement les GitHub Secrets  
✅ **Testez** l'automation directement  

Votre usage (1 post/jour) consomme <5% du quota gratuit !

---
*Note: Ce fichier est fourni pour information mais l'usage des runners GitHub est fortement recommandé*