# ============================================================
#  stop-server.ps1  —  Arrête le serveur Diarradis
# ============================================================

$PID_FILE = "$PSScriptRoot\.server.pid"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DIARRADIS  —  Arrêt du serveur      " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $PID_FILE)) {
    Write-Host "⚠  Aucun serveur en cours d'exécution trouvé." -ForegroundColor Yellow
    Write-Host "   (fichier .server.pid introuvable)" -ForegroundColor DarkGray
    Write-Host ""

    # Essayer quand même de tuer les processus node/vite
    Write-Host "🔍 Recherche de processus node et vite à tuer..." -ForegroundColor Cyan
    $nodeProcs = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcs) {
        $nodeProcs | ForEach-Object {
            Write-Host "   ⛔ Arrêt node PID $($_.Id)" -ForegroundColor Red
            Stop-Process -Id $_.Id -Force
        }
    } else {
        Write-Host "   Aucun processus node trouvé." -ForegroundColor DarkGray
    }
    Write-Host ""
    exit 0
}

$pids = (Get-Content $PID_FILE) -split ","
$backendPid  = $pids[0]
$frontendPid = $pids[1]

# Arrêter le backend
if ($backendPid) {
    $proc = Get-Process -Id $backendPid -ErrorAction SilentlyContinue
    if ($proc) {
        Write-Host "⛔ Arrêt backend  (PID: $backendPid)..." -ForegroundColor Red
        Stop-Process -Id $backendPid -Force
    } else {
        Write-Host "   Backend  (PID: $backendPid) déjà arrêté." -ForegroundColor DarkGray
    }
}

# Arrêter le frontend (et ses enfants node)
if ($frontendPid) {
    $proc = Get-Process -Id $frontendPid -ErrorAction SilentlyContinue
    if ($proc) {
        Write-Host "⛔ Arrêt frontend (PID: $frontendPid)..." -ForegroundColor Red
        # Tuer l'arbre de processus (cmd + node enfant)
        taskkill /PID $frontendPid /T /F 2>$null | Out-Null
    } else {
        Write-Host "   Frontend (PID: $frontendPid) déjà arrêté." -ForegroundColor DarkGray
    }
}

# Nettoyer le fichier PID
Remove-Item $PID_FILE -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ Serveur arrêté avec succès." -ForegroundColor Green
Write-Host ""
