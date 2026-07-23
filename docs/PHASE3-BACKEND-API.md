# Phase 3 — Backend API

A full REST API layered on top of the Phase 2 models: `routes → controllers → services →
models`, versioned under `/api/v1`, with shared utilities for pagination/filtering/
search, consistent error handling, and rate limiting.

## Request lifecycle

```
Request
  → helmet / cors / body-parser / cookie-parser        (app.js)
  → mongo-sanitize / xss-clean / hpp                    (app.js — sanitization)
  → compression                                          (app.js)
  → morgan → winston logger                              (app.js)
  → /api rate limiter                                    (middlewares/rateLimiter.js)
  → route match                                          (routes/v1/*.routes.js)
  → protect / optionalAuth (JWT verify)                  (middlewares/auth.js)
  → restrictTo (RBAC)                                    (middlewares/role.js)
  → express-validator chain → validate()                 (validators/*, middlewares/validate.js)
  → controller (business logic, calls model/service)     (controllers/*.controller.js)
  → ApiResponse.send(res)                                 (utils/ApiResponse.js)

On error at any point → next(err) → errorHandler          (middlewares/error.js)
```

## Consistent response shape

Every success response:
```json
{ "success": true, "statusCode": 200, "message": "Fetched successfully", "data": [...], "meta": { "page": 1, "limit": 20, "total": 87, "totalPages": 5 } }
```
Every error response:
```json
{ "success": false, "statusCode": 400, "message": "Validation failed", "errors": [{ "field": "email", "message": "..." }] }
```
`ApiError` and `ApiResponse` classes guarantee this everywhere — no controller hand-rolls
`res.json(...)` directly, which keeps the frontend's API client (Phase 5) simple: one
response shape to parse regardless of endpoint.

## Filtering, sorting, search, pagination — one query builder

`utils/apiFeatures.js` implements the conventions requested in your spec (Pagination,
Filtering, Sorting, Searching) as a single reusable class, applied consistently across
every list endpoint:

| Feature | Query param | Example |
|---|---|---|
| Filter (exact + range) | any field name | `?location.city=Budapest&salary[gte]=2000` |
| Full-text search | `search` | `?search=barista` (uses each model's `text` index) |
| Sort | `sort` | `?sort=-createdAt,title` |
| Field selection | `fields` | `?fields=title,slug,price` |
| Pagination | `page`, `limit` | `?page=2&limit=20` (hard-capped at 100/page) |

This means `GET /api/v1/jobs?location.city=Budapest&employmentType=part-time&search=cafe&sort=-createdAt&page=1&limit=10`
works without any per-resource query-parsing code.

## Endpoint reference

### Articles (`/api/v1/articles`)
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/` | public (optional auth) | Only `published` for anonymous/students; editors/admins see all statuses |
| GET | `/featured` | public | Featured articles |
| GET | `/popular` | public | Sorted by views + likes |
| GET | `/:slug` | public | Increments view counter |
| POST | `/` | editor/admin | Create |
| PATCH | `/:id` | owner or editor/admin | Update |
| PATCH | `/:id/status` | editor/admin | Moderation: draft → pending-review → published → archived |
| POST | `/:id/like` | authenticated | Toggle like |
| DELETE | `/:id` | editor/admin | Delete |

### Jobs (`/api/v1/jobs`) · Accommodation (`/api/v1/accommodation`)
Same shape: public GET only shows `approved` listings (editors/admins see everything —
supports "Approve Listings"); any authenticated user can POST (new listings default to
`pending`); owner or editor/admin can PATCH; `PATCH /:id/status` is editor/admin-only.

### Universities (`/api/v1/universities`) · Scholarships (`/api/v1/scholarships`)
Editorial content — public GET, editor/admin-only create/update, admin-only delete.

### Categories (`/api/v1/categories`)
Editor/admin manage; public GET for building filter UIs.

### Comments (`/api/v1/comments`)
- `GET /target/:targetType/:targetId` — approved comments + nested replies for a target
- `POST /` — authenticated; auto-approved for editors/admins, queued for students
- `POST /:id/like`, `DELETE /:id` — author or editor/admin
- `GET /admin/all`, `PATCH /:id/status` — moderation queue

### Bookmarks (`/api/v1/bookmarks`)
All routes require auth. `POST /toggle` handles add/remove in one idempotent-feeling
call; keeps `Bookmark` and `User.savedArticles/savedJobs/savedAccommodation` in sync
together (see Phase 2 doc on why both exist).

### Newsletter (`/api/v1/newsletter`)
Public double opt-in: `POST /subscribe` → emails a confirm link → `GET /confirm?token=`.
`GET /unsubscribe?token=` needs no login (one-click from email). Admin: list/remove
subscribers.

### Analytics (`/api/v1/analytics`)
`POST /track` is public (logs anonymous + logged-in events for the Analytics
collection). `GET /dashboard` (editor/admin) returns headline counts plus a 30-day
events-per-day series built via aggregation pipeline — powers "Dashboard Analytics".

### Users (`/api/v1/users`)
`GET|PATCH /me` — self-service profile (role/email/password/isActive are stripped from
the update payload server-side, even if sent). Everything else is admin-only: list,
view, change role, activate/deactivate, delete — supports "Manage Users" + "Role Based
Access".

## Security measures implemented this phase

- **Helmet** — secure HTTP headers
- **CORS** locked to `CLIENT_URL` with credentials
- **express-mongo-sanitize** — strips `$`/`.` operators from user input (NoSQL injection)
- **xss-clean** — sanitizes user input against script injection
- **hpp** — prevents HTTP parameter pollution
- **express-rate-limit** — general API limiter (100 req/15min by default) + a stricter
  limiter reserved for Phase 4's auth endpoints (10 req/15min)
- **Body size cap** (`10kb`) on JSON/urlencoded parsing
- **Centralized error handler** normalizes Mongoose `CastError`/`ValidationError`/
  duplicate-key errors and JWT errors into the same `ApiError` shape, and never leaks
  stack traces in production

## What's stubbed for Phase 4

`middlewares/auth.js` currently only **verifies** tokens (`protect`, `optionalAuth`) —
routes throughout this phase depend on it, but nothing issues tokens yet. Phase 4 adds:
register, login, Google OAuth, refresh-token rotation, logout, forgot/reset password,
and email verification, wired up as `/api/v1/auth/*` (already reserved, commented out,
in `routes/v1/index.js`).

## Known limitation in this environment

I was not able to run `npm install` or boot the server live in this sandbox — the npm
registry returned a 403 here. Every file has been syntax-checked (`node --check`)
individually and passes, and the code follows the same patterns end-to-end, but I'd
recommend running `npm install && npm run dev` yourself as a first step after
downloading, and let me know if anything doesn't come up cleanly so I can fix it before
we move on.

---
Reply "approved" (or flag anything to fix) to proceed to Phase 4: Authentication.
