# PakOption — local setup
# Usage:  .\scripts\setup.ps1

$ErrorActionPreference = "Stop"

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Green }
function Warn($msg) { Write-Host "  ! $msg" -ForegroundColor Yellow }

Set-Location (Split-Path -Parent $PSScriptRoot)

Step "Checking Node.js"
try {
  $nodeVersion = node -v
  $major = [int]($nodeVersion -replace '^v(\d+)\..*$', '$1')
  if ($major -lt 20) {
    Warn "Node $nodeVersion detected. Next.js 15 / React 19 need Node 20 or newer."
    Warn "Install from https://nodejs.org and re-run this script."
    exit 1
  }
  Write-Host "  Node $nodeVersion"
} catch {
  Warn "Node.js not found. Install Node 20+ from https://nodejs.org"
  exit 1
}

Step "Creating .env from .env.example (if missing)"
if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "  Created .env — the app runs fine without filling it in."
  Write-Host "  With no DATABASE_URL it uses the built-in seed dataset."
} else {
  Write-Host "  .env already exists, leaving it alone."
}

Step "Installing dependencies (this takes a minute or two)"
npm install

Step "Type-checking"
npm run typecheck
if ($LASTEXITCODE -ne 0) {
  Warn "Type errors found above. Fix them, then re-run this script."
  exit 1
}

Step "Building"
npm run build
if ($LASTEXITCODE -ne 0) {
  Warn "Build failed. The errors above are the place to start."
  exit 1
}

Write-Host "`n================================================" -ForegroundColor Green
Write-Host " Build succeeded." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  npm run dev            start the dev server on :3000"
Write-Host "  .\scripts\deploy.ps1   create the GitHub repo and deploy to Vercel"
Write-Host ""
