# Next.js 101 — Titan Tracker Migration Guide

This document covers the migration from Express + vanilla JS to Next.js, using the Titan Tracker codebase as a running example. It's also meant to be a practical Next.js reference for someone who knows React but hasn't used Next.js before.

---

## 1. The Problem with the Old Architecture

The old stack was **Client-Side Rendering (CSR)**:

1. Browser requests the page
2. Server sends an empty `index.html` shell
3. Browser parses it — nothing to see yet
4. JavaScript loads and runs
5. JS makes 5 separate `fetch()` calls to `/api/*`
6. The Express server queries Postgres for each
7. Results come back, JS populates the DOM
8. **User finally sees the page** — 1–2 seconds after the initial request

Every visitor to the site, on every page load, pays this latency cost.

---

## 2. Rendering Paradigms

Before diving into Next.js, understand the landscape:

| Paradigm            | Data fetches when                  | Blank page? | Best for                                          |
| ------------------- | ---------------------------------- | ----------- | ------------------------------------------------- |
| **CSR** (old setup) | In the browser, after JS loads     | Yes         | User-specific, highly dynamic data                |
| **SSR**             | On the server, on every request    | No          | Per-user data, frequently changing content        |
| **SSG**             | At build time, once                | No          | Same content for all users, infrequent changes    |
| **ISR**             | At build time + scheduled rebuilds | No          | SSG + periodic data refresh without full redeploy |

**Titan Tracker uses SSG.** The data is the same for every visitor, and it only changes when a new episode is manually entered. The page is built _once_ at deploy time, and Vercel serves the pre-built HTML file instantly to every visitor.

---

## 3. What Is Next.js?

Next.js is an opinionated full-stack React framework. Compared to Express:

|            | Express                         | Next.js                           |
| ---------- | ------------------------------- | --------------------------------- |
| Routing    | You define routes manually      | File-based: `app/page.js` → `/`   |
| Frontend   | You wire it yourself            | React, built-in                   |
| Rendering  | CSR by default (you serve HTML) | SSG/SSR/CSR handled automatically |
| Bundling   | You configure webpack           | Built-in, zero config             |
| Deployment | Run a Node server               | Vercel detects it, zero config    |
| API routes | Your whole app is an API        | Co-located in `app/api/`          |

**Rule of thumb**: Use Next.js for web apps where the frontend and backend are tightly coupled (Titan Tracker, blogs, dashboards, SaaS UIs). Use Express/Fastify/Hono when building a standalone API consumed by multiple different clients (mobile apps, third parties, etc.).

---

## 4. Project Structure

Next.js 13+ uses the **App Router**. Routing is based entirely on the filesystem inside the `app/` directory.

```
titan-tracker/
├── app/                    ← App Router root
│   ├── layout.js           ← Root layout (wraps every page)
│   ├── page.js             ← Route: /
│   └── queries/            ← Non-route files are just files; Next.js ignores them
│       ├── records/
│       └── stats/
├── components/             ← Reusable React components
├── lib/                    ← Server-side utilities (DB, queries, helpers)
├── public/                 ← Static assets served at /
│   ├── css/style.css
│   └── img/
├── jsconfig.json           ← Configures the @/ path alias
├── next.config.mjs         ← Next.js configuration
└── package.json
```

### The `app/` directory is special

Only files with specific names inside `app/` have meaning to Next.js:

| Filename       | Purpose                                               |
| -------------- | ----------------------------------------------------- |
| `page.js`      | Renders a route (makes the folder a URL path)         |
| `layout.js`    | Wraps child pages/layouts; persists across navigation |
| `route.js`     | API route handler (REST endpoint)                     |
| `loading.js`   | Shown while a page is loading                         |
| `error.js`     | Shown when a page throws                              |
| `not-found.js` | Shown for 404s                                        |

Any other file (like `app/queries/records/winLoss.sql`) is ignored by the router. It's just a file.

### The `@/` path alias

`jsconfig.json` maps `@/` to the project root:

```json
{
	"compilerOptions": {
		"paths": { "@/*": ["./*"] }
	}
}
```

So `import { pool } from '@/lib/db'` works from anywhere in the project, regardless of the importing file's depth. No `../../lib/db` fragility.

---

## 5. Server Components vs. Client Components

This is the most important concept in the App Router.

### Server Components (default)

Every component in `app/` is a Server Component unless you opt out. Server Components:

- **Run on the server** (or at build time for SSG)
- **Can be `async`** and directly `await` database queries, file reads, fetch calls
- **Never ship their code to the browser** — the browser only receives HTML
- **Cannot use** `useState`, `useEffect`, event handlers, or any browser API

