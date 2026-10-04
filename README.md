# Titan Tracker

Fan-made stat tracker for Food Network's Bobby's Triple Threat.

## Overview

Titan Tracker is a data-driven Next.js app that presents performance analytics for the show's titans, including rankings, records, per-round performance, and best score breakdowns. The page is generated statically at build time from PostgreSQL so it loads fast and remains cache-friendly.

## Highlights

- Build-time parallel SQL fetches for all dashboard sections
- Ranking logic that handles ties and active/inactive titans cleanly
- Strong typing from raw database rows to UI-ready view models
- Reusable card-based layout for leaderboard and individual stats
- Password-protected admin portal (`/admin`) for entering new episodes, with a dry-run preview before anything is written
- SEO metadata + Open Graph configuration for social sharing

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript
- PostgreSQL (`pg`)
- CSS Modules
- Vercel deployment

## Project Structure

```text
app/
  layout.tsx          # Root layout shared by every route: <html>, <body>, global CSS
  (public)/           # Route group (not part of the URL) for the public site
    layout.tsx        # Header, footer, site metadata, analytics
    page.tsx          # The homepage ("/"): fetches data and composes sections
  metadata.ts         # SEO / OG metadata
  robots.ts, sitemap.ts
  admin/              # Password-gated episode entry (server actions, dry-run preview)

components/
  HeroBanner.tsx
  Section.tsx
  ShareButtons.tsx
  Layout/             # Site header, nav, footer
  Cards/
    WinLoss.tsx
    TitanLeaderboard.tsx
    TitanCard/        # Per-titan card (header, stat widgets, per-round stats)
    Notes.tsx

lib/
  db.ts               # PostgreSQL pool
  queries.ts          # SQL file loaders
  queries/
    records/
    stats/
  ranking.ts          # Rank label generation
  types.ts            # Row types + shaped view types
```

## Data Flow

1. Queries live in `lib/queries/**/*.sql` and are built into the bundle as strings (a small Turbopack loader, `lib/queries/sql-loader.cjs`, wired up in `next.config.mjs`).
2. `lib/queries.ts` runs them and shapes the rows into typed objects and lookup maps (`getTitans`, `getWinLoss`, `getAvgScores`, …).
3. `app/(public)/page.tsx` calls those in parallel at build time; `app/(public)/layout.tsx` adds the header, footer, site metadata and analytics.
4. Components render leaderboard and per-titan sections.

## Environment Variables

Create `.env.local`:

```bash
POSTGRES_URL=postgres://username:password@host/database
ADMIN_PASSWORD=choose-a-password   # gates /admin; also set in Vercel project settings
```

`next build` prerenders the homepage from the database, so `POSTGRES_URL` must be set for builds too (a missing value makes `pg` fall back to a local Postgres and fail with `relation "titan_rounds" does not exist`). If you keep these vars in `.env.development.local` instead (e.g. via `vercel env pull`), the repo's `.envrc` loads them for any command run from this folder once `direnv allow` has been run.

## Getting Started

Requires Node 24 (pinned in `.nvmrc`; fnm switches to it automatically).

```bash
npm install
npm run dev
```

App runs at http://localhost:3000.

## Scripts

```bash
npm run dev
npm run build
npm start
```

A tracked pre-push hook (`.githooks/pre-push`) type-checks with `tsc` before every push. `npm install` enables it automatically (the `prepare` script sets `core.hooksPath`).

## Notes on Rendering

- `app/(public)/page.tsx` is configured with `dynamic = "force-static"`.
- Fresh data appears on the next deployment/build — or immediately after an episode is committed through `/admin`, which calls `revalidatePath("/", "layout")`.
- `/admin` is always rendered on demand (`dynamic = "force-dynamic"`) so its session check runs on every request.

## Why This Project

Titan Tracker showcases practical full-stack analytics work: SQL modeling, strongly typed transformation layers, stat-focused frontend presentation, and deployment-ready rendering strategy.
