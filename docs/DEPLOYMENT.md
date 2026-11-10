# Deploying PakOption on Ubuntu ARM64

PakOption is a Next.js 15 App Router app. Serve it with `next start` behind nginx. Do not use `output: "export"`.

A static export cannot host this app. It has Route Handlers (`/api/auctions`, `/api/bids`, `/api/search/suggest`, `/api/cron/close-auctions`, `/api/stats`, `/llms.txt`, `/llms-full.txt`), `revalidate` on listing pages, and response headers from `next.config.ts`.

The process listens on `127.0.0.1:3000`. nginx terminates TLS and proxies to that port. No database is required for the site to boot.

## What runs without a backend

Pages read a built-in dataset in `src/lib/db/seed-data.ts` through `src/lib/db/repository.ts`. Cars on `/auctions` and `/buy` are that demo dataset, not a live inventory.

`prisma/schema.prisma` and `prisma/seed.ts` are in the repo. The repository does not import Prisma. Setting `DATABASE_URL` does not switch page reads to Postgres, and `POST /api/bids` runs the auction engine without storing the bid. Auth screens exist; no session provider is connected. Photo upload in the sell wizard stays in the browser.

You do not need Postgres, Supabase, or an auth provider to serve the public site.

## Host

- Ubuntu, `aarch64` / ARM64
- Node.js 20 or newer (the `linux-arm64` build)
- nginx
- systemd

Check the machine:

```bash
uname -m          # aarch64
node -v           # v20+ 
```

## Environment

`NEXT_PUBLIC_*` values are inlined at **build** time. Set the site URL before `npm run build`, then build again if the domain changes.

| Variable | Required to boot | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | No. Defaults to `https://pakoption.induswebagency.com` | Canonical URL, sitemap, robots, Open Graph, JSON-LD, `llms.txt` |
| `DATABASE_URL` | No | Not read by the page data layer today |
| `DIRECT_URL` | No | Intended for a future `prisma migrate` |
| `AUTH_SECRET`, `AUTH_URL`, Google client | No | Auth.js is not wired |
| `NEXT_PUBLIC_SUPABASE_URL`, Supabase keys | No | Storage and realtime are not wired |
| `CRON_SECRET` | No | Only if you call `/api/cron/close-auctions` |
| `RESEND_API_KEY`, `SMS_PROVIDER_KEY` | No | Notifications are not wired |

Copy the example and set the public URL:

```bash
cp .env.example .env
# Edit NEXT_PUBLIC_SITE_URL. Leave DATABASE_URL unset.
```

`.env.example` documents every variable. For this VPS, the file you actually need is:

```bash
NEXT_PUBLIC_SITE_URL=https://pakoption.induswebagency.com
```

## Build (ARM64)

From the repository root, as the user that will run the service:

```bash
cd /opt/pakoption
npm ci
NEXT_PUBLIC_SITE_URL=https://pakoption.induswebagency.com npm run build
```

`npm ci` runs `prisma generate`. On ARM64, Prisma downloads the `linux-arm64` query engine. That step needs outbound network access during install. The running site does not open a database connection.

## Run

```bash
NEXT_PUBLIC_SITE_URL=https://pakoption.induswebagency.com \
  npx next start -H 127.0.0.1 -p 3000
```

Confirm:

```bash
curl -sI http://127.0.0.1:3000/ | head
curl -s http://127.0.0.1:3000/ | grep -o '<h1[^>]*>.*</h1>'
curl -s http://127.0.0.1:3000/robots.txt
curl -s http://127.0.0.1:3000/sitemap.xml | head
curl -s http://127.0.0.1:3000/llms.txt | head
```

## systemd

`docs/deploy/pakoption.service` is the unit. Install it as root:

```bash
sudo cp docs/deploy/pakoption.service /etc/systemd/system/pakoption.service
sudo systemctl daemon-reload
sudo systemctl enable --now pakoption
sudo systemctl status pakoption
```

The unit expects the repo at `/opt/pakoption` and Node on the `ubuntu` user's `PATH` via a login shell is **not** used. `ExecStart` calls `/usr/bin/npm`. If Node lives elsewhere, change `ExecStart` to the absolute `node` path:

```bash
/usr/bin/node node_modules/next/dist/bin/next start -H 127.0.0.1 -p 3000
```

Set `Environment=NEXT_PUBLIC_SITE_URL=...` in the unit as well. Because Next inlines `NEXT_PUBLIC_SITE_URL` at build time, the value in the unit must match the value used for `npm run build`.

## nginx

`docs/deploy/nginx-pakoption.conf` proxies `pakoption.induswebagency.com` to `127.0.0.1:3000`.

```bash
sudo cp docs/deploy/nginx-pakoption.conf /etc/nginx/sites-available/pakoption
sudo ln -s /etc/nginx/sites-available/pakoption /etc/nginx/sites-enabled/pakoption
sudo nginx -t && sudo systemctl reload nginx
```

Issue the certificate after DNS points at the VPS:

```bash
sudo certbot --nginx -d pakoption.induswebagency.com
```

The app is not a static file tree. Do not point nginx at `docs/` or `out/`. `docs/index.html` is an old static mock and is marked `noindex`.

## Smoke checks after TLS

- `https://pakoption.induswebagency.com/` has one `<h1>` and a canonical link to that origin
- `/robots.txt` allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended, and Bingbot, and disallows `/dashboard`, `/api/`, `/inspection/report/`, `/login`, and `/register`
- `/sitemap.xml` lists absolute URLs on `https://pakoption.induswebagency.com`
- `/llms.txt` and `/llms-full.txt` return `text/plain`
- `/opengraph-image` (or the image URL in the homepage `<meta property="og:image">`) is a 1200×630 PNG
