# Deploying PakOption on Ubuntu 24.04 (ARM64 or x86_64)

PakOption is a Next.js 15 app backed by PostgreSQL on the same machine. Serve it with `next start` on `127.0.0.1:3000` behind nginx. Do not use `output: "export"`: the app has Route Handlers, sessions, and uploads.

No paid database, auth provider, or payment gateway is required.

## 1. Packages

```bash
sudo apt-get update
sudo apt-get install -y nginx postgresql postgresql-contrib curl
# Node.js 20+ for linux-arm64 or linux-x64 from https://nodejs.org
node -v
uname -m
```

## 2. Postgres

```bash
sudo -u postgres psql <<'SQL'
CREATE ROLE pakoption LOGIN PASSWORD 'choose-a-password';
CREATE DATABASE pakoption OWNER pakoption;
SQL
```

The role does not need to be a superuser. `prisma migrate dev` on a laptop needs `CREATEDB` for its shadow database. Production uses `prisma migrate deploy`, which does not.

## 3. App checkout

```bash
sudo mkdir -p /opt/pakoption /var/lib/pakoption/uploads /var/www/pakoption-verify
sudo chown -R "$USER":"$USER" /opt/pakoption /var/lib/pakoption/uploads
cd /opt/pakoption
git clone <repo> .
git checkout <release>
```

Copy the search-console files into `/var/www/pakoption-verify/` (outside the app):

- `google*.html`
- `BingSiteAuth.xml`
- `ff82568606a8e2966f050af9a9ada4a1.txt`

nginx serves those with exact-match (or a google-html regex) locations before the proxy. See `docs/deploy/nginx-pakoption.conf`.

## 4. Environment

```bash
sudo cp .env.example /etc/pakoption.env
sudo chmod 600 /etc/pakoption.env
sudoedit /etc/pakoption.env
```

Required:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres URL for the app |
| `DIRECT_URL` | Same URL, used by Prisma migrations |
| `NEXT_PUBLIC_SITE_URL` | `https://pakoption.induswebagency.com` — set before `next build` |
| `AUTH_SECRET` | Signs nothing by itself; keep it set for future cookie hardening |
| `CRON_SECRET` | Bearer token for `/api/cron/close-auctions` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | First admin created by the seed |
| `UPLOAD_DIR` | `/var/lib/pakoption/uploads` |

Optional: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`. If `SMTP_HOST` is empty, registration still works and mail is skipped.

Also symlink the env into the app so `next build` and Prisma can see it:

```bash
ln -sf /etc/pakoption.env /opt/pakoption/.env
```

## 5. Build and migrate

```bash
cd /opt/pakoption
npm ci
set -a && . /etc/pakoption.env && set +a
npx prisma migrate deploy
npm run db:seed          # admin user only
# SEED_DEMO=1 npm run db:seed   # also load sample cars
npm run build
```

`NEXT_PUBLIC_SITE_URL` is inlined at build time. Rebuild if the domain changes.

## 6. systemd

```bash
sudo cp docs/deploy/pakoption.service /etc/systemd/system/pakoption.service
sudo cp docs/deploy/pakoption-cron.service /etc/systemd/system/pakoption-cron.service
sudo cp docs/deploy/pakoption-cron.timer /etc/systemd/system/pakoption-cron.timer
sudo systemctl daemon-reload
sudo systemctl enable --now pakoption
sudo systemctl enable --now pakoption-cron.timer
```

The web unit runs `npm run start -- -H 127.0.0.1 -p 3000` as `ubuntu` with `EnvironmentFile=/etc/pakoption.env`. The timer calls the close-auctions route every minute.

If Node is not at `/usr/bin/npm`, change `ExecStart` to the absolute `node` binary:

```bash
/usr/bin/node node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3000
```

## 7. nginx

```bash
sudo cp docs/deploy/nginx-pakoption.conf /etc/nginx/sites-available/pakoption
sudo ln -sf /etc/nginx/sites-available/pakoption /etc/nginx/sites-enabled/pakoption
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d pakoption.induswebagency.com
```

`/uploads/` is aliased to `/var/lib/pakoption/uploads`. The verification filenames are not proxied to Next.js.

## 8. Checks

```bash
curl -fsS http://127.0.0.1:3000/ | grep -o '<h1[^>]*>.*</h1>'
curl -fsS -H "Authorization: Bearer $CRON_SECRET" http://127.0.0.1:3000/api/cron/close-auctions
curl -fsS http://127.0.0.1:3000/robots.txt | head
curl -fsS http://127.0.0.1:3000/sitemap.xml | head
```

## 9. Tests

```bash
createdb pakoption_test   # or use the CI service in .github/workflows/test.yml
DATABASE_URL=postgresql://pakoption:PASSWORD@127.0.0.1:5432/pakoption_test \
DIRECT_URL=postgresql://pakoption:PASSWORD@127.0.0.1:5432/pakoption_test \
  npx prisma migrate deploy
DATABASE_URL=postgresql://pakoption:PASSWORD@127.0.0.1:5432/pakoption_test \
DIRECT_URL=postgresql://pakoption:PASSWORD@127.0.0.1:5432/pakoption_test \
  npm test
```

`npm test` covers registration, a rejected login, listing creation, approval, a persisted bid, a rejected self-bid, and auction close when the reserve is not met.

## What is intentionally not wired

Google sign-in, SMS OTP, card payments, and Supabase are not used. Email is local SMTP. Payments are bank transfer or cash, marked by an admin. Phone and CNIC tiers are set by an admin. Live bidder counts on the old marketing pages are not shown.
