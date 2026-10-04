# Titan Tracker

Fan-made stat tracker for Food Network's Bobby's Triple Threat. Live at [triple-threat.vercel.app](https://triple-threat.vercel.app).

## Overview

Titan Tracker is a data-driven Next.js app that presents performance analytics for the show's titans, including rankings, records, per-round performance, and best score breakdowns. The page is generated statically at build time from PostgreSQL so it loads fast and remains cache-friendly, and it regenerates on demand when a new episode is entered through a password-gated admin portal.

## Highlights

- Static homepage built from parallel SQL queries, regenerated on demand when new data arrives (no redeploy)
- Ranking logic that handles ties ("T-2nd") and active/inactive titans
- A typed data-access layer: SQL in `.sql` files, one TypeScript type per table, components that only render
- Database-enforced integrity (primary/foreign keys, value checks) backing up the app's own validation
- Admin portal (`/admin`) for entering episodes, with a dry-run preview (a real transaction, rolled back) before anything is written
- Unit tests, a pre-push hook and GitHub Actions CI (type-check, ESLint, Prettier, tests)
- SEO metadata + Open Graph configuration for social sharing

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript
- PostgreSQL (`pg`) on Neon
- CSS Modules
- Vitest, ESLint, Prettier, GitHub Actions
- Vercel deployment

## Project Structure

```text
app/
  layout.tsx          # Root layout shared by every route: <html>, <body>, global CSS
  styles/             # Global CSS: design tokens (variables.css) and base styles
  (public)/           # Route group (not part of the URL) for the public site
    layout.tsx        # Header, footer, site metadata, analytics
    page.tsx          # The homepage ("/"): fetches data and composes sections
  admin/              # /admin route: layout + page (password-gated episode entry)
  metadata.ts         # SEO / OG metadata
  robots.ts, sitemap.ts

components/
  Layout/             # Site header, nav, footer
  Cards/              # Win/loss, leaderboard, per-titan cards, notes
  Admin/              # Admin portal UI: login, episode form, review panel (+ shared.module.css)
  HeroBanner.tsx, Section.tsx, ShareButtons.tsx

lib/
  db.ts               # PostgreSQL pool (+ parsing COUNT/AVG results as numbers)
  queries.ts          # Public-site data access: runs lib/queries/*.sql, shapes results
  queries/            # The SQL, one file per query (+ sql-loader.cjs, see below)
  types.ts            # One row type per table, plus shaped view types
  ranking.ts          # Rank labels and the active/inactive split
  format.ts           # Display formatting (averages, win %, name slugs)
  admin/              # Admin logic: auth, server actions, data access, validation, draft autosave
  *.test.ts           # Unit tests, next to the code they cover

docs/
  DATABASE.md         # Schema, keys, rules, handy queries, schema history
  ADMIN.md            # How the admin portal works

.githooks/pre-push    # tsc + ESLint + Prettier + tests before every push
.github/workflows/    # The same checks in CI
```

## Data Flow

1. Queries live in `lib/queries/**/*.sql` and are built into the bundle as strings (a small Turbopack loader, `lib/queries/sql-loader.cjs`, wired up in `next.config.mjs`).
2. `lib/queries.ts` runs them and shapes the rows into typed objects and lookup maps (`getTitans`, `getWinLoss`, `getAvgScores`, …).
3. `app/(public)/page.tsx` calls those in parallel at build time; `app/(public)/layout.tsx` adds the header, footer, site metadata and analytics.
4. Components render the leaderboard and per-titan sections.

## Design Decisions

- **Static page, regenerated on demand.** The homepage is `force-static`: built once, served from the CDN. Committing an episode through `/admin` calls `revalidatePath("/")`, so new stats appear within seconds without a redeploy.
- **A data-access layer.** Pages and components never query the database. `lib/queries.ts` (public) and `lib/admin/queries.ts` (admin) expose `get*` functions that return render-ready data. `getTitans` is wrapped in React's `cache()`, so the page and the site header share one query per render.
- **SQL stays SQL.** Queries live in `.sql` files that can be opened and run in a SQL client. They're compiled into the bundle rather than read from disk at runtime, which matters because on-demand regeneration runs in a serverless function where loose files aren't guaranteed to exist. Postgres returns `COUNT`/`AVG` results as strings by default; `lib/db.ts` parses them as numbers once, so the SQL needs no JavaScript-motivated casts.
- **Types follow the schema.** `lib/types.ts` has one type per table (`Titan`, `Episode`, `Round`); query and view types are built from them with `Pick`/`Omit`, so a column is described in one place.
- **Integrity in two layers.** The database enforces primary/foreign keys, `NOT NULL` and value rules (scores within range, max score by round, one round per titan per episode), so bad data can't get in from anywhere. The admin form validates the same rules first to show friendly, specific messages. See [docs/DATABASE.md](docs/DATABASE.md).
- **Public and admin layouts are separate.** A `(public)` route group gives the public site its header, footer, metadata and analytics; `/admin` uses only the minimal root layout, so it never runs the header's query or loads analytics.
- **Heuristics checked against real data.** The admin form warns about names and ingredients typed in all lowercase or ALL CAPS. An earlier title-case suggester was replaced after testing it against every existing value showed its suggestions were wrong.

## Known Trade-offs

- Query results are typed but not validated at runtime; the database's own rules and the tests cover the main risks at this size.
- Schema changes are recorded as SQL in `docs/DATABASE.md` rather than managed by a migration tool.
- The admin portal uses a single shared password with a signed session cookie: sized to keep casual visitors out, not a hardened multi-user auth system ([docs/ADMIN.md](docs/ADMIN.md#security-notes)).

## Environment Variables

Create `.env.local`:

```bash
POSTGRES_URL=postgres://username:password@host/database
ADMIN_PASSWORD=choose-a-password   # gates /admin; also set in Vercel project settings
```

`next build` prerenders the homepage from the database, so `POSTGRES_URL` must be set for builds too (a missing value makes `pg` fall back to a local Postgres and fail with `relation "titan_rounds" does not exist`). Vars pulled with `vercel env pull` land in `.env.development.local`, which `next dev` reads but `next build` doesn't; a local, gitignored `.envrc` (direnv) can export them for builds.

## Getting Started

Requires Node 24 (pinned in `.nvmrc`).

```bash
npm install
npm run dev
```

The app runs at http://localhost:3000.

## Scripts

```bash
npm run dev            # dev server
npm run build          # production build
npm start              # serve the production build
npm run lint           # ESLint (Next.js + TypeScript rules)
npm test               # unit tests (Vitest)
npm run test:watch     # tests in watch mode
npm run format         # format with Prettier
npm run format:check   # check formatting
```

A tracked pre-push hook (`.githooks/pre-push`) type-checks with `tsc`, lints with ESLint, checks formatting and runs the tests before every push; `npm install` enables it (the `prepare` script sets `core.hooksPath`). GitHub Actions runs the same checks on every push and pull request.

## Why This Project

Titan Tracker showcases practical full-stack analytics work: SQL modeling and database integrity, a strongly typed data-access layer, stat-focused frontend presentation, and a rendering strategy that keeps a static site fresh.
