# Guide de Déploiement via SSH - Windows

Ce guide vous explique comment déployer votre application Next.js sur votre VPS Hostinger via SSH depuis Windows.

## 📋 Prérequis

1. **Accès SSH à votre VPS Hostinger**
   - IP: `168.231.87.171`
   - Utilisateur: `root` (ou votre utilisateur)
   - Mot de passe ou clé SSH

2. **Outils nécessaires sur Windows:**
   - OpenSSH (inclus dans Windows 10/11)
   - Git Bash ou PowerShell
   - Node.js (déjà installé ✅)

## 🔑 Étape 1: Obtenir les identifiants SSH

### Option A: Via le panneau Hostinger

1. Connectez-vous à [hPanel Hostinger](https://hpanel.hostinger.com)
2. Allez dans **VPS** → Votre serveur
3. Trouvez la section **SSH Access** ou **Root Password**
4. Notez le mot de passe root ou téléchargez la clé SSH

### Option B: Réinitialiser le mot de passe

Si vous n'avez pas le mot de passe, réinitialisez-le depuis hPanel.

## 🚀 Étape 2: Tester la connexion SSH

Ouvrez PowerShell ou Git Bash et testez la connexion:

```powershell
ssh root@168.231.87.171
```

**Si c'est la première connexion**, vous verrez:
```
The authenticity of host '168.231.87.171' can't be established.
Are you sure you want to continue connecting (yes/no)?
```
Tapez `yes` et appuyez sur Entrée.

**Entrez votre mot de passe** quand demandé.

✅ Si vous voyez un prompt comme `root@srv1182909:~#`, la connexion fonctionne!

Tapez `exit` pour quitter.

## 📦 Étape 3: Préparer l'application localement

### 3.1 Construire l'application

Dans PowerShell (depuis le dossier du projet):

```powershell
npm run build
```

### 3.2 Créer une archive de déploiement

**Option A: Avec tar (si disponible sur Windows):**

```powershell
tar --exclude='node_modules' --exclude='.next' --exclude='.git' --exclude='.env.local' --exclude='.env' -czf deploy.tar.gz .
```

**Option B: Avec 7-Zip (si installé):**

```powershell
# Installer 7-Zip si nécessaire: https://www.7-zip.org/
7z a -tzip deploy.zip -xr!node_modules -xr!.next -xr!.git -xr!.env.local -xr!.env .
```

**Option C: Utiliser Git (Recommandé pour production)**

C'est la méthode la plus simple et la plus fiable:

```powershell
# Assurez-vous que tout est commité et poussé sur GitHub
git add .
git commit -m "Deployment update"
git push origin main
```

## 🚀 Étape 4: Déployer sur le VPS

### Méthode 1: Déploiement avec Git (Recommandé) ⭐

#### 4.1 Se connecter au VPS

```powershell
ssh root@168.231.87.171
```

#### 4.2 Installer les prérequis (première fois seulement)

```bash
# Mettre à jour le système
apt-get update && apt-get upgrade -y

# Installer Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Installer Python 3.11+ et pip (pour le scraper Python)
apt-get install -y python3 python3-pip python3-venv

# Installer PM2 (gestionnaire de processus)
npm install -g pm2

# Installer Git (si pas déjà installé)
apt-get install -y git

# Installer Nginx (pour reverse proxy)
apt-get install -y nginx

# Installer les outils de build nécessaires
apt-get install -y build-essential
```

#### 4.3 Cloner le repository (première fois)

```bash
cd /var/www
git clone https://github.com/theunknown2025/Zaytoonz_NGO.git zaytoonz-ngo
cd zaytoonz-ngo
```

#### 4.4 Installer les dépendances

```bash
npm install
```

#### 4.5 Configurer les variables d'environnement pour Next.js

```bash
nano .env.local
```

Ajoutez ces variables (appuyez sur `Ctrl+X`, puis `Y`, puis `Entrée` pour sauvegarder):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key-here

# NextAuth Configuration
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://168.231.87.171:3000

# Python Scraper Configuration (pour que Next.js communique avec le scraper)
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=true

# Environment
NODE_ENV=production
```

**Note:** Le `NEXTAUTH_SECRET` sera généré automatiquement. Si vous voulez le générer maintenant:
```bash
openssl rand -base64 32
```
Copiez la valeur générée et remplacez `$(openssl rand -base64 32)` dans le fichier.

#### 4.6 Configurer le Scraper Python

Le scraper Python est un service API séparé qui doit être configuré avant de construire Next.js.

```bash
# Aller dans le dossier du scraper
cd /var/www/zaytoonz-ngo/app/admin/Scrape_Master

# Créer un environnement virtuel Python
python3 -m venv venv

# Activer l'environnement virtuel
source venv/bin/activate

# Installer les dépendances Python
pip install -r requirements.txt

# Installer les navigateurs Playwright (nécessaire pour le scraping)
playwright install

# Créer le fichier .env pour le scraper Python
nano .env
```

Ajoutez ces variables dans le `.env` du scraper:

```env
# Supabase Configuration
SUPABASE_URL=http://localhost:8000
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE

# OpenAI API Key (pour les modèles AI)
OPENAI_API_KEY=your-openai-api-key-here

# Autres clés API (optionnelles)
GEMINI_API_KEY=votre_clé_gemini
DEEPSEEK_API_KEY=votre_clé_deepseek
```

Sauvegarder (`Ctrl+X`, `Y`, `Entrée`), puis:

```bash
# Désactiver l'environnement virtuel (on l'utilisera avec PM2)
deactivate

# Retourner à la racine du projet
cd /var/www/zaytoonz-ngo
```

#### 4.7 Construire l'application Next.js

**Important:** Le build Next.js exclut automatiquement le dossier `venv` grâce à la configuration dans `next.config.js`. Vous ne devriez pas avoir d'erreurs liées aux fichiers Python.

```bash
# S'assurer d'être à la racine du projet
cd /var/www/zaytoonz-ngo

# Construire l'application
npm run build
```

Si vous voyez des erreurs liées au dossier `venv`, c'est que la configuration n'est pas correcte. Vérifiez que `next.config.js` contient bien les exclusions.

#### 4.8 Démarrer les services avec PM2

Vous devez démarrer **deux services**:
1. **Python Scraper** (port 8000)
2. **Next.js App** (port 3000)

**Option A: Démarrer manuellement (Simple)**

```bash
# 1. Démarrer le scraper Python
cd /var/www/zaytoonz-ngo/app/admin/Scrape_Master
pm2 start venv/bin/uvicorn --name "python-scraper" -- \
  api_wrapper:app --host 0.0.0.0 --port 8000

# 2. Démarrer l'application Next.js
cd /var/www/zaytoonz-ngo
pm2 start npm --name "zaytoonz-ngo" -- start

# 3. Sauvegarder la configuration PM2
pm2 save

# 4. Configurer PM2 pour démarrer au boot
pm2 startup
# Suivez les instructions affichées (généralement copier-coller la commande)
```

**Option B: Utiliser un fichier PM2 Ecosystem (Recommandé)**

Créez un fichier de configuration PM2 pour gérer les deux services facilement:

```bash
cd /var/www/zaytoonz-ngo
nano ecosystem.config.js
```

Ajoutez ce contenu:

```javascript
module.exports = {
  apps: [
    {
      name: 'python-scraper',
      script: 'venv/bin/uvicorn',
      args: 'api_wrapper:app --host 0.0.0.0 --port 8000',
      cwd: '/var/www/zaytoonz-ngo/app/admin/Scrape_Master',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/var/log/pm2/python-scraper-error.log',
      out_file: '/var/log/pm2/python-scraper-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
    },
    {
      name: 'zaytoonz-ngo',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/zaytoonz-ngo',
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/var/log/pm2/zaytoonz-ngo-error.log',
      out_file: '/var/log/pm2/zaytoonz-ngo-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '2G',
    },
  ],
};
```

Sauvegarder (`Ctrl+X`, `Y`, `Entrée`), puis:

```bash
# Créer le dossier pour les logs
mkdir -p /var/log/pm2

# Démarrer les deux services avec le fichier ecosystem
pm2 start ecosystem.config.js

# Sauvegarder la configuration
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup
# Suivez les instructions affichées
```

**Avantages du fichier ecosystem:**
- ✅ Gestion centralisée des deux services
- ✅ Configuration facile à modifier
- ✅ Logs organisés
- ✅ Redémarrage automatique en cas de crash
- ✅ Limite de mémoire configurable

#### 4.9 Vérifier que les deux services tournent

```bash
# Vérifier le statut de tous les services
pm2 status

# Vous devriez voir:
# - python-scraper (port 8000)
# - zaytoonz-ngo (port 3000)

# Tester le scraper Python
curl http://localhost:8000/health

# Tester Next.js
curl http://localhost:3000
```

### Méthode 2: Déploiement avec Archive (Alternative)

#### 4.1 Transférer l'archive au VPS

Depuis PowerShell (dans le dossier du projet):

```powershell
# Si vous avez créé deploy.tar.gz
scp deploy.tar.gz root@168.231.87.171:/tmp/

# Ou si vous avez créé deploy.zip
scp deploy.zip root@168.231.87.171:/tmp/
```

#### 4.2 Se connecter au VPS

```powershell
ssh root@168.231.87.171
```

#### 4.3 Extraire et déployer

```bash
# Créer le dossier de l'application
mkdir -p /var/www/zaytoonz-ngo
cd /var/www/zaytoonz-ngo

# Extraire l'archive
tar -xzf /tmp/deploy.tar.gz
# OU si c'est un .zip:
# apt-get install -y unzip
# unzip /tmp/deploy.zip

# Installer les dépendances
npm install --production

# Construire l'application
npm run build

# Redémarrer avec PM2
pm2 restart zaytoonz-ngo || pm2 start npm --name "zaytoonz-ngo" -- start
pm2 save
```

## 🔄 Étape 5: Mises à jour futures (Méthode Git)

Pour mettre à jour l'application après des changements:

```powershell
# 1. Sur votre machine locale: pousser les changements
git add .
git commit -m "Update description"
git push origin main

# 2. Se connecter au VPS
ssh root@168.231.87.171

# 3. Mettre à jour le code
cd /var/www/zaytoonz-ngo
git pull origin main

# 4. Mettre à jour les dépendances Node.js (si package.json a changé)
npm install

# 5. Mettre à jour les dépendances Python (si requirements.txt a changé)
cd app/admin/Scrape_Master
source venv/bin/activate
pip install -r requirements.txt
deactivate
cd /var/www/zaytoonz-ngo

# 6. Reconstruire Next.js
npm run build

# 7. Redémarrer les deux services
pm2 restart python-scraper
pm2 restart zaytoonz-ngo
```

### Mise à jour rapide (si seulement le code a changé):

```bash
cd /var/www/zaytoonz-ngo
git pull origin main
npm run build
pm2 restart zaytoonz-ngo
```

## 🌐 Étape 6: Configurer Nginx (Optionnel mais Recommandé)

Pour accéder à votre application via le port 80 (HTTP) au lieu du port 3000:

```bash
# Se connecter au VPS
ssh root@168.231.87.171

# Créer la configuration Nginx
nano /etc/nginx/sites-available/zaytoonz-ngo
```

Ajoutez ce contenu:

```nginx
server {
    listen 80;
    server_name 168.231.87.171 srv1182909.hstgr.cloud;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Sauvegarder (`Ctrl+X`, `Y`, `Entrée`), puis:

```bash
# Activer le site
ln -s /etc/nginx/sites-available/zaytoonz-ngo /etc/nginx/sites-enabled/

# Tester la configuration
nginx -t

# Redémarrer Nginx
systemctl restart nginx
```

Maintenant votre application sera accessible sur `http://168.231.87.171` au lieu de `http://168.231.87.171:3000`

## ✅ Vérifier le déploiement

### Vérifier que les deux services tournent:

```bash
# Se connecter au VPS
ssh root@168.231.87.171

# Vérifier le statut PM2 (devrait montrer les 2 services)
pm2 status

# Voir les logs de Next.js
pm2 logs zaytoonz-ngo

# Voir les logs du scraper Python
pm2 logs python-scraper

# Vérifier que le port 3000 écoute (Next.js)
netstat -tulpn | grep 3000

# Vérifier que le port 8000 écoute (Python Scraper)
netstat -tulpn | grep 8000
```

### Tester les services:

```bash
# Tester le scraper Python
curl http://localhost:8000/health
# Devrait retourner: {"status":"ok"}

# Tester l'API du scraper
curl -X POST http://localhost:8000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "fields": ["title"]}'

# Tester Next.js
curl http://localhost:3000
```

### Tester depuis votre navigateur:

- **Next.js:** `http://168.231.87.171:3000` (sans Nginx) ou `http://168.231.87.171` (avec Nginx)
- **Python Scraper API:** `http://168.231.87.171:8000/health` (si le port est ouvert)
- **Documentation API:** `http://168.231.87.171:8000/docs` (FastAPI Swagger UI)

## 🛠️ Commandes utiles

### Gérer les services avec PM2:

```bash
# Voir le statut de tous les services
pm2 status

# Voir les logs de Next.js
pm2 logs zaytoonz-ngo

# Voir les logs du scraper Python
pm2 logs python-scraper

# Voir les logs des deux services
pm2 logs

# Redémarrer Next.js
pm2 restart zaytoonz-ngo

# Redémarrer le scraper Python
pm2 restart python-scraper

# Redémarrer tous les services
pm2 restart all

# Arrêter un service
pm2 stop zaytoonz-ngo
pm2 stop python-scraper

# Supprimer un service
pm2 delete zaytoonz-ngo
pm2 delete python-scraper

# Surveiller les ressources en temps réel
pm2 monit
```

### Vérifier les ressources:

```bash
htop                    # Moniteur de ressources
df -h                   # Espace disque
free -h                 # Mémoire
```

## 🔒 Sécurité

### Configurer le pare-feu:

```bash
# Installer UFW
apt-get install -y ufw

# Autoriser SSH, HTTP, HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Activer le pare-feu
ufw enable
```

### Utiliser des clés SSH (au lieu de mot de passe):

1. **Générer une clé SSH sur Windows:**

```powershell
ssh-keygen -t rsa -b 4096
# Appuyez sur Entrée pour accepter l'emplacement par défaut
# Entrez un mot de passe (optionnel mais recommandé)
```

2. **Copier la clé publique sur le VPS:**

```powershell
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh root@168.231.87.171 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

3. **Tester la connexion sans mot de passe:**

```powershell
ssh root@168.231.87.171
```

## 🐛 Dépannage

### L'application ne démarre pas:

```bash
# Vérifier les logs
pm2 logs zaytoonz-ngo --lines 50

# Vérifier les variables d'environnement
cat .env.local

# Vérifier que le port 3000 est libre
netstat -tulpn | grep 3000
```

### Erreur de build:

```bash
# Nettoyer et réinstaller
rm -rf .next node_modules
npm install
npm run build
```

**Si vous voyez des erreurs liées au dossier `venv` ou aux fichiers Python:**

Le dossier `venv` est automatiquement exclu du build grâce à `next.config.js`. Si vous avez encore des erreurs:

1. Vérifiez que `next.config.js` contient bien les exclusions
2. Assurez-vous que le dossier `venv` n'est pas dans le repository Git (vérifiez `.gitignore`)
3. Si nécessaire, supprimez temporairement le dossier venv avant le build (il sera recréé sur le serveur):
   ```bash
   rm -rf app/admin/Scrape_Master/venv
   npm run build
   ```

### Le scraper Python ne démarre pas:

```bash
# Vérifier les logs
pm2 logs python-scraper --lines 50

# Vérifier que Python est installé
python3 --version

# Vérifier que l'environnement virtuel existe
ls -la app/admin/Scrape_Master/venv/

# Tester manuellement
cd app/admin/Scrape_Master
source venv/bin/activate
python -m uvicorn api_wrapper:app --host 0.0.0.0 --port 8000
```

### Next.js ne peut pas se connecter au scraper:

1. Vérifier que le scraper tourne: `pm2 status`
2. Vérifier que le port 8000 écoute: `netstat -tulpn | grep 8000`
3. Vérifier l'URL dans `.env.local`: `NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000`
4. Tester l'API directement: `curl http://localhost:8000/health`
5. Vérifier les logs Next.js: `pm2 logs zaytoonz-ngo`

### Impossible de se connecter en SSH:

1. Vérifier que l'IP est correcte
2. Vérifier les paramètres de pare-feu sur Hostinger
3. Vérifier que le service SSH tourne: `systemctl status ssh`

## 📝 Résumé des étapes rapides

### Déploiement initial complet:

```bash
# Sur le VPS (première fois)
ssh root@168.231.87.171
cd /var/www/zaytoonz-ngo
git pull origin main
npm install

# Configurer le scraper Python
cd app/admin/Scrape_Master
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install
# Créer .env avec les variables d'environnement
deactivate
cd /var/www/zaytoonz-ngo

# Configurer Next.js
# Créer .env.local avec les variables d'environnement

# Build et démarrer
npm run build
pm2 start venv/bin/uvicorn --name "python-scraper" --cwd /var/www/zaytoonz-ngo/app/admin/Scrape_Master -- api_wrapper:app --host 0.0.0.0 --port 8000
pm2 start npm --name "zaytoonz-ngo" --cwd /var/www/zaytoonz-ngo -- start
pm2 save
pm2 startup
```

### Mise à jour rapide (si tout est déjà configuré):

```powershell
# 1. Pousser les changements
git push origin main

# 2. Se connecter et déployer
ssh root@168.231.87.171 "cd /var/www/zaytoonz-ngo && git pull origin main && npm install && npm run build && pm2 restart all"
```

## 🎯 Architecture du déploiement

```
┌─────────────────────────────────────────────────────────┐
│                    Hostinger VPS                        │
│                                                         │
│  ┌──────────────────┐         ┌──────────────────┐    │
│  │   Next.js App    │  HTTP   │ Python Scraper   │    │
│  │   Port 3000      │ ──────> │   Port 8000      │    │
│  │   (PM2)          │         │   (PM2)          │    │
│  └──────────────────┘         └──────────────────┘    │
│         │                              │                │
│         └──────────┬───────────────────┘                │
│                    │                                    │
│            ┌───────▼────────┐                           │
│            │   Supabase     │                           │
│            │  (Port 8000)   │                           │
│            └────────────────┘                           │
│                                                         │
│  ┌──────────────────────────────────────────────┐      │
│  │            Nginx (Port 80)                  │      │
│  │  Reverse Proxy → Next.js (Port 3000)        │      │
│  └──────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

## ✅ Checklist de déploiement

### Prérequis:
- [ ] Accès SSH au VPS configuré
- [ ] Repository Git poussé sur GitHub
- [ ] Variables d'environnement préparées

### Sur le VPS:
- [ ] Node.js 20+ installé
- [ ] Python 3.11+ installé
- [ ] PM2 installé globalement
- [ ] Git installé
- [ ] Nginx installé (optionnel)

### Configuration:
- [ ] Repository cloné dans `/var/www/zaytoonz-ngo`
- [ ] Dépendances Node.js installées (`npm install`)
- [ ] Environnement virtuel Python créé
- [ ] Dépendances Python installées (`pip install -r requirements.txt`)
- [ ] Playwright browsers installés
- [ ] Variables d'environnement Next.js configurées (`.env.local`)
- [ ] Variables d'environnement Python configurées (`app/admin/Scrape_Master/.env`)

### Build et Démarrage:
- [ ] Build Next.js réussi (`npm run build`)
- [ ] Scraper Python démarré avec PM2
- [ ] Next.js démarré avec PM2
- [ ] PM2 configuré pour démarrer au boot

### Vérification:
- [ ] `pm2 status` montre les 2 services actifs
- [ ] `curl http://localhost:8000/health` retourne OK
- [ ] `curl http://localhost:3000` fonctionne
- [ ] Application accessible depuis le navigateur

C'est tout! 🎉

