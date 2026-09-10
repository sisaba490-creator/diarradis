# ============================================================
#  server.ps1  —  Menu interactif Diarradis
# ============================================================

$PID_FILE = "$PSScriptRoot\.server.pid"

function Show-Status {
    if (Test-Path $PID_FILE) {
        $pids   = (Get-Content $PID_FILE) -split ","
        $bPid   = $pids[0]
        $fPid   = $pids[1]
        $bAlive = Get-Process -Id $bPid -ErrorAction SilentlyContinue
        $fAlive = Get-Process -Id $fPid -ErrorAction SilentlyContinue

        if ($bAlive -and $fAlive) {
            Write-Host "  Statut : " -NoNewline
            Write-Host "EN COURS" -ForegroundColor Green -NoNewline
            Write-Host "  (backend PID $bPid | frontend PID $fPid)"
            return "running"
        }
    }
    Write-Host "  Statut : " -NoNewline
    Write-Host "ARRÊTÉ" -ForegroundColor Red
    return "stopped"
}

while ($true) {
    Clear-Host
    Write-Host ""
    Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║       DIARRADIS  —  Serveur          ║" -ForegroundColor Cyan
    Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    $status = Show-Status
    Write-Host ""
    Write-Host "  [1]  ▶  Démarrer le serveur" -ForegroundColor Green
    Write-Host "  [2]  ⛔  Arrêter  le serveur" -ForegroundColor Red
    Write-Host "  [3]  🔄  Redémarrer le serveur" -ForegroundColor Yellow
    Write-Host "  [4]  📋  Voir les logs backend" -ForegroundColor Cyan
    Write-Host "  [Q]  Quitter" -ForegroundColor DarkGray
    Write-Host ""
    $choice = Read-Host "  Votre choix"

    switch ($choice.ToUpper()) {
        "1" {
            & "$PSScriptRoot\start-server.ps1"
            Read-Host "`n  Appuyez sur Entrée pour continuer"
        }
        "2" {
            & "$PSScriptRoot\stop-server.ps1"
            Read-Host "`n  Appuyez sur Entrée pour continuer"
        }
        "3" {
            Write-Host "`n  🔄 Redémarrage..." -ForegroundColor Yellow
            & "$PSScriptRoot\stop-server.ps1"
            Start-Sleep -Seconds 2
            & "$PSScriptRoot\start-server.ps1"
            Read-Host "`n  Appuyez sur Entrée pour continuer"
        }
        "4" {
            $logFile = "$PSScriptRoot\.server.log"
            if (Test-Path $logFile) {
                Write-Host ""
                Write-Host "  ── Dernières lignes du log backend ──" -ForegroundColor Cyan
                Get-Content $logFile -Tail 30
                Write-Host ""
            } else {
                Write-Host "  Aucun fichier de log trouvé." -ForegroundColor Yellow
            }
            Read-Host "`n  Appuyez sur Entrée pour continuer"
        }
        "Q" {
            Write-Host ""
            Write-Host "  Au revoir !" -ForegroundColor Cyan
            Write-Host ""
            exit 0
        }
        default {
            Write-Host "`n  ⚠ Choix invalide." -ForegroundColor Yellow
            Start-Sleep -Seconds 1
        }
    }
}
