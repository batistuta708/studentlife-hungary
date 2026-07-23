# StudentLife Hungary — Phase 1: Architecture & Folder Structure

This document explains the architectural decisions behind the scaffold. No business logic
has been written yet — this is the skeleton the rest of the phases will fill in.

## 1. Monorepo layout

```
studentlife-hungary/
├── frontend/          Next.js 15 (App Router) — SSR/SSG, SEO, UI
├── backend/           Node.js + Express — REST API, auth, business logic
├── docs/              Architecture notes, ER diagrams, API docs (filled in later phases)
├── .github/workflows/ CI/CD pipelines
├── docker-compose.yml Local dev: frontend + backend + mongo
└── README.md
```

**Why separate frontend/backend repos-in-one-monorepo, instead of Next.js API routes for
everything?**
- The backend needs to be deployed independently to Render (per your spec), while the
  frontend deploys to Vercel — a single Express service is easier to reason about, test,
  rate-limit, and scale independently of the frontend's serverless functions.
- Keeping REST APIs in Express also makes Playwright/Supertest integration testing cleaner,
  and avoids Vercel's serverless function cold-start/timeout limits for heavier operations
  (image uploads, newsletter sends, admin bulk actions).
- Next.js still uses Route Handlers for things that *must* live at the edge/close to
  rendering: `sitemap.xml`, `robots.txt`, and OG image generation (see `app/api/`).

## 2. Frontend structure (`frontend/src`)

```
app/
├── (public routes)         about/, blog/, jobs/, accommodation/, universities/,
│                            scholarships/, visa-guide/, residence-permit/,
│                            healthcare/, transportation/, hungarian-language/,
│                            cost-of-living/, faq/, contact/, privacy-policy/, terms/
├── (auth)/                 login, register, forgot-password, reset-password
│                            — route group, no auth guard, own layout (centered card)
├── (dashboard)/dashboard/  profile, bookmarks, saved-*, settings
│                            — route group, protected by middleware, sidebar layout
├── (admin)/admin/          users, articles, jobs, accommodation, universities,
│                            categories, comments, listings, newsletter, analytics
│                            — route group, protected + role-gated, admin layout
└── api/                    sitemap, robots, og — Next.js Route Handlers only

components/
├── ui/          Buttons, Cards, Inputs, Modals — design-system primitives (shadcn-style)
├── layout/      Header, Footer, Navbar, Sidebar
├── blog/        PostCard, CommentSection, ShareButtons, RelatedPosts, ReadingTime
├── jobs/ accommodation/ universities/   Domain-specific listing/detail components
├── forms/       Reusable RHF + Zod form building blocks
├── admin/       Data tables, dashboard charts, approval widgets
├── seo/         JsonLd, Breadcrumbs, MetaTags helpers
└── animations/  Framer Motion wrappers (page transitions, reveal-on-scroll)

lib/
├── api/         Typed fetch/axios client per resource (jobs.ts, blog.ts, auth.ts...)
├── auth/        Token handling, session helpers, route guards
├── validators/  Zod schemas shared between forms and (mirrored) backend validation
├── hooks/       useAuth, useBookmarks, useDebounce, etc.
├── seo/         generateMetadata helpers, sitemap builder, structured-data builders
└── constants/   Enums, nav config, category lists

store/           Zustand stores (auth, theme, filters)
types/           Shared TypeScript types/interfaces (mirrors backend Mongoose schemas)
```

**Key decisions:**
- **App Router + Route Groups** (`(auth)`, `(dashboard)`, `(admin)`) so each area gets its
  own layout without polluting the URL path — `/login` not `/auth/login`.
- **Server Components by default**, Client Components only where interactivity is required
  (forms, bookmarld buttons, dark mode toggle) — keeps Core Web Vitals and SEO strong,
  since content-heavy pages (blog, listings) render on the server.
- **Zustand over Redux** — the client state surface here (auth session, theme, filter UI
  state) is small; Zustand avoids boilerplate while staying easy to test.
- **Zod schemas shared conceptually with backend** — form validation on the frontend
  mirrors `express-validator` rules on the backend, so invalid data never reaches the API,
  but the API never trusts the client either (defense in depth).

## 3. Backend structure (`backend/src`)

```
config/        db.js (Mongo connection), cloudinary.js, passport/google.js, logger.js
models/        User, Article, Category, Job, Accommodation, University, Scholarship,
               Comment, Bookmark, Newsletter, Analytics  (Mongoose schemas — Phase 2)
routes/v1/     One router file per resource, mounted under /api/v1
controllers/   Route handlers — thin, delegate to services
services/      Business logic (e.g. slug generation, email sending, image processing)
middlewares/   auth.js (JWT verify), role.js (RBAC), error.js, rateLimiter.js,
               validate.js (express-validator result handler)
validators/    express-validator chains per resource
utils/         ApiResponse, ApiError, asyncHandler, pagination helpers
jobs/          Scheduled tasks (e.g. newsletter digest, listing expiry)
```

**Key decisions:**
- **Layered architecture** (routes → controllers → services → models) so business logic
  isn't trapped inside route handlers — makes unit testing services possible without
  spinning up Express/Supertest for every test.
- **`/api/v1` versioning from day one** — painless to introduce `/v2` later without
  breaking the deployed frontend.
- **Centralized error handling** via a single `middlewares/error.js` + custom `ApiError`
  class, so every controller can just `throw new ApiError(404, "Job not found")` and the
  response shape stays consistent across the whole API.
- **RBAC via middleware, not per-route ad hoc checks** — `role.js` will accept an array of
  allowed roles (`['admin']`, `['admin','editor']`) so Admin Dashboard endpoints are
  declarative: `router.delete('/:id', auth, role(['admin']), controller.remove)`.

## 4. Database

MongoDB Atlas, accessed via Mongoose. Full schema design (fields, indexes, relationships,
validation) is **Phase 2** — this phase only reserves the collections your spec listed:
`Users, Articles, Categories, Jobs, Accommodation, Universities, Scholarships, Comments,
Bookmarks, Newsletter, Analytics`.

## 5. DevOps scaffold included in this phase

- **`docker-compose.yml`** — spins up `frontend`, `backend`, and a local `mongo` container
  for development parity, so nobody needs a live Atlas connection just to run the app
  locally.
- **`backend/Dockerfile`** — single-stage Node 20 Alpine image (backend has no build step).
- **`frontend/Dockerfile`** — multi-stage build (deps → build → runner) to keep the final
  image small and avoid shipping devDependencies.
- **`.github/workflows/ci.yml`** — a minimal placeholder pipeline (install → lint → test /
  build) for both packages, so CI is green from the first real commit. This will be
  expanded in **Phase 9** with deployment steps to Vercel/Render.

## 6. What's intentionally NOT in this phase

No Mongoose schemas, no Express routes/controllers, no React components, no auth logic,
no styling. Phase 1 is structure only, so you can review the shape of the project before
any implementation is written.

## Next: Phase 2 — MongoDB Schema

Will cover: field-level design for all 11 collections, relationships (refs vs
embedding), indexes (including text indexes for search), validation rules, and a
data-flow diagram showing how collections relate (e.g. Bookmarks → User/Article/Job/
Accommodation as a polymorphic reference).

---
Reply "approved" (or with changes you'd like) to proceed to Phase 2.
#   s t u d e n t l i f e - h u n g a r y  
 