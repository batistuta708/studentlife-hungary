# Phase 4 — Authentication

Full auth system built on top of the `protect`/`optionalAuth` JWT-verification
middleware from Phase 3. All endpoints live under `/api/v1/auth`.

## Token strategy

- **Access token** — short-lived JWT (15 min default), returned in the JSON response
  body, meant to be held in memory/state on the frontend and sent as
  `Authorization: Bearer <token>`. Short lifespan limits the damage if it's ever
  exposed (e.g. via XSS), since it expires quickly regardless.
- **Refresh token** — long-lived JWT (30 days default), set as an **httpOnly, secure,
  SameSite=strict** cookie scoped to `/api/v1/auth` only. Never touchable by frontend
  JS, which is what makes it safe to keep long-lived.
- **Rotation**: every call to `/refresh-token` invalidates the refresh token that was
  used and issues a new one, storing it on `User.refreshTokens` (capped at the 5 most
  recent — effectively 5 concurrent device sessions). If a refresh token is ever
  stolen, it's single-use — the legitimate device's next refresh attempt would fail
  and reveal the compromise.
- **Logout** removes just the current device's refresh token; **logout-all** clears
  the entire array, signing every device out at once (also triggered automatically by
  password reset/change, as a safety measure).

## Endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/register` | rate-limited | Creates a `local` account, sends a verification email, logs the user in immediately (email verification is encouraged, not required, to avoid a dead-end signup flow) |
| POST | `/login` | rate-limited | Email/password |
| POST | `/google` | rate-limited | Verifies a Google ID token server-side, creates or links an account |
| POST | `/refresh-token` | reads httpOnly cookie | Rotates refresh token, returns a new access token |
| POST | `/logout` | — | Clears current device's session |
| POST | `/logout-all` | authenticated | Clears every session |
| POST | `/verify-email` | — | Body: `{ token }` from the emailed link |
| POST | `/resend-verification` | authenticated | Re-sends the verification email |
| POST | `/forgot-password` | rate-limited | Always returns the same message whether or not the email exists (no account enumeration) |
| POST | `/reset-password` | rate-limited | Body: `{ token, password }`; invalidates all existing sessions |
| POST | `/change-password` | authenticated | Requires current password; invalidates all *other* sessions |

## Google OAuth flow

The **frontend** is responsible for triggering Google's client-side sign-in and
obtaining an ID token (Phase 5 will wire this up with `@react-oauth/google` or
similar). The **backend** never talks to Google's OAuth consent screen directly —
`POST /auth/google` just receives the ID token and verifies its signature +
audience server-side via `google-auth-library` (`config/googleAuth.js`), so a forged
or tampered token is rejected before it can create a session. This is simpler and more
secure than a server-side OAuth redirect flow for this kind of SPA/API split.

If someone registered with email/password and later signs in with Google using the
same email, the accounts are linked (`googleId` is attached to the existing user)
rather than creating a duplicate.

## Password reset security

- Reset/verification tokens are generated as random 32-byte values; only the **SHA-256
  hash** is stored in the database (`emailVerificationToken`, `passwordResetToken`,
  both `select: false`). The raw token only ever exists in the emailed link — even a
  full database leak doesn't expose usable reset links.
- Reset tokens expire in 1 hour, verification tokens in 24 hours.
- `forgotPassword` always responds with the same generic message regardless of whether
  the email is registered, preventing user enumeration.

## A bug caught during this phase

While reviewing `User.refreshTokens`, the Phase 2 schema had it written as
`[{ type: String, select: false }]`, which Mongoose can misinterpret as an array of
subdocuments rather than a `select:false` array of plain strings. Fixed to
`{ type: [String], select: false, default: [] }` — the correct syntax for excluding an
array-of-primitives field by default. Flagging this since it's exactly the kind of
subtle bug that only surfaces once you `npm install` and actually query the database,
which I still can't do in this sandbox (see the Phase 3 note on the npm registry 403).

## Still can't verify live

Same limitation as Phase 3: no `npm install` / live boot test possible here. All files
pass `node --check`. Please run `npm install && npm run dev`, hit `/api/v1/auth/register`
and `/api/v1/auth/login` with a REST client, and let me know if anything breaks —
especially around the Mongoose select/populate behavior, which is the part I can't
fully verify without a running MongoDB connection.

---
Reply "approved" to proceed to Phase 5: Frontend.
