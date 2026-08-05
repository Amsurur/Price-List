# 10 — Deployment Guide: Moving Off Render Onto Your Own Server

This is the M5 hosting decision the Roadmap left open. It walks through, in order:
buying a domain, buying a server, backing up your data off Render, moving the app
over, and connecting the domain — written for someone doing this for the first time.

Nothing here has been done yet. This is the plan; we'll execute it step by step
whenever you're ready, one phase at a time.

---

## 0. The big picture

Right now: your app runs as services on Render, with a Render-managed Postgres
database holding everything — products, student codes, reservations, **and product
images** (stored as bytes directly in the `product_images` table, per
`.env.example` — there's no separate file storage to worry about migrating).

Where we're headed: one small VPS (virtual private server) that you rent monthly,
running your own Postgres + the API + the web app in Docker, sitting behind a
free HTTPS certificate, reachable at your own domain.

Order of operations (each is its own phase below):

1. Buy a domain
2. Buy a server (VPS)
3. Basic server setup (so it's not wide open to the internet)
4. Back up the database off Render
5. Get the code onto the server and containerize it
6. Restore the database on the server
7. Reverse proxy + free HTTPS (Caddy)
8. Point the domain at the server
9. Go live — test everything
10. Ongoing: backups, deploying future changes, monitoring

---

## 1. Buy a domain

**Recommendation: Namecheap.** Cheap, one dashboard for buying + managing DNS
(no need to juggle a second service), and simple UI for a first-timer.

Steps:

1. Go to Namecheap, search your desired name. A `.com` is the safest choice if
   available (~$10–15/yr); if not, `.store` or `.shop` reads naturally for this
   business (~$3–30/yr depending on promo — check the renewal price, not just
   year-one).
2. Buy it. Skip the upsells (WhoisGuard/privacy protection is usually free
   or cheap and worth keeping — it hides your personal info from public WHOIS
   lookups — but skip hosting, email, SSL add-ons; we don't need those from them).
3. You don't need to touch DNS yet — that's Phase 8, after the server exists.

---

## 2. Buy a server (VPS)

**Recommendation: Hetzner Cloud, CX22 plan** (~€4.59/mo, roughly $5).
For that price you get 2 vCPUs / 4 GB RAM / 40 GB disk — meaningfully more
headroom than competitors at the same price, which matters because you'll be
running Postgres + the API + the web app + a reverse proxy all on one machine.

(Alternative: DigitalOcean's $6/mo droplet has only 1 GB RAM, which is tight for
four services at once — you'd likely need a swap file to avoid crashes. Hetzner's
console is a little less polished than DigitalOcean's but is still straightforward,
and DigitalOcean's advantage — its huge library of beginner tutorials — matters
less because this guide already covers what you need.)

Steps:

1. Create a Hetzner Cloud account (hetzner.com/cloud).
2. **Before creating the server**, generate an SSH key on your Mac — this is
   how you'll log in securely, no password to type or leak:
   ```
   ssh-keygen -t ed25519 -C "your-email@example.com"
   ```
   Press Enter to accept the default file location, and set a passphrase (or
   leave blank). This creates `~/.ssh/id_ed25519` (private, never share) and
   `~/.ssh/id_ed25519.pub` (public, safe to share).
   Print the public key so you can copy it:
   ```
   cat ~/.ssh/id_ed25519.pub
   ```
3. In Hetzner: **New Server** →
   - Location: pick whichever is geographically closest to your students.
   - Image: **Ubuntu 24.04**.
   - Type: **CX22**.
   - SSH key: paste the public key from step 2 (there's an "Add SSH key" button).
   - Skip everything else (volumes, backups add-on — we'll do our own backups
     in Phase 10 for free).
4. Create it. Hetzner gives you a public IPv4 address — write it down, you'll
   use it constantly (e.g. `123.45.67.89`).
5. Test the connection:
   ```
   ssh root@123.45.67.89
   ```
   If it connects without asking for a password, the key worked.

---

## 3. Basic server setup

Doing this now avoids the server getting compromised the moment it's reachable.
Run these **on the server**, over the SSH session from step 2 above.

**a) Create a non-root user** (best practice — root should only be used rarely):
```
adduser deploy
usermod -aG sudo deploy
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
```
From now on, log in as `ssh deploy@123.45.67.89` instead of root.

**b) Firewall** — only allow SSH, HTTP, HTTPS:
```
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable
```

**c) Install Docker** (official convenience script — simplest reliable method):
```
curl -fsSL https://get.docker.com | sh
usermod -aG docker deploy
```
Log out and back in for the group change to apply. Verify with `docker --version`
and `docker compose version` (the compose *plugin* ships with this install, so
`docker compose` — no hyphen — works out of the box).

That's the whole server-hardening story for a small single-owner app — no need
for more than this at this scale.

---

## 4. Back up the database off Render

Because product images live *inside* Postgres (not on disk), **one `pg_dump` is
your entire backup** — products, codes, reservations, images, all of it.

1. In the Render dashboard → your Postgres instance → **Connect** tab → copy
   the **External Database URL** (starts with `postgres://...`). Render only
   shows this while the database is on a plan that allows external connections
   — free-tier Render Postgres instances expire after 30/90 days, so do this
   soon if you're on a free instance.
2. On your Mac (needs `postgresql` client tools — `brew install postgresql@18`
   if you don't have `pg_dump`; match the major version to what Render/Docker
   uses, which is 18 per your `docker-compose.yml`):
   ```
   pg_dump "postgres://<the External Database URL>" \
     --format=custom \
     --file=softclub_backup.dump
   ```
3. Confirm it worked: `ls -lh softclub_backup.dump` should show a real file
   size (not 0 bytes). Keep this file somewhere safe — it's your entire
   database until you restore it.

---

## 5. Get the code onto the server and containerize it

Your `docker-compose.yml` today only runs Postgres — the API and web app run
via `npm run dev` locally. For the server we want everything in Docker, so a
`docker compose up -d` is the entire deploy.

This means writing two small `Dockerfile`s (one for `apps/api`, one for
`apps/web`) plus a production compose file. **I haven't created these yet** —
say the word when you're at this phase and I'll add them to the repo for real
(they need to match your exact dependency versions and build scripts, which I
already checked: npm workspaces, `nest build` / `next build`, Node 20+). In
outline, they'll:

- Build each app in a multi-stage Dockerfile (install deps → build → slim
  runtime image).
- A `docker-compose.prod.yml` with four services: `postgres`, `api`, `web`,
  and `caddy` (the reverse proxy from Phase 7).
- Postgres's port stays internal to the Docker network — not exposed to the
  internet — since only `api` needs to reach it.

Once those files exist, getting the code onto the server is just:
```
git clone https://github.com/Amsurur/Price-List.git
cd Price-List
# create a production .env (see below) then:
docker compose -f docker-compose.prod.yml up -d --build
```

**Production `.env` differences from your local one:**
- `JWT_SECRET` — generate a fresh one on the server (`openssl rand -base64 32`),
  don't reuse the dev one.
- `ADMIN_PASSWORD_HASH` — generate a real production password's hash.
- `DB_PASSWORD` — a real random password, not `softclub`.
- `NEXT_PUBLIC_API_URL` → `https://api.yourdomain.com/api` (see Phase 7 for why
  it's a subdomain).
- `WEB_ORIGIN` → `https://yourdomain.com`.
- `DATABASE_URL` — internal Docker network address, e.g.
  `postgres://softclub:<password>@postgres:5432/softclub_store` — no `DB_SSL`
  needed since it's a private in-network connection, not Render's public one.

---

## 6. Restore the database on the server

Copy your backup file to the server and restore it into the new (empty)
Postgres container:

```
scp softclub_backup.dump deploy@123.45.67.89:~/
ssh deploy@123.45.67.89
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_restore -U softclub -d softclub_store --clean --if-exists < softclub_backup.dump
```

`--clean --if-exists` makes it safe to re-run if something goes wrong midway.
Afterwards, spot-check: log into the admin, confirm products (with images),
codes, and reservations all show up as expected.

---

## 7. Reverse proxy + free HTTPS (Caddy)

**Recommendation: Caddy**, not Nginx + Certbot. Caddy gets you automatic,
auto-renewing HTTPS certificates (via Let's Encrypt) with about 15 lines of
config and zero manual cert renewal — the right tradeoff for a solo operator
who doesn't want a recurring maintenance chore.

A `Caddyfile` this simple handles both the storefront and the API, each on
its own subdomain (simpler than routing both off one domain by path):

```
yourdomain.com {
    reverse_proxy web:3000
}

api.yourdomain.com {
    reverse_proxy api:3001
}
```

Caddy runs as a container too, added to `docker-compose.prod.yml`, listening
on ports 80/443, and automatically requests + renews certificates for both
domains the first time it starts — as long as DNS (next phase) already points
at this server, since Let's Encrypt verifies domain ownership over HTTP.

---

## 8. Point the domain at the server

Back in Namecheap, on your domain → **Advanced DNS** → add:

| Type | Host | Value | 
|---|---|---|
| A | `@` | `123.45.67.89` (your server IP) |
| A | `api` | `123.45.67.89` |
| CNAME (optional) | `www` | `yourdomain.com` |

DNS changes can take anywhere from a few minutes to a few hours to propagate
(rarely up to 24h). Check with:
```
dig yourdomain.com +short
```
Once it returns your server's IP, start the stack (Phase 5's `docker compose up`)
and Caddy will provision certificates automatically within seconds of the first
request.

---

## 9. Go live — test everything

- Visit `https://yourdomain.com` — storefront loads, browse products (images
  included), try a code, make a test reservation.
- Visit `https://yourdomain.com/admin` — log in, confirm the reservation from
  the test above shows up, confirm codes/products/dashboard stats look right.
- Check on a phone too — Definition of Done in `CLAUDE.md` requires mobile to
  work, not just desktop.
- Once confirmed, cancel/delete the Render services so you're not paying for
  (or relying on) both.

---

## 10. Ongoing: backups, updates, monitoring

**Backups going forward** (now that Render isn't doing this for you): a daily
cron job on the server dumping Postgres to a file, ideally copied off the
server itself (e.g. to a cheap object storage bucket, or even emailed/synced
somewhere) so a lost server doesn't mean lost data. We can wire this up as a
small script + cron entry when you're at this phase — flag it, don't let it
be forgotten, since Render was doing this invisibly before.

**Deploying future changes:** push to `main`, then on the server:
```
git pull && docker compose -f docker-compose.prod.yml up -d --build
```
(A GitHub Actions auto-deploy can come later if this gets tedious — not needed
for v1.)

**Monitoring:** at this scale, `docker compose ps` and `docker compose logs -f`
by hand is enough. No need for a monitoring stack for a single-owner shop app.

---

## What to do next

Nothing here has been executed. When you're ready to start, say so and we'll
go phase by phase — I'd suggest starting with Phase 1 (domain) and Phase 2
(server) since those just involve you clicking through provider sites, then
coming back here for Phase 3 onward where I can run commands with you over SSH.

---

## Executed 2026-08-05 — deviations from the plan above

Phases 3-6 and 9 were done on a VPS the user had already bought (IP
193.24.233.18), given directly with a root password rather than following
Phases 1-2 above. What actually happened, differences noted:

- **No domain/SSH key yet when given access** — connected once with the
  password, immediately created the `deploy` user, installed a fresh
  `~/.ssh/id_ed25519` key from this Mac, then disabled password auth
  (`PasswordAuthentication no`). The password given in chat should be
  rotated from the provider console — it was typed into a chat log.
- **No domain purchased yet** — serving over plain HTTP on the bare IP.
  Phase 7 (Caddy/HTTPS) and Phase 8 (DNS) are still pending; `COOKIE_SECURE`
  and the web/API origins need updating to `https://` once a domain exists
  (see `COOKIE_SECURE` env var in `.env.example`).
- **Routing differs from the Caddy-subdomain design**: instead of exposing
  the API on its own subdomain, `apps/web`'s existing `next.config.ts`
  rewrite (`/api/:path*` → the API origin) is used, with `NEXT_PUBLIC_API_URL`
  pointed at the **internal** Docker service (`http://api:3001/api`), not a
  public address — the API container isn't exposed to the host at all, only
  port 80 (web) is. Only works because all browser-side API calls already go
  through the relative `/api` path (confirmed in `apps/web/src/lib/api.ts`
  and `auth.ts`) and images render via `next/image` (server-side fetch, not
  a direct browser request to the API origin).
- **Data: fresh empty database, not a Render migration** — the user decided
  against migrating real data for this pass (Render's Postgres also had
  Access Control blocking external connections, which would've needed a
  dashboard change to unblock). `DB_SYNCHRONIZE=true` is set for this reason
  (no migrations exist in the repo) — **flip this to `false` before ever
  restoring real production data onto this server**, since synchronize can
  silently alter/drop columns if entities drift from a restored schema.
- **Daily backup cron** added at `~/backup-db.sh` (3am, `pg_dump --format=custom`
  to `~/backups/`, 7-day local rotation) — no offsite copy yet, same gap
  flagged in Phase 10 above.
- Admin credentials reused as-is from Render (`ADMIN_EMAIL`/
  `ADMIN_PASSWORD_HASH`), same `JWT_SECRET` too (given directly by the user).
