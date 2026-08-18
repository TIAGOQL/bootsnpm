# Deploy local fácil (Windows)
# Uso:  .\deploy\facil.ps1
#   ou: npm run facil

$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host ""
Write-Host "BudGanja — deploy fácil (local, sem Netlify)" -ForegroundColor Cyan
Write-Host ""

node (Join-Path $Root "scripts\deploy-facil.js")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
