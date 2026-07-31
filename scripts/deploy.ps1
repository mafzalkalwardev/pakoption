# PakOption — create the GitHub repo, push, and deploy to Vercel
#
# Usage:
#   .\scripts\deploy.ps1
#   .\scripts\deploy.ps1 -RepoName pakoption -Private
#
# Requires:
#   GitHub CLI   https://cli.github.com     then: gh auth login
#   Vercel CLI   npm i -g vercel            then: vercel login

param(
  [string]$RepoName = "pakoption",
  [switch]$Private,
  [switch]$SkipVercel
)

$ErrorActionPreference = "Stop"

function Step($msg) { Write-Host "`n==> $msg" -ForegroundColor Green }
function Warn($msg) { Write-Host "  ! $msg" -ForegroundColor Yellow }
function Info($msg) { Write-Host "  $msg" -ForegroundColor Gray }

Set-Location (Split-Path -Parent $PSScriptRoot)

# ---------------------------------------------------------------- preflight
Step "Checking prerequisites"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Warn "git not found. Install from https://git-scm.com"; exit 1
}
Info "git ok"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Warn "GitHub CLI not found. Install from https://cli.github.com, then run: gh auth login"
  exit 1
}
Info "gh ok"

gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  Warn "Not signed in to GitHub. Run: gh auth login"
  exit 1
}
Info "GitHub authenticated"

# ------------------------------------------------------------------ git
Step "Preparing the git repository"

if (-not (Test-Path ".git")) {
  git init -b main | Out-Null
  Info "Initialised a new repository on branch main"
} else {
  Info "Repository already initialised"
  git branch -M main
}

git add -A

$hasChanges = (git status --porcelain)
if ($hasChanges) {
  git commit -m "PakOption: inspection-backed car auction marketplace" | Out-Null
  Info "Committed working tree"
} else {
  Info "Nothing new to commit"
}

# --------------------------------------------------------------- github
Step "Creating the GitHub repository"

$visibility = if ($Private) { "--private" } else { "--public" }
$existingRemote = git remote get-url origin 2>$null

if ($existingRemote) {
  Info "Remote 'origin' already set to $existingRemote"
  git push -u origin main
} else {
  gh repo create $RepoName $visibility --source=. --remote=origin --push `
    --description "Pakistan's inspection-backed car auction marketplace — Next.js 15, Tailwind v4, Framer Motion, GSAP, Prisma"
  if ($LASTEXITCODE -ne 0) {
    Warn "Repo creation failed. If the name is taken, re-run with: -RepoName pakoption-app"
    exit 1
  }
}

$repoUrl = gh repo view --json url -q .url
Write-Host "  Repository: $repoUrl" -ForegroundColor Cyan

# --------------------------------------------------------------- vercel
if ($SkipVercel) {
  Write-Host "`nSkipping Vercel deploy (-SkipVercel)." -ForegroundColor Yellow
  exit 0
}

Step "Deploying to Vercel"

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
  Warn "Vercel CLI not found. Install it with:  npm i -g vercel"
  Warn "Then run:  vercel login  and  vercel --prod"
  Warn "Or import the repo at https://vercel.com/new — it will detect Next.js automatically."
  exit 0
}

Info "Building and deploying to production…"
vercel --prod --yes

Write-Host "`n================================================" -ForegroundColor Green
Write-Host " Shipped." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Repo:  $repoUrl"
Write-Host ""
Write-Host "  Next, if you want real persistence:"
Write-Host "    1. Create a Supabase project"
Write-Host "    2. Add DATABASE_URL and DIRECT_URL in the Vercel dashboard"
Write-Host "    3. npx prisma migrate deploy"
Write-Host "    4. npm run db:seed"
Write-Host ""
Write-Host "  Until then the app runs on its built-in seed dataset, which is"
Write-Host "  why this deploy worked with no configuration at all."
Write-Host ""
