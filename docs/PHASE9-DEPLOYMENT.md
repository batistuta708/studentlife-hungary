# Phase 9 — Deployment

This phase produces everything needed to deploy — configs, a database seed script, and
a CI/CD pipeline — but the actual deployment (creating accounts, clicking "Deploy",
connecting a domain) has to happen on your end, with your own credentials. I don't have
network access or accounts on Vercel/Render/MongoDB Atlas/Cloudinary/a domain registrar
from this environment, so I can't perform those steps myself. Everything below is
written so you can follow it directly.

## What's in this phase

- `frontend/vercel.json` — Vercel build/header configuration
- `backend/render.yaml` — a Render Blueprint (lets Render provision the service from
  this file instead of manual dashboard clicking)
- `backend/scripts/seed.js` (+ `npm run seed` / `npm run seed:reset`) — populates
  sample Users, Categories, Articles, Jobs, Accommodation, Universities, and
  Scholarships, so a fresh deployment isn't an empty shell
- `.github/workflows/ci.yml` — extended with an optional deploy-gate job (see below)

## 1. MongoDB Atlas (production cluster)

You already did this for local development — production is the same cluster, just
used for real:

1. In your existing Atlas project (or a new one for production separation), confirm
   your free (M0) cluster is set up.
2. **Network Access** → add `0.0.0.0/0` (allow from anywhere) — Render's outbound IPs
   aren't static on the free plan, so this is the practical option for a free-tier
   deployment. This is a real security tradeoff worth knowing: it means the DB accepts
   connection attempts from any IP, relying entirely on the username/password for
   protection. Use a strong, unique database password (which you should already have,
   having rotated it earlier in this project) and never reuse it elsewhere.
3. Copy the connection string — this becomes `MONGODB_URI` in Render's environment
   variables, **not** committed anywhere in the repo.