`app/page.js` is a Server Component:

```js
// app/page.js — Server Component
import { pool } from '@/lib/db';
import { winLossQuery } from '@/lib/queries';

export default async function Home() {
  // This runs on the server at build time — directly query the DB
  const result = await pool.query(winLossQuery);
  const winLoss = result.rows[0];

  // Pass the fetched data as props to child components
  return <WinLoss num_win={winLoss.num_win} ... />;
}
```

In the old Express + vanilla JS setup, this required: an Express route, a `fetch()` call from the browser, and JS to populate the DOM. Now it's just a function that returns JSX.

### Client Components (`"use client"`)

When a component needs React hooks or browser interactivity, add `"use client"` at the top of the file:

```js
// components/SiteHeader.jsx — Client Component
"use client";

import { useState } from "react";

export default function SiteHeader({ activeTitans, inactiveTitans }) {
	const [navOpen, setNavOpen] = useState(false);
	// ...
}
```

`SiteHeader` uses `useState` to toggle the hamburger menu, so it must be a Client Component. But here's the key insight: **Server Components can pass data to Client Components as props**. The titans list is fetched on the server in `page.js` and passed as a prop to `SiteHeader` — the client component never needs to fetch it.

### The Rule

Default to Server Components. Only add `"use client"` when you actually need:

- `useState` / `useReducer`
- `useEffect`
- Browser APIs (`window`, `document`)
- Event listeners (`onClick`, `onChange`)

If a component doesn't need any of those, leave it as a Server Component.

---

## 6. Static Rendering (SSG)

The key export in `app/page.js`:

```js
export const dynamic = "force-static";
```

This tells Next.js: _"At build time, run this Server Component, query the database, and save the resulting HTML. Never re-run it on a request."_

The build process:

1. `next build` runs
2. Next.js executes `page.js` on the server
3. All 5 `await pool.query(...)` calls complete
4. The resulting React tree is rendered to static HTML
5. That HTML file is deployed to Vercel's CDN
6. Every visitor gets the pre-built file — zero database latency

When you add new episode data: manually trigger a redeploy (`vercel --prod` or click "Redeploy" in the Vercel dashboard). The build runs again with fresh data.

### Other rendering modes

| Export                                   | Behavior                                                     |
| ---------------------------------------- | ------------------------------------------------------------ |
| `export const dynamic = 'force-static'`  | SSG: built once at deploy time                               |
| `export const revalidate = 3600`         | ISR: rebuilt automatically every 1 hour                      |
| `export const dynamic = 'force-dynamic'` | SSR: rebuilt on every request                                |
| _(none — default)_                       | Next.js infers: static if no dynamic data, otherwise dynamic |

---

## 7. Layout Files

`app/layout.js` is the root layout. It wraps every page in the app:

```js
// app/layout.js
import '../public/css/style.css';

export const metadata = { title: "Bobby's Triple Threat - Stats", ... };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}   {/* ← page.js renders here */}
      </body>
    </html>
  );
}
```

**The `metadata` export** is how you set `<title>`, `<meta>`, Open Graph tags, and Twitter cards — no manual `<head>` tags needed. Next.js handles generating the correct HTML.

**CSS imports**: Global CSS is imported directly in `layout.js`. Next.js bundles it automatically. The old `<link rel="stylesheet">` in `index.html` is gone.

**Google Fonts / external scripts**: Use `next/script` with a `strategy`:

- `"beforeInteractive"` — blocks page render
- `"afterInteractive"` — loads after hydration (good for analytics)
- `"lazyOnload"` — loads during idle time

---

## 8. Data Fetching in Server Components

The old flow required 5 round-trips:

```
Browser → GET /api/winLoss → DB
Browser → GET /api/titanRecords → DB
Browser → GET /api/avgScores → DB
Browser → GET /api/bestScores → DB
Browser → GET /api/perRoundStats → DB
```

The new flow — everything happens in `app/page.js` at build time:

```js
const [
	winLossResult,
	titanRecordsResult,
	avgScoresResult,
	bestScoresResult,
	perRoundStatsResult,
] = await Promise.all([
	pool.query(winLossQuery),
	pool.query(titanRecordsQuery),
	pool.query(avgScoresQuery),
	pool.query(bestScoresQuery),
	pool.query(perRoundStatsQuery),
]);
```

`Promise.all` fires all 5 queries in parallel — same as before, but it happens once at build time, not on every page visit.

---

## 9. API Route Handlers

