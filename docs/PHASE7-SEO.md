# Phase 7 — SEO

Site-wide SEO infrastructure, built on top of the per-page `generateMetadata()` pattern
already established in Phase 5's blog detail page.

## What's implemented

| Requirement | Where | Notes |
|---|---|---|
| Dynamic Meta Tags | `generateMetadata()` in every detail page | Blog (Phase 5) + Jobs (this phase) — same pattern applies to Accommodation/Universities/Scholarships |
| Open Graph | `app/layout.tsx` (defaults) + per-page `openGraph` in `generateMetadata()` | |
| Twitter Cards | Root layout default (`summary_large_image`) + per-page override on the blog page | |
| Canonical URLs | `alternates: { canonical: ... }` on every dynamic page | Prevents duplicate-content penalties if a page is ever reachable via more than one URL |
| XML Sitemap | `app/sitemap.ts` | Native Next.js convention — auto-served at `/sitemap.xml`. Combines static routes with live-fetched slugs from Articles/Jobs/Accommodation/Universities/Scholarships. Fails soft: if the API is unreachable at build time, ships static routes rather than breaking the build |
| robots.txt | `app/robots.ts` | Native convention, auto-served at `/robots.txt`. Disallows `/dashboard`, `/admin`, `/api`, and auth-token pages (`/reset-password`, `/verify-email`) — session-gated anyway, but excluding them saves crawl budget |
| Structured Data | `lib/seo/structuredData.ts` | `Organization` + `WebSite` (site-wide, root layout), `Article` (blog), `JobPosting` (jobs — this is a **rich-result-eligible** schema type; correctly-marked-up job postings can appear in Google's dedicated Jobs search UI), `BreadcrumbList` |
| Breadcrumbs | `components/seo/Breadcrumbs.tsx` | Renders the visible trail **and** its JSON-LD from the same data — a common SEO bug is visible breadcrumbs drifting out of sync with their structured data; this makes that impossible by construction |
| Optimized Images | `next/image` everywhere (Phase 5) + Cloudinary `quality:auto,fetch_format:auto` (Phase 6) | Two-layer optimization: Next.js resizes/lazy-loads, Cloudinary serves the best format per-browser |
| Lazy Loading | `next/image` default behavior | Images below the fold load lazily automatically; `priority` is set only on the blog cover image (largest above-the-fold element, matters for LCP) |
| SEO Friendly URLs / Automatic Slug Generation | Backend, Phase 2 | `slugify` in `pre("validate")` hooks on every content model |
| Internal Linking | Breadcrumbs + related articles (`article.relatedArticles`) + footer sitemap columns (Phase 5) | |
| 404 Page | `app/not-found.tsx` | Branded, with links back into the site rather than a dead end — helps retain traffic that hits a broken/removed link |

## Why native Next.js conventions over hand-rolled routes

`app/sitemap.ts` and `app/robots.ts` are Next.js App Router file conventions — the
framework generates the correct `Content-Type`, handles the XML/text serialization, and
serves them at the right well-known URLs automatically. This is why the original
`app/api/sitemap/` and `app/api/robots/` placeholder folders from Phase 1's scaffold
were removed this phase — they'd have meant hand-building what Next.js already does
correctly, and having both would create two conflicting sitemaps.

## Core Web Vitals — what's already in place vs. what needs a live audit

Already contributing to good scores from earlier phases:
- Server Components by default (Phase 5) — most content ships as HTML, not
  client-side-rendered JS, which is the single biggest lever for LCP/FCP
- `next/image` automatic resizing, modern formats, and lazy loading
- ISR (`revalidate`) on list pages — served from cache, not re-fetched per-request
- `compression` middleware on the backend (Phase 3)
- Minimal client-side JS islands (like buttons, comment form) rather than whole-page
  hydration

**What I can't verify without a live deployment**: actual Lighthouse scores. Core Web
Vitals depend on real network conditions, a real database with real content, and a
deployed environment — not something a static code review can confirm. Once you have
this deployed (Phase 9), running Lighthouse against the live site is the real test; if
scores come back below 90 in any category, send me the report and I'll fix the specific
regressions it flags.

## Still to do in later phases

Rolling `generateMetadata()` + `Breadcrumbs` + relevant structured data out to the
remaining detail pages (Accommodation, Universities, Scholarships) once those pages
themselves are built, following the exact pattern in `app/jobs/[slug]/page.tsx`.

---
Reply "approved" to proceed to Phase 8: Testing.
