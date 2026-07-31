#!/usr/bin/env bash
# PakOption — local setup
# Usage:  bash scripts/setup.sh

set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
step() { echo -e "\n${GREEN}==> $1${NC}"; }
warn() { echo -e "  ${YELLOW}! $1${NC}"; }

cd "$(dirname "$0")/.."

step "Checking Node.js"
if ! command -v node >/dev/null 2>&1; then
  warn "Node.js not found. Install Node 20+ from https://nodejs.org"
  exit 1
fi
NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
if [ "$NODE_MAJOR" -lt 20 ]; then
  warn "Node $(node -v) detected. Next.js 15 / React 19 need Node 20 or newer."
  exit 1
fi
echo "  Node $(node -v)"

step "Creating .env from .env.example (if missing)"
if [ ! -f .env ]; then
  cp .env.example .env
  echo "  Created .env — the app runs fine without filling it in."
  echo "  With no DATABASE_URL it uses the built-in seed dataset."
else
  echo "  .env already exists, leaving it alone."
fi

step "Installing dependencies"
npm install

step "Type-checking"
npm run typecheck

step "Building"
npm run build

echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN} Build succeeded.${NC}"
echo -e "${GREEN}================================================${NC}\n"
echo "  npm run dev             start the dev server on :3000"
echo "  bash scripts/deploy.sh  create the GitHub repo and deploy to Vercel"
echo ""
