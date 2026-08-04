# Painel REM — começar agora (Windows)
# Uso: .\deploy\start-now.ps1
#   ou: powershell -ExecutionPolicy Bypass -File .\deploy\start-now.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location -Path $Root

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "Node/npm nao encontrado. Instale Node 20+ e abra de novo o terminal."
  exit 1
}

Write-Host "Painel REM → http://localhost:3000"
Write-Host "Ctrl+C para parar."
Write-Host ""

npm start
