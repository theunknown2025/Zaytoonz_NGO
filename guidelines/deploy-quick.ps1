# ================================================================
# Script de déploiement rapide pour Hostinger VPS
# Utilise Git pour déployer automatiquement
# ================================================================

param(
    [string]$VPS_IP = "168.231.87.171",
    [string]$VPS_USER = "root",
    [string]$APP_DIR = "/var/www/zaytoonz-ngo"
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🚀 Déploiement rapide vers Hostinger VPS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon dossier
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: package.json introuvable. Exécutez ce script depuis la racine du projet." -ForegroundColor Red
    exit 1
}

# Vérifier que Git est configuré
Write-Host "📦 Vérification de Git..." -ForegroundColor Blue
$gitStatus = git status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur: Git n'est pas configuré ou le dossier n'est pas un dépôt Git." -ForegroundColor Red
    exit 1
}

# Vérifier s'il y a des changements non commités
$hasChanges = git diff --quiet
if (-not $hasChanges) {
    Write-Host "⚠️  Il y a des changements non commités." -ForegroundColor Yellow
    $commit = Read-Host "Voulez-vous les commiter maintenant? (o/n)"
    if ($commit -eq "o" -or $commit -eq "O") {
        $message = Read-Host "Message de commit"
        if ([string]::IsNullOrWhiteSpace($message)) {
            $message = "Deployment update"
        }
        git add .
        git commit -m $message
        Write-Host "✓ Changements commités" -ForegroundColor Green
    }
}

# Pousser vers GitHub
Write-Host ""
Write-Host "📤 Envoi vers GitHub..." -ForegroundColor Blue
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'envoi vers GitHub." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Code poussé vers GitHub" -ForegroundColor Green

# Déployer sur le VPS
Write-Host ""
Write-Host "🚀 Déploiement sur le VPS..." -ForegroundColor Blue
Write-Host "   IP: $VPS_IP" -ForegroundColor Gray
Write-Host "   Utilisateur: $VPS_USER" -ForegroundColor Gray
Write-Host ""

# Commande SSH pour déployer
$deployCommand = @"
cd $APP_DIR && \
git pull origin main && \
npm install && \
npm run build && \
pm2 restart zaytoonz-ngo || pm2 start npm --name 'zaytoonz-ngo' -- start && \
pm2 save
"@

Write-Host "Exécution de la commande de déploiement..." -ForegroundColor Yellow
ssh "$VPS_USER@$VPS_IP" $deployCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "✅ Déploiement réussi!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Votre application est maintenant disponible sur:" -ForegroundColor Green
    Write-Host "  http://$VPS_IP:3000" -ForegroundColor White
    Write-Host ""
    Write-Host "Pour voir les logs:" -ForegroundColor Yellow
    Write-Host "  ssh $VPS_USER@$VPS_IP 'pm2 logs zaytoonz-ngo'" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors du déploiement." -ForegroundColor Red
    Write-Host "Vérifiez les logs ci-dessus pour plus de détails." -ForegroundColor Yellow
    exit 1
}

