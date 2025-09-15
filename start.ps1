$ErrorActionPreference = 'SilentlyContinue'

# 1) Остановить все node-процессы (если заняли порт)
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2) Сервер
Write-Host "[start] Installing server deps..."
Push-Location server
npm install | Out-Null
Write-Host "[start] Starting API on http://localhost:4000"
Start-Process -WindowStyle Minimized -FilePath node -ArgumentList 'src/index.js' -WorkingDirectory (Get-Location)
Pop-Location

# Подождать порт 4000
for ($i=0; $i -lt 20; $i++) {
  $listening = (Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue)
  if ($listening) { break }
  Start-Sleep -Milliseconds 300
}

# 3) Клиент
Write-Host "[start] Installing client deps..."
Push-Location client
npm install | Out-Null
Write-Host "[start] Starting client on http://localhost:5173"
Start-Process -WindowStyle Minimized -FilePath npm -ArgumentList 'run','dev' -WorkingDirectory (Get-Location)
Pop-Location

# 4) Открыть браузер
Start-Sleep -Seconds 2
Start-Process 'http://localhost:5173'

Write-Host "[start] Done. API: http://localhost:4000  UI: http://localhost:5173"


