# Phase 2 — MongoDB Schema

All 11 collections are implemented as Mongoose models in `backend/src/models/`. This
document explains the relationships, the refs-vs-embed decisions, and the indexing
strategy.

## Collections

| Collection    | File               | Purpose |
|---------------|--------------------|--------|
| Users         | `User.js`          | Accounts, auth, roles, profile |
| Categories    | `Category.js`      | Shared taxonomy across content types |
| Articles      | `Article.js`       | Blog posts |
| Comments      | `Comment.js`       | Comments on articles (polymorphic-ready) |
| Jobs          | `Job.js`           | Student job listings |
| Accommodation | `Accommodation.js` | Housing listings |
| Universities  | `University.js`    | University directory profiles |
| Scholarships  | `Scholarship.js`   | Scholarship listings |
| Bookmarks     | `Bookmark.js`      | Polymorphic saved-items join table |
| Newsletter    | `Newsletter.js`    | Email subscribers |
| Analytics     | `Analytics.js`     | Event log for the admin dashboard |

## Relationship diagram (textual)

```
User ──┬──< Article (author)
       ├──< Job (postedBy)
       ├──< Accommodation (listedBy)
       ├──< Scholarship (postedBy)
       ├──< Comment (author)
       ├──< Bookmark (user)  ──> [Article | Job | Accommodation]  (polymorphic)
       ├──> University (studying at, optional)
       └──< Newsletter (optional link if the subscriber has an account)

Category ──< Article (many-to-many via categories[])
Category ──< Job (many-to-one)
Category ──< Accommodation (implicit via `type` enum, not Category — see note below)

University ──< Accommodation (nearestUniversity)
University ──< Scholarship (applicableUniversities[], many-to-many)

Comment ──< Comment (parentComment, self-referencing for threaded replies)

Analytics ──> [Article | Job | Accommodation | University | Scholarship]  (polymorphic, nullable)
```

## Key design decisions

**1. References over embedding, almost everywhere.**
Articles, Jobs, Accommodation, Universities, and Scholarships all reference `User` via
ObjectId rather than embedding author info. Reasons:
- Author profiles (name/avatar) change independently of content — embedding would mean
  updating every article when a user changes their name.
- Admin moderation queries (e.g. "all pending listings by user X") need to join across
  content types, which is far easier with refs + `.populate()`.

The one exception is `Accommodation.contact` and `Job.company`, which *are* embedded —
those represent point-in-time listing details (a landlord's phone number for this
listing) rather than a queryable entity, so embedding avoids an unnecessary join.

**2. Bookmarks is polymorphic, not three separate collections.**
Rather than `SavedArticle`, `SavedJob`, `SavedAccommodation` collections, one `Bookmark`
collection uses `targetType` + `targetId` (Mongoose's `refPath` pattern). A compound
unique index on `{ user, targetType, targetId }` prevents duplicate bookmarks. The
`User` model also denormalizes `savedArticles/savedJobs/savedAccommodation` arrays —
this is a deliberate, small duplication that makes the common case ("show my saved
articles on my profile") a single `populate()` call instead of a separate collection
query, while `Bookmark` remains the source of truth for dedicated bookmark-management
pages and for uniqueness enforcement.

**3. Comments use the same polymorphic pattern**, scoped today to `targetType: "Article"`
only (per your spec — comments are a Blog feature). Modeling it polymorphically now
means adding comments to Jobs or Accommodation later needs zero schema migration, only
a new enum value.

**4. Categories are shared but scoped with `appliesTo`.**
Rather than separate `ArticleCategory`/`JobCategory` collections, one `Category`
collection has an `appliesTo` enum (`article`, `job`, `accommodation`, `university`,
`scholarship`). This keeps the Admin Dashboard's "Manage Categories" screen unified
(per your spec) while `appliesTo` scopes queries and prevents a "Visa Guide" article
category from accidentally appearing as a job filter.
Accommodation intentionally uses a fixed `type` enum (dormitory/studio/shared-apartment/
etc.) instead of `Category`, since housing types are a closed, stable set that doesn't
need admin-editable taxonomy management.

**5. Every content collection carries its own `status` + `seo` + `views` fields**
(`draft/pending-review/published/archived` for Articles; `pending/approved/rejected/...`
for user-submitted Jobs/Accommodation/Scholarships). This directly supports your "Approve
Listings" admin feature — moderation is a first-class field, not bolted on later — and
keeps per-page SEO meta title/description editable independent of the auto-generated
slug.

**6. Slugs are auto-generated in a `pre("validate")` hook** using `slugify`, satisfying
"SEO Friendly URLs" and "Automatic Slug Generation" from your spec. Jobs, Accommodation,
and Scholarships append a base-36 timestamp suffix to the slug (e.g.
`barista-needed-budapest-lz3k9f`) since these are frequently user-submitted and titles
collide often ("Part-time Waiter" posted by five different cafés); Articles and
Universities don't need the suffix since editors control uniqueness manually.

**7. Denormalized counters (`likesCount`, `views`) alongside relational arrays
(`likes: [ObjectId]`)** — storing both means "has this user liked this post" is an O(1)
array-contains check, while sorting by popularity doesn't require an `$size` aggregation
on every list-page query.

**8. Analytics is an append-only event log, not pre-aggregated counters.** Each pageview/
search/signup is one document with a 400-day TTL index (auto-expires old raw events).
The Admin Dashboard's charts will be built with aggregation pipelines (`$group` by day/
eventType) in Phase 3, which is more flexible than trying to predefine every counter a
future dashboard widget might need.

## Indexing strategy summary

- **Uniqueness**: `User.email`, `User.googleId` (sparse), all `slug` fields,
  `Bookmark{user,targetType,targetId}`, `Newsletter.email`.
- **Full-text search** (`Filtering`/`Searching` from your spec): text indexes on
  Article, Job, Accommodation, University, Scholarship covering title/description/tags.
- **Common filter/sort compound indexes**: `Article{status,publishedAt}`,
  `Job{location.city,employmentType}`, `Accommodation{location.city,type,status}`,
  `Scholarship{status,applicationDeadline}`.
- **Geospatial**: `Accommodation.location.coordinates` uses a `2dsphere` index for
  future "near my university" map search.
- **TTL**: `Analytics.createdAt` auto-expires raw events after ~13 months.

## Validation approach

Mongoose schema-level validation (`required`, `maxlength`, `enum`, `match`) is the last
line of defense — the primary validation layer is `express-validator` chains in
`backend/src/validators/` (Phase 3), so bad input is rejected before it reaches the
model layer with a clean, consistent error response.

## What's next

**Phase 3 — Backend API** will build the Express routes/controllers/services on top of
these models: CRUD endpoints for every collection, pagination/filtering/sorting/search
query builders, and the `ApiError`/`ApiResponse`/`asyncHandler` utilities referenced in
the Phase 1 architecture doc.

---
Reply "approved" (or with schema changes you'd like) to proceed to Phase 3.
