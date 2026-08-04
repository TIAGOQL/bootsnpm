# Painel REM — começar agora (Windows)
# Uso: clique com o botão direito → Executar com PowerShell
#   ou: powershell -ExecutionPolicy Bypass -File .\start-now.ps1

$ErrorActionPreference = "Stop"
Set-Location -Path $PSScriptRoot

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "Node/npm nao encontrado. Instale Node 20+ e abra de novo o terminal."
  exit 1
}

Write-Host "Painel REM → http://localhost:3000"
Write-Host "Ctrl+C para parar."
Write-Host ""

npm start