Next.js API routes live in `app/api/*/route.js`. They replaced the Express routes from `app/routes/`:

```js
// Old: app/routes/records.js (Express)
router.get("/winLoss", (req, res) => {
	submitQuery(winLossQuery, res);
});

// New: app/api/winLoss/route.js (Next.js Route Handler)
export async function GET() {
	const result = await pool.query(winLossQuery);
	return Response.json({ message: "success", data: result.rows });
}
```

**Important naming convention**: Route Handler files MUST be named `route.js`. The folder name becomes the URL path. You cannot use named files like `winLoss.js` — Next.js won't recognize them as API routes.

**For Titan Tracker specifically**: The API routes were removed from the final codebase because `page.js` fetches data directly at build time. They're not needed for SSG. They'd only be useful if you added client-side data refreshing in the future (e.g., a "refresh" button to reload data without a full page rebuild).

---

## 10. The `lib/` Directory

`lib/` contains server-side utilities that are shared across the app. These are plain JavaScript modules — not React, not Next.js-specific.

```
lib/
├── db.js        ← Postgres pool (single shared connection pool)
├── queries.js   ← Reads .sql files from disk at startup
└── ranking.js   ← Pure functions: generateRankStrings, formatRecord
```

`lib/db.js` creates a single `Pool` instance:

```js
import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.POSTGRES_URL });
export { pool };
```

Node.js module system caches this on first import — all files that `import { pool }` share the same connection pool. Same behavior as the old `app/utils/dbConfig.js`.

---

## 11. Environment Variables

Next.js handles `.env` files automatically — no `require('dotenv')` needed:

| File                     | When loaded                                     |
| ------------------------ | ----------------------------------------------- |
| `.env`                   | Always                                          |
| `.env.local`             | Always, overrides `.env` (not committed to git) |
| `.env.development.local` | Only in `next dev`                              |
| `.env.production.local`  | Only in `next build` / `next start`             |

Variables are server-only by default. To expose a variable to the browser, prefix it with `NEXT_PUBLIC_`:

- `POSTGRES_URL` → server only ✓ (never sent to browser — keep credentials safe)
- `NEXT_PUBLIC_ANALYTICS_ID` → available in browser code

---

## 12. Deployment on Vercel

Vercel auto-detects Next.js. With `vercel.json` set to `{ "framework": "nextjs" }`, the deploy process is:

1. Push to GitHub
2. Vercel detects the push, runs `next build`
3. During build, `page.js` queries your Postgres DB (using `POSTGRES_URL` from Vercel environment settings)
4. Static HTML is generated and deployed to Vercel's edge CDN
5. Done — visitors get the pre-built file instantly from the nearest CDN node

**To update data**: After adding new episodes to the DB, go to Vercel dashboard → your project → "Redeploy", or run `vercel --prod` from the CLI. The build re-runs, queries fresh data, publishes new HTML.

---

## 13. What Became of What

| Old file                             | New equivalent                                                | Why                                           |
| ------------------------------------ | ------------------------------------------------------------- | --------------------------------------------- |
| `server.js`                          | `next dev` / `next start`                                     | Next.js is the server                         |
| `app.js`                             | Next.js runtime                                               | Framework handles HTTP                        |
| `app/routes/records.js`              | _(deleted)_                                                   | Not needed for SSG                            |
| `app/routes/stats.js`                | _(deleted)_                                                   | Not needed for SSG                            |
| `app/utils/dbConfig.js`              | `lib/db.js`                                                   | Same logic, ESM exports                       |
| `app/utils/parseSQL.js`              | `lib/queries.js`                                              | Same logic, ESM exports                       |
| `public/index.html`                  | `app/layout.js` + `app/page.js`                               | JSX replaces HTML                             |
| `public/js/header.js`                | `components/SiteHeader.jsx`                                   | `useState` replaces addEventListener          |
| `public/js/view/renderRecords.js`    | `components/TitanLeaderboard.jsx`, `components/TitanCard.jsx` | Components replace DOM manipulation           |
| `public/js/view/renderStats.js`      | `components/TitanCard.jsx`                                    | Stats folded into TitanCard                   |
| `public/js/services/fetchRecords.js` | `app/page.js`                                                 | Server-side query replaces client fetch       |
| `public/js/services/fetchStats.js`   | `app/page.js`                                                 | Server-side query replaces client fetch       |
| `public/js/view/utils/ranking.js`    | `lib/ranking.js`                                              | Pure function, now shared via `@/lib/ranking` |
| `vercel.json` (complex)              | `vercel.json` (one line)                                      | Next.js auto-detected by Vercel               |