4. Once the backend is deployed and connected, run the seed script **against
   production** from your local machine (point your local `.env`'s `MONGODB_URI` at
   the production connection string temporarily, or run it from Render's shell):
   ```bash
   npm run seed
   ```
   This is intentionally a manual step, not part of the deploy pipeline — auto-seeding
   on every deploy would silently overwrite real data down the line.

## 2. Cloudinary

1. Create a free Cloudinary account.
2. From the dashboard, copy `Cloud Name`, `API Key`, and `API Secret` — these become
   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in Render.
3. Nothing else to configure — the upload endpoint (Phase 6) already sets
   `quality: auto, fetch_format: auto` on every upload, so optimization is automatic
   from the first image uploaded through the admin dashboard.

## 3. Backend → Render

1. Push this repo to GitHub (see "GitHub" section below if you haven't yet).
2. In Render: **New +** → **Blueprint** → connect your GitHub repo → Render reads
   `backend/render.yaml` automatically and proposes the service.
3. Render will prompt for every environment variable marked `sync: false` in
   `render.yaml` — paste in your real values (`MONGODB_URI`, Cloudinary keys, SMTP
   credentials if you have them, and `CLIENT_URL` — see the chicken-and-egg note
   below). `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `COOKIE_SECRET` are marked
   `generateValue: true`, so Render generates strong random values for you
   automatically — you never need to invent these yourself.
4. Deploy. Render builds with `npm install` and starts with `npm start`, and checks
   `/health` to confirm the service came up cleanly.
5. **`CLIENT_URL` chicken-and-egg**: this needs your *frontend's* URL, but you won't
   have that until you deploy the frontend in the next step. Deploy the backend first
   with a placeholder (or your eventual custom domain, if you already know it), then
   come back and update it once the frontend is live — Render redeploys automatically
   whenever you change an environment variable.

## 4. Frontend → Vercel

1. In Vercel: **Add New** → **Project** → import the same GitHub repo.
2. Set the **Root Directory** to `frontend` (Vercel needs to know the Next.js app
   isn't at the repo root, since this is a monorepo).
3. Framework preset should auto-detect as Next.js and pick up `frontend/vercel.json`
   automatically.
4. Environment variables (from `frontend/.env.local.example`):
   - `NEXT_PUBLIC_API_URL` → your Render backend URL + `/api/v1`, e.g.
     `https://studentlife-hungary-api.onrender.com/api/v1`
   - `NEXT_PUBLIC_SITE_URL` → your Vercel URL (update again once the custom domain is live)
   - `NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`,
     `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` as applicable
5. Deploy. Then go back to Render and update `CLIENT_URL` to this Vercel URL — this is
   what makes CORS actually work in production (see Phase 3's `app.js`, which locks
   CORS to exactly this value).

## 5. Custom domain (studentlifehungary.com)

1. **In Vercel**: Project → Settings → Domains → add `studentlifehungary.com` and
   `www.studentlifehungary.com`.
2. **DNS configuration** (at your domain registrar, wherever you bought the domain):
   Vercel will show you the exact records to add — typically:
   - An `A` record for the root domain (`@`) pointing to Vercel's IP
   - A `CNAME` record for `www` pointing to `cname.vercel-dns.com`
   (Exact values are shown live in Vercel's dashboard since they can change — use
   what Vercel displays at setup time, not values copied from elsewhere.)
3. **Redirect www → root** (or the reverse, your call): in Vercel's domain settings,
   set one as the primary and the other as a redirect target — Vercel handles the
   redirect automatically once both are added, no code changes needed.
4. **Force HTTPS**: Vercel provisions and renews SSL certificates automatically for
   any domain added this way, and redirects HTTP → HTTPS by default. Nothing to
   configure.
5. Once the custom domain is live, do one more round of updates:
   - Vercel env var `NEXT_PUBLIC_SITE_URL` → `https://studentlifehungary.com`
   - Render env var `CLIENT_URL` → `https://studentlifehungary.com`
   - Both platforms redeploy automatically when you change an env var.

## 6. GitHub + CI/CD

1. If this repo isn't on GitHub yet: create a new repository, then from the project
   root:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/studentlife-hungary.git
   git push -u origin main
   ```
2. **Automatic redeploy on push to main** — this is the part of your requirements
   worth being precise about, because there are two valid ways to get it, and this
   project sets up both:
   - **Native git integration (recommended, zero config)**: once you connect the
     GitHub repo in Vercel and Render's dashboards (steps 3–4 above), both platforms
     watch the connected branch and redeploy automatically on every push — no GitHub
     Actions involved at all. This is simpler and is what most teams actually use.
   - **CI-gated deploys (optional, more control)**: `.github/workflows/ci.yml`
     includes a `deploy` job that runs *only* after both the backend and frontend
     test suites pass on `main`, and pings each platform's **deploy hook** URL (a
     unique POST-to-trigger link — find it in Render under Settings → Deploy Hook,
     and in Vercel under Settings → Git → Deploy Hooks). To use this instead of (or
     alongside) native auto-deploy, add `RENDER_DEPLOY_HOOK_URL` and
     `VERCEL_DEPLOY_HOOK_URL` as repository secrets (Settings → Secrets and
     variables → Actions). If you don't set these secrets, that job step is skipped
     harmlessly — native git integration alone is enough to satisfy "every push to
     main redeploys automatically."

## Production checklist — status

| Item | Status |
|---|---|
| Remove development settings | `NODE_ENV=production` set in `render.yaml`; rate limiter, error stack traces, and logging all branch on this (Phases 3–8) |
| Minify assets | Automatic — Next.js production builds and Vercel both minify by default |
| Enable caching | ISR (`revalidate`) on list pages (Phase 5/7), immutable cache headers on static assets (`vercel.json`), ETags via Express default |
| Generate sitemap.xml / robots.txt | Done, Phase 7 |
| Verify SEO | Structured data, meta tags, canonical URLs done (Phase 7) — a live Search Console submission is a post-launch step you'd do yourself, no code involved |
| Test all API endpoints / auth / uploads | Done via automated tests, Phase 8 (and manually verified end-to-end by you during that phase) |
| Test mobile responsiveness | Automated via Playwright's mobile-Safari project, Phase 8 |
| Lighthouse audits ≥ 90 | **Not yet verified** — needs a live deployed URL; see note below |

### On the Lighthouse requirement specifically

I can't produce real Lighthouse scores without a deployed, publicly reachable site —
they depend on actual network latency, a real CDN, and real database content, none of
which exist in a code sandbox. Once you have a live URL (even the `.vercel.app` one,
before the custom domain), run Lighthouse yourself (Chrome DevTools → Lighthouse tab,
or `npx lighthouse <url> --view`) and send me the report. Given the groundwork already
in place (Server Components, ISR, optimized images, minimal client JS), I'd expect
Performance and Best Practices to score well out of the gate — Accessibility and SEO
are more likely to need a couple of targeted fixes I can make once I see actual
numbers instead of guessing at them.

---
Reply "approved" to proceed to Phase 10: Production Optimization.
