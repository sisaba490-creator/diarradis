# ============================================================
#  start-server.ps1  —  Démarre le serveur Diarradis
# ============================================================

$PID_FILE = "$PSScriptRoot\.server.pid"
$LOG_FILE = "$PSScriptRoot\.server.log"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   DIARRADIS  —  Démarrage du serveur  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si le serveur tourne déjà
if (Test-Path $PID_FILE) {
    $oldPid = Get-Content $PID_FILE
    $running = Get-Process -Id $oldPid -ErrorAction SilentlyContinue
    if ($running) {
        Write-Host "⚠  Le serveur est déjà en cours d'exécution (PID: $oldPid)" -ForegroundColor Yellow
        Write-Host "   Utilisez stop-server.ps1 pour l'arrêter d'abord." -ForegroundColor Yellow
        Write-Host ""
        exit 1
    } else {
        Remove-Item $PID_FILE -Force
    }
}

# Aller dans le dossier du projet
Set-Location $PSScriptRoot

Write-Host "▶  Démarrage du backend  (node server/server.js)..." -ForegroundColor Green
$backendJob = Start-Process -FilePath "node" `
    -ArgumentList "server/server.js" `
    -WorkingDirectory $PSScriptRoot `
    -RedirectStandardOutput $LOG_FILE `
    -RedirectStandardError  "$PSScriptRoot\.server-error.log" `
    -PassThru `
    -WindowStyle Hidden

Start-Sleep -Milliseconds 1000

Write-Host "▶  Démarrage du frontend (vite — port 5176)..." -ForegroundColor Green
$frontendJob = Start-Process -FilePath "cmd" `
    -ArgumentList "/c npm run dev:front" `
    -WorkingDirectory $PSScriptRoot `
    -PassThru

# Sauvegarder les PIDs
"$($backendJob.Id),$($frontendJob.Id)" | Set-Content $PID_FILE

Write-Host ""
Write-Host "✅ Serveur démarré !" -ForegroundColor Green
Write-Host ""
Write-Host "   Backend  → http://localhost:3002" -ForegroundColor White
Write-Host "   Frontend → http://localhost:5176" -ForegroundColor White
Write-Host ""
Write-Host "   PID backend  : $($backendJob.Id)" -ForegroundColor DarkGray
Write-Host "   PID frontend : $($frontendJob.Id)" -ForegroundColor DarkGray
Write-Host "   Logs backend : $LOG_FILE" -ForegroundColor DarkGray
Write-Host ""
Write-Host "   Pour arrêter : .\stop-server.ps1" -ForegroundColor Yellow
Write-Host ""
