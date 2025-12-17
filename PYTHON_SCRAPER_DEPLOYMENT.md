# 🐍 Déploiement du Scraper Python sur Hostinger VPS

## ✅ Réponse courte: OUI, le scraper Python fonctionnera!

Le scraper Python est un **service API indépendant** qui tourne séparément de Next.js. Il fonctionnera parfaitement après le déploiement.

## 🔄 Comment ça fonctionne

```
┌─────────────────┐         HTTP Request          ┌──────────────────┐
│   Next.js App   │ ───────────────────────────> │  Python Scraper  │
│   (Port 3000)   │                               │   (Port 8000)    │
└─────────────────┘                               └──────────────────┘
```

1. **Next.js** fait des appels HTTP à `http://localhost:8000/api/scrape`
2. **Python Scraper** traite la requête et retourne les données
3. Les deux services tournent **indépendamment**

## 🚀 Configuration sur le serveur Hostinger

### Étape 1: Exclure le dossier venv du build Next.js

Le dossier `venv` ne doit PAS être inclus dans le build Next.js. Il est déjà configuré dans `next.config.js`, mais assurez-vous qu'il est aussi dans `.gitignore`:

```bash
# Ajouter au .gitignore (si pas déjà fait)
echo "**/venv/**" >> .gitignore
echo "**/__pycache__/**" >> .gitignore
```

### Étape 2: Déployer le code sur le VPS

```bash
# Se connecter au VPS
ssh root@168.231.87.171

# Aller dans le dossier de l'application
cd /var/www/zaytoonz-ngo

# Pull les dernières modifications
git pull origin main
```

### Étape 3: Configurer l'environnement Python

```bash
# Installer Python 3.11+ et pip
apt-get update
apt-get install -y python3 python3-pip python3-venv

# Aller dans le dossier du scraper
cd /var/www/zaytoonz-ngo/app/admin/Scrape_Master
# OU si le scraper est dans Scrape_Master à la racine:
# cd /var/www/zaytoonz-ngo/Scrape_Master

# Créer un environnement virtuel (si pas déjà fait)
python3 -m venv venv

# Activer l'environnement virtuel
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Installer Playwright browsers
playwright install
```

### Étape 4: Configurer les variables d'environnement

```bash
# Créer un fichier .env pour le scraper Python
nano .env
```

Ajoutez:

```env
SUPABASE_URL=http://localhost:8000
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE

# Clés API pour les modèles AI (ajoutez les vôtres)
OPENAI_API_KEY=your-openai-api-key-here
GEMINI_API_KEY=votre_clé_gemini
DEEPSEEK_API_KEY=votre_clé_deepseek
```

### Étape 5: Démarrer le scraper Python avec PM2

```bash
# Installer PM2 globalement (si pas déjà fait)
npm install -g pm2

# Aller dans le dossier du scraper
cd /var/www/zaytoonz-ngo/app/admin/Scrape_Master
# OU: cd /var/www/zaytoonz-ngo/Scrape_Master

# Activer l'environnement virtuel et démarrer avec PM2
pm2 start venv/bin/uvicorn --name "python-scraper" -- api_wrapper:app --host 0.0.0.0 --port 8000

# OU utiliser un script de démarrage
pm2 start ecosystem.config.js  # Si vous créez ce fichier

# Sauvegarder la configuration PM2
pm2 save
pm2 startup  # Suivez les instructions pour démarrer au boot
```

### Étape 6: Configurer Next.js pour utiliser le scraper

Dans `/var/www/zaytoonz-ngo/.env.local`:

```env
NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true
NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000
NEXT_PUBLIC_FALLBACK_TO_LOCAL=true
```

### Étape 7: Vérifier que tout fonctionne

```bash
# Vérifier que le scraper Python tourne
pm2 status
pm2 logs python-scraper

# Tester l'API du scraper
curl http://localhost:8000/health

# Vérifier que Next.js tourne
pm2 status
pm2 logs zaytoonz-ngo

# Tester depuis l'extérieur (si le port 8000 est ouvert)
curl http://168.231.87.171:8000/health
```

## 📋 Fichier PM2 Ecosystem (Optionnel mais Recommandé)

Créez `/var/www/zaytoonz-ngo/app/admin/Scrape_Master/ecosystem.config.js`:

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
  ],
};
```

Puis démarrez avec:

```bash
pm2 start ecosystem.config.js
pm2 save
```

## 🔄 Mises à jour futures

### Mettre à jour le scraper Python:

```bash
ssh root@168.231.87.171
cd /var/www/zaytoonz-ngo/app/admin/Scrape_Master
source venv/bin/activate
git pull origin main  # Si le code est dans le repo
pip install -r requirements.txt  # Si requirements.txt a changé
pm2 restart python-scraper
```

### Mettre à jour Next.js:

```bash
ssh root@168.231.87.171
cd /var/www/zaytoonz-ngo
git pull origin main
npm install
npm run build
pm2 restart zaytoonz-ngo
```

## 🐛 Dépannage

### Le scraper Python ne démarre pas:

```bash
# Vérifier les logs
pm2 logs python-scraper --lines 50

# Vérifier que Python est installé
python3 --version

# Vérifier que l'environnement virtuel existe
ls -la venv/

# Tester manuellement
cd /var/www/zaytoonz-ngo/app/admin/Scrape_Master
source venv/bin/activate
python -m uvicorn api_wrapper:app --host 0.0.0.0 --port 8000
```

### Next.js ne peut pas se connecter au scraper:

1. Vérifier que le scraper tourne: `pm2 status`
2. Vérifier que le port 8000 écoute: `netstat -tulpn | grep 8000`
3. Vérifier l'URL dans `.env.local`: `NEXT_PUBLIC_EXTERNAL_SCRAPER_URL=http://localhost:8000`
4. Vérifier les logs Next.js: `pm2 logs zaytoonz-ngo`

### Erreur de build Next.js avec venv:

Le dossier `venv` est maintenant exclu du build. Si vous avez encore des erreurs:

```bash
# Supprimer le dossier venv du build (il sera recréé sur le serveur)
rm -rf app/admin/Scrape_Master/venv

# Ou l'ajouter au .gitignore et ne pas le commiter
echo "app/admin/Scrape_Master/venv/" >> .gitignore
```

## ✅ Checklist de déploiement

- [ ] Python 3.11+ installé sur le VPS
- [ ] Environnement virtuel créé et dépendances installées
- [ ] Variables d'environnement configurées (.env)
- [ ] Scraper Python démarré avec PM2
- [ ] Next.js configuré pour utiliser le scraper (NEXT_PUBLIC_USE_EXTERNAL_SCRAPER=true)
- [ ] Les deux services tournent (pm2 status)
- [ ] Test de santé du scraper réussi (curl http://localhost:8000/health)
- [ ] Test d'intégration depuis l'interface admin

## 🎯 Résumé

**OUI, le scraper Python fonctionnera après `npm run build`** car:

1. ✅ C'est un service séparé qui tourne sur le port 8000
2. ✅ Next.js fait juste des appels HTTP à ce service
3. ✅ Le dossier `venv` est exclu du build Next.js
4. ✅ Les deux services sont gérés indépendamment avec PM2

Le build Next.js ne touche pas au scraper Python! 🎉

