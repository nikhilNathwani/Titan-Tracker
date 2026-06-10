# Titan Tracker

Fan-made stat tracker for Food Network's Bobby's Triple Threat.

## Overview

Titan Tracker is a data-driven Next.js app that presents performance analytics for the show's titans, including rankings, records, per-round performance, and best score breakdowns. The page is generated statically at build time from PostgreSQL so it loads fast and remains cache-friendly.

## Highlights

- Build-time parallel SQL fetches for all dashboard sections
- Ranking logic that handles ties and active/inactive titans cleanly
- Strong typing from raw database rows to UI-ready view models
- Reusable card-based layout for leaderboard and individual stats
- SEO metadata + Open Graph configuration for social sharing

## Tech Stack

- Next.js 14 (App Router)
- React + TypeScript
- PostgreSQL (`pg`)
- CSS Modules
- Vercel deployment

## Project Structure

```text
app/
  page.tsx            # Build-time data fetch + page composition
  layout.tsx          # Global layout
  metadata.ts         # SEO / OG metadata

components/
  HeroBanner.tsx
  Section.tsx
  Cards/
    WinLoss.tsx
    TitanLeaderboard.tsx
    TitanCard.tsx
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

1. SQL files are loaded from `lib/queries/**`.
2. `app/page.tsx` runs all core queries in parallel at build time.
3. Rows are parsed into typed objects and grouped maps.
4. Components render leaderboard and per-titan sections.

## Environment Variables

Create `.env.local`:

```bash
POSTGRES_URL=postgres://username:password@host/database
```

## Getting Started

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

## Notes on Rendering

- `app/page.tsx` is configured with `dynamic = "force-static"`.
- Fresh data appears on the next deployment/build.

## Why This Project

Titan Tracker showcases practical full-stack analytics work: SQL modeling, strongly typed transformation layers, stat-focused frontend presentation, and deployment-ready rendering strategy.