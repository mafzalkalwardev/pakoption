#!/usr/bin/env bash
# PakOption — create the GitHub repo, push, and deploy to Vercel
#
# Usage:
#   bash scripts/deploy.sh
#   REPO_NAME=pakoption VISIBILITY=--private bash scripts/deploy.sh
#
# Requires:
#   GitHub CLI   https://cli.github.com     then: gh auth login
#   Vercel CLI   npm i -g vercel            then: vercel login

set -euo pipefail

REPO_NAME="${REPO_NAME:-pakoption}"
VISIBILITY="${VISIBILITY:---public}"
SKIP_VERCEL="${SKIP_VERCEL:-0}"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
step() { echo -e "\n${GREEN}==> $1${NC}"; }
warn() { echo -e "  ${YELLOW}! $1${NC}"; }
info() { echo "  $1"; }

cd "$(dirname "$0")/.."

step "Checking prerequisites"
command -v git >/dev/null 2>&1 || { warn "git not found"; exit 1; }
info "git ok"

if ! command -v gh >/dev/null 2>&1; then
  warn "GitHub CLI not found. Install from https://cli.github.com, then: gh auth login"
  exit 1
fi
info "gh ok"

if ! gh auth status >/dev/null 2>&1; then
  warn "Not signed in to GitHub. Run: gh auth login"
  exit 1
fi
info "GitHub authenticated"

step "Preparing the git repository"
if [ ! -d .git ]; then
  git init -b main >/dev/null
  info "Initialised a new repository on branch main"
else
  info "Repository already initialised"
  git branch -M main
fi

git add -A
if [ -n "$(git status --porcelain)" ]; then
  git commit -m "PakOption: inspection-backed car auction marketplace" >/dev/null
  info "Committed working tree"
else
  info "Nothing new to commit"
fi

step "Creating the GitHub repository"
if git remote get-url origin >/dev/null 2>&1; then
  info "Remote 'origin' already set to $(git remote get-url origin)"
  git push -u origin main
else
  gh repo create "$REPO_NAME" "$VISIBILITY" --source=. --remote=origin --push \
    --description "Pakistan's inspection-backed car auction marketplace — Next.js 15, Tailwind v4, Framer Motion, GSAP, Prisma"
fi

REPO_URL=$(gh repo view --json url -q .url)
echo -e "  ${CYAN}Repository: ${REPO_URL}${NC}"

if [ "$SKIP_VERCEL" = "1" ]; then
  echo -e "\n${YELLOW}Skipping Vercel deploy (SKIP_VERCEL=1).${NC}"
  exit 0
fi

step "Deploying to Vercel"
if ! command -v vercel >/dev/null 2>&1; then
  warn "Vercel CLI not found. Install with:  npm i -g vercel"
  warn "Then:  vercel login  &&  vercel --prod"
  warn "Or import the repo at https://vercel.com/new — Next.js is auto-detected."
  exit 0
fi

vercel --prod --yes

echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN} Shipped.${NC}"
echo -e "${GREEN}================================================${NC}\n"
echo "  Repo:  $REPO_URL"
echo ""
echo "  Next, if you want real persistence:"
echo "    1. Create a Supabase project"
echo "    2. Add DATABASE_URL and DIRECT_URL in the Vercel dashboard"
echo "    3. npx prisma migrate deploy"
echo "    4. npm run db:seed"
echo ""
echo "  Until then the app runs on its built-in seed dataset, which is"
echo "  why this deploy worked with no configuration at all."
echo ""
