# Phase 8 — Testing

Real, runnable tests — not placeholders — using an in-memory MongoDB for the backend
(so tests exercise actual Mongoose behavior, not mocks) and Playwright against a real
running frontend + backend for end-to-end coverage.

## Backend: Jest + Supertest + mongodb-memory-server

**`tests/setup.js`** boots an actual in-memory MongoDB instance once for the whole
suite (via `mongodb-memory-server`, already in Phase 1's `package.json`), and clears
every collection between tests so state doesn't leak across test cases. This is a
deliberate choice over mocking Mongoose: mocks would have let bugs like the Phase 4
`refreshTokens` schema issue pass silently, since a mock doesn't know that Mongoose
actually mis-parses that syntax.

### Unit tests (`tests/unit/`)
- `utils/apiError.test.js` — every static factory method (`badRequest`, `notFound`, etc.)
- `utils/asyncHandler.test.js` — confirms rejected promises reach `next()` instead of
  crashing the process
- `utils/apiFeatures.test.js` — filter/sort/limitFields/paginate, run against a real
  `Category` collection rather than a mocked query object
- `models/user.test.js` — password hashing, `comparePassword`, **a regression test for
  the exact `refreshTokens` bug fixed in Phase 4** (proves the corrected schema now
  behaves as a real `select:false` string array), and `toJSON()` never leaking
  password/tokens even when explicitly `.select()`-ed
- `models/slugGeneration.test.js` — auto-slug generation across Article/Job/University,
  the uniqueness suffix on user-submitted content, and duplicate-slug rejection

### Integration tests (`tests/integration/`)
- `auth.test.js` — full register → login → refresh-token cycle against the real HTTP
  layer, including the httpOnly cookie actually being set, weak-password rejection,
  duplicate-email conflict, and login failing the same way (401) for both "wrong
  password" and "email doesn't exist" (verifies no account enumeration)
- `articles.test.js` — the moderation-visibility rules end-to-end: a student can't
  create an article (403), a draft is invisible to anonymous/student requests but
  visible to editors, publishing flips public visibility, view-counting, like-toggling
- `jobs.test.js` — the different-shaped approval workflow: any authenticated user can
  submit (unlike Articles), pending jobs are hidden from the public list, only an
  admin/editor can approve (not the listing's own owner), ownership-based edit
  permissions, and combined filter queries (`location.city` + `employmentType`)
- `app.test.js` — health check, the 404 handler's response shape, and a Mongoose
  `CastError` (invalid ObjectId) being normalized to a clean 400 rather than leaking a
  raw Mongo error

**`tests/helpers/auth.js`** — a shared helper that registers a real user through the
actual API and promotes their role directly in the DB (bootstrapping the first
admin/editor for a test has to bypass the normal "an admin promotes you" flow somehow).
Every integration test uses this rather than hand-rolling user setup.

### Running them

```bash
cd backend
npm install
npm test              # single run with coverage
npm run test:watch    # watch mode while developing
```

`jest.config.js` sets a coverage threshold (60% statements/functions/lines, 50%
branches) — deliberately not 100%; config files and the server bootstrap file are
excluded, and hitting 100% on a REST API usually means testing trivial getters rather
than behavior that matters.

## Frontend: Playwright

**`playwright.config.ts`** runs two projects — Desktop Chrome and Mobile Safari
(iPhone 13 viewport) — which directly covers "Test mobile responsiveness" from your
requirements list, not as a separate manual QA pass but as an automated check that runs
every time.

- `tests/e2e/navigation.spec.ts` — home page renders, nav links actually route to the
  right pages, custom 404 page, dark mode toggle applies the `dark` class, an
  unauthenticated visitor hitting `/dashboard` gets redirected to `/login` (verifies
  the Phase 5 middleware actually works, not just that the code compiles), and a
  mobile-only test for the hamburger menu
- `tests/e2e/auth.spec.ts` — full registration → dashboard flow through real form
  interaction, client-side password-mismatch validation firing before any API call,
  and a wrong-password login surfacing the server's error message in the UI

### A real bug these tests caught before you'd have hit it

Writing `auth.spec.ts` with Playwright's `getByLabel()` — which requires a real
`<label for="...">`/`<input id="...">` association, not just visual proximity —
surfaced that the Phase 5 login/register/profile forms never actually wired that up.
It would have worked visually and functionally for a mouse user, but was invisible to
screen readers and would have failed any accessibility audit (and "Accessible" is
explicitly in your spec's UI Design section). Fixed across all three forms this phase.

### Running them

Playwright needs both servers running — it doesn't spin up the backend or a database
itself:

```bash
# terminal 1
cd backend && npm run dev

# terminal 2
cd frontend && npm run dev

# terminal 3
cd frontend && npx playwright install   # first time only — downloads browser binaries
npm run test:e2e
```

## What I could and couldn't verify here

I could not run any of this — `npm install` still fails in this sandbox, and I
confirmed why this time rather than guessing: **network access is disabled in this
environment entirely** (not a registry-specific block). Every backend file (`node
--check`) and every frontend file (esbuild) passes syntax checking, and the login-form
accessibility bug was caught by reasoning through how Playwright's locator actually
works, not by running it — which is exactly the kind of thing that's better caught by
actually running the suite. Please run both `npm test` (backend) and `npm run test:e2e`
(frontend, with both servers up) and send me any failures — particularly anything in
`jobs.test.js`'s ownership/permission tests, which is the most intricate logic in the
codebase and the area I'd most want real confirmation on.

---
Reply "approved" to proceed to Phase 9: Deployment.
