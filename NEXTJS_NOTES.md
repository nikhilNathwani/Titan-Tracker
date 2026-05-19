# Next.js Notes

Personal study guide for Next.js — grounded in Titan Tracker's actual codebase.

---

## Part 1: What Problem Does Next.js Solve?

### React alone is just a UI library

React lets you build UI components, manage state, and respond to events. But it doesn't give you:

- **Routing** — React has no router. You'd add React Router yourself.
- **SSR/SSG** — By default, a React SPA renders entirely in the browser. Search engines and link previews can't easily read the content because the HTML is blank until JavaScript runs.
- **Data fetching conventions** — React doesn't tell you how to fetch data or when.
- **A server** — A raw React app is a static bundle. It has no backend.

### Next.js fills those gaps

Next.js is a **React framework**. It wraps React and adds:

| Feature | What it means |
|---|---|
| File-based routing | Files in `app/` become URL routes automatically |
| Server-side rendering (SSR) | The server renders HTML before sending it to the browser |
| Static site generation (SSG) | Pages are pre-built at deploy time into plain HTML files |
| Incremental static regeneration (ISR) | Pages rebuild themselves on a schedule without a full deploy |
| API routes | You can write backend endpoints alongside your frontend |
| Image optimization | `next/image` handles lazy loading, resizing, and format conversion |
| Font optimization | `next/font` loads Google Fonts without layout shift |

### The old way vs the Next.js way (for Titan Tracker)

Before migration, Titan Tracker was **Express + vanilla JS**:

```
Browser → requests / → Express serves index.html
         → requests /api/stats → Express queries Postgres → returns JSON
Browser JS reads JSON → builds HTML → inserts into DOM
```

After migration, it's **Next.js (SSG)**:

```
Build time: Next.js queries Postgres → renders HTML files
Deploy: Vercel serves the pre-built HTML
Browser: receives fully-rendered HTML immediately, React hydrates for interactivity
```

The page loads faster, works without JavaScript for the static content, and is fully readable by search engines.

---

## Part 2: Core Concepts

### 2.1 The App Router (the modern way)

Next.js has two routing systems. The **App Router** (`app/` directory) is the current approach. The older **Pages Router** (`pages/` directory) still works but is legacy.

In the App Router:
- `app/page.js` → renders at `/`
- `app/about/page.js` → renders at `/about`
- `app/layout.js` → a persistent shell that wraps all pages (navigation, `<html>`, `<body>`)
- `app/loading.js` → shown while the page loads (optional)
- `app/error.js` → shown if the page throws an error (optional)
- `app/api/route.js` → a serverless API endpoint at `/api`

In this project: `app/layout.js` holds the `<html>` shell and GA scripts. `app/page.js` is the entire home page.

### 2.2 Server Components vs Client Components

This is the most important concept in the App Router.

**Server Components (default)**
- Run only on the server (or at build time for SSG).
- Can be `async` — you can `await` a database query directly inside the component.
- Never sent to the browser as JavaScript. The HTML they produce is sent, but not the component code itself.
- Cannot use `useState`, `useEffect`, event handlers, or browser APIs.

**Client Components (`"use client"` at top of file)**
- Run in the browser.
- Can use React hooks, event handlers, and browser APIs.
- Their code IS sent to the browser as JavaScript.
- Cannot be `async` or directly `await` database queries.

**In Titan Tracker:**

```jsx
// app/page.js — Server Component (no "use client")
// Runs at build time, queries the DB directly
export default async function Home() {
  const result = await pool.query(winLossQuery);
  return <WinLoss {...result.rows[0]} />;
}

// components/ShareButton.jsx — Client Component
"use client";  // This directive makes it a Client Component
export default function ShareButton({ sectionId }) {
  const [copied, setCopied] = useState(false); // useState works here
  // ...
}
```

**Rule of thumb:** Make components Server Components by default. Add `"use client"` only when you need interactivity (useState, event handlers, browser APIs).

### 2.3 Rendering Strategies

| Strategy | When HTML is built | Good for |
|---|---|---|
| SSG (Static) | At build/deploy time | Blogs, docs, data that rarely changes |
| SSR (Dynamic) | On every request | User-specific pages, real-time data |
| ISR | At build time, then periodically | Data that changes but doesn't need to be instant |
| CSR | In the browser | Dashboards, admin tools, pages behind login |

**Titan Tracker uses SSG:**

```js
// app/page.js
export const dynamic = "force-static";
```

This tells Next.js: "render this page once at build time and serve the same HTML to every visitor." When new game data is added, you redeploy and the HTML is rebuilt.

### 2.4 Layouts

`app/layout.js` is the root layout. It wraps every page with persistent structure.

```jsx
// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}  {/* page.js renders here */}
      </body>
    </html>
  );
}
```

You can nest layouts. `app/dashboard/layout.js` would wrap all routes inside `app/dashboard/`.

### 2.5 The Metadata API

Instead of `<Helmet>` or manually writing `<meta>` tags, Next.js has a built-in metadata system:

```js
// app/layout.js or any page.js
export const metadata = {
  title: "My Page Title",
  description: "Description for search engines",
  openGraph: { ... },
};
```

This is the `metadata` object at the top of Titan Tracker's `layout.js`.

### 2.6 Data Fetching

In the App Router, data fetching is just `async/await` inside server components:

```jsx
// Direct DB query (what Titan Tracker does)
const result = await pool.query(winLossQuery);

// Or fetch from an API
const data = await fetch("https://api.example.com/data").then(r => r.json());
```

Next.js extends `fetch` with caching options:

```js
// Cache forever (like SSG)
fetch(url, { cache: "force-cache" });

// Never cache (like SSR, re-fetch every request)
fetch(url, { cache: "no-store" });

// Revalidate every 60 seconds (ISR)
fetch(url, { next: { revalidate: 60 } });
```

### 2.7 CSS Support

Next.js supports several styling approaches out of the box:

| Approach | File | Scope |
|---|---|---|
| Global CSS | Imported in `layout.js` | Applies everywhere |
| CSS Modules | `ComponentName.module.css` | Scoped to one component |
| Tailwind | Config in `tailwind.config.js` | Utility classes |
| CSS-in-JS | Various libraries | Per-component |

**Titan Tracker uses both:**
- `public/css/variables.css` and `public/css/base.css` — global, imported in `layout.js`
- `components/*.module.css` — scoped to each component

CSS Modules work by renaming your classes at build time (e.g., `.header` → `.SiteHeader_header__abc12`), guaranteeing no collisions. You reference them in JSX as `styles.header`.

```jsx
import styles from "./SiteHeader.module.css";
// ...
<header className={styles.header}>
```

To escape the module scope and target a global class from inside a module:
```css
.content :global(.section-share-btn) { ... }
```

---

## Part 3: When to Use Next.js

### Use Next.js when:
- **SEO matters** — your content needs to be readable by Google or generate good link previews
- **Performance matters** — faster first paint from pre-rendered HTML vs. waiting for JS to run
- **You have a database or API** — Next.js API routes or server components handle the backend cleanly
- **Content changes infrequently** — SSG is ideal; you rebuild on deploy
- **You want full-stack in one repo** — frontend and backend together, no separate Express server

### Prefer plain React (Vite/CRA) when:
- You're building a **tool/app behind login** where SEO doesn't matter
- The page is **highly dynamic** with real-time data (every request is different)
- You want a **simpler mental model** — no server/client boundary to think about
- The project is a **prototype or side project** not meant to scale

### Prefer Express when:
- You're building a **pure REST API** that serves JSON to other apps or mobile clients
- You need **fine-grained HTTP control** (custom middleware, streaming, WebSockets at scale)
- Your frontend is separate (separate React app, or mobile)

### Don't use Next.js when:
- It's a **simple static site** — use plain HTML/CSS or a static site generator like Astro
- You need **real-time features** like chat or live scores — you'd still need a WebSocket server alongside Next.js
- Your team is unfamiliar with React — Next.js adds complexity on top of React

---

## Part 4: Does Next.js Require React? Does It Require Vercel?

### Does it require React?

**Yes.** Next.js is a React framework. The whole component model (JSX, Server Components, Client Components, hooks) is React. You can't use Next.js without React.

### Does it require Vercel?

**No.** Vercel created Next.js, but they open-sourced it and it runs anywhere:

| Deployment target | How |
|---|---|
| Vercel | Zero config, automatic |
| Railway / Render / Fly.io | Node.js server, `npm run start` |
| Docker | Official Docker support |
| AWS / GCP / Azure | Node.js or serverless functions |
| Fully static export | `output: "export"` in `next.config.mjs` → pure HTML/CSS/JS |

For Titan Tracker, Vercel is used because it's free, has a great CI/CD integration, and the team that made Next.js optimizes for it. But it's not required.

---

## Part 5: TanStack and the React Ecosystem

### TanStack Query (formerly React Query)

This is a **data-fetching and caching library** for React. It's NOT a framework — it works alongside React, Next.js, Vite+React, etc.

Key features:
- Auto-refetching when the window regains focus
- Loading / error states out of the box
- Cache with stale-while-revalidate behavior
- Optimistic updates for mutations

When you'd use it: You have a dashboard that needs live data, and you don't want to write your own polling or cache logic. In Titan Tracker we don't need it because the data is static (SSG).

### TanStack Router

A type-safe router for React. An alternative to React Router, Wouter, or Next.js's built-in router. Works in any React app.

### TanStack Start

A **full-stack React framework** — Next.js's closest competitor.

| | Next.js | TanStack Start |
|---|---|---|
| Routing | File-based (app/) | TanStack Router |
| Build tool | Webpack/Turbopack | Vite |
| Rendering | Server Components + SSG/SSR | SSR + SSG |
| Vercel tie-in | Created by Vercel | None |
| Maturity | Very mature (v14+) | Still in beta (as of 2024) |
| React Server Components | Yes | Not yet (planned) |

**When to choose TanStack Start:** You want a Vite-based full-stack React framework with TanStack Router, and you don't want Vercel's ecosystem. As of now, Next.js is more production-ready and has a bigger community.

---

## Part 6: Analysis of Your Other Projects

### Titan Tracker (this project) ✅ Next.js is the right choice

- Stats are read-only, data changes only with new episode data
- SSG is perfect — page builds once, serves fast to all users
- Good for SEO (shareable link previews for the stat cards)

### NBA Moneyline — Strong migration candidate

Currently: Express + vanilla JS + pg (identical to what Titan Tracker was).

Case for Next.js migration:
- Same data pattern (PostgreSQL, read-heavy, rarely updated)
- Vanilla JS DOM manipulation → replaced with cleaner React components
- Could get SSG for free: build-time render, fast loads

### Todoist NBA Schedule Saver — Probably fine as Express

It has:
- OAuth flow (redirects to Todoist, handles callbacks)
- User-specific sessions
- Webhook-style game import logic

These are dynamic by nature. Next.js API routes _could_ handle the OAuth, but the app is a utility (not user-facing content) with no SEO need. Express is a fine fit. If you did migrate, it'd mainly be for the frontend (making the form/confirmation flow cleaner with React).

### Slidemoji — Could migrate but doesn't need to

Currently: Vite + React (SPA, no backend).

The game might benefit from SSR for initial load speed and link previews. But the real-time game state (WebSockets or polling) is the core feature, and Next.js doesn't simplify that. The current Vite setup is simpler for a game.

### Trigram — Doesn't need Next.js

Appears to be a static HTML/CSS/JS project. If it's just a simple word game with no database, pure static files are the right tool. Adding Next.js would be complexity with no payoff.

---

## Part 7: Project-Specific Architecture Notes

### What's canonical Next.js in Titan Tracker:

| Path | Next.js concept |
|---|---|
| `app/` | App Router directory |
| `app/layout.js` | Root layout |
| `app/page.js` | Home route (`/`) |
| `app/page.module.css` | Page-scoped CSS Module |
| `components/` | Shared React components (not a Next.js concept, but standard convention) |
| `components/*.module.css` | Component-scoped CSS Modules |
| `lib/` | Shared server-side utilities (DB pool, query files) |
| `public/` | Static assets (images, fonts, global CSS) — served at `/` |
| `next.config.mjs` | Next.js config file |
| `jsconfig.json` | Path aliases (`@/` → project root) |
| `vercel.json` | Vercel deployment config |

### What's project-specific (not Next.js convention):

| Path | What it is |
|---|---|
| `data/` | SQL seed scripts for the database |
| `app/queries/` | Raw SQL files loaded at build time |
| `lib/queries.js` | Loads SQL files and exports query strings |
| `NEXTJS_NOTES.md` | This file |
| `INTERVIEW_STORIES.md` | Behavioral interview prep |

### Express.js relics still present:

| Path | Status | Action |
|---|---|---|
| `public/js/` | Unused vanilla JS from Express era | Safe to delete with `git rm -r public/js/` |
| `public/index.html` | Unused static HTML from Express era | Safe to delete with `git rm public/index.html` |

Neither file is imported or served by the Next.js app. They're dead code.

---

## Part 8: Interview Prep

### "What is Next.js?"

> Next.js is a React framework that adds file-based routing, server-side rendering, static site generation, and API routes on top of React. I used it for Titan Tracker to pre-render the stats page at build time, so every visitor gets fast, SEO-friendly HTML without waiting for JavaScript to run.

### "What's the difference between SSR and SSG?"

> SSR (Server-Side Rendering) renders the page HTML on the server for every request. SSG (Static Site Generation) renders the page once at build time, and every user gets the same pre-built file. SSG is faster and cheaper for content that doesn't change per user. I use SSG in Titan Tracker because the stats only change when new episode data is deployed.

### "What are React Server Components?"

> Server Components are React components that render only on the server (or at build time). They can be async and directly query a database. Their code is never sent to the browser — only the HTML output is. This is different from traditional SSR (like getServerSideProps in the old Pages Router) because each component can independently fetch its own data.

### "When would you use `"use client"`?"

> I add `"use client"` when a component needs browser-specific features: `useState`, `useEffect`, event handlers, or APIs like `navigator.share`. For example, my `ShareButton` component triggers the native share sheet on mobile or copies a URL to the clipboard — both of which require browser APIs, so it's a Client Component. Everything else in Titan Tracker is a Server Component.

### "What's the difference between dynamic and static rendering in Next.js?"

> Static rendering (SSG) pre-builds pages at deploy time. Dynamic rendering re-renders on each request. In Next.js App Router, you can force a page to be static with `export const dynamic = "force-static"`. If you use `cookies()`, `headers()`, or `searchParams` inside a page, Next.js automatically makes it dynamic. I use `force-static` in Titan Tracker because all stats are the same for every visitor.

### "How does data fetching work in the App Router?"

> In a Server Component, you can `await` a database query or `fetch()` call directly in the component body. There's no `getStaticProps` or `getServerSideProps` anymore — it's just `async/await` at the top of the component. Next.js extends the native `fetch` API with caching options like `{ cache: "force-cache" }` for static behavior or `{ next: { revalidate: 60 } }` for ISR.

### "What's the difference between the App Router and Pages Router?"

> The Pages Router is the original Next.js routing system. Pages are files in `pages/`, data fetching uses `getStaticProps`/`getServerSideProps`, and everything is a Client Component by default. The App Router (introduced in Next.js 13) is the modern system. It uses `app/`, supports React Server Components natively, collocates layouts and loading states, and is the recommended approach for new projects.

### "Does Next.js require Vercel?"

> No. Vercel created Next.js but it's fully open source and can run on any Node.js server. I could deploy Titan Tracker to Railway, Render, a Docker container, or a plain VPS. I use Vercel because it has seamless CI/CD integration and zero-config deployment for Next.js.

### What Titan Tracker demonstrates on your resume:

- **SSG with database queries** at build time (`app/page.js` with `force-static`)
- **React Server Components** — async page component that directly queries PostgreSQL
- **Client Components** — `ShareButton.jsx` and `SiteHeader.jsx` with `"use client"`
- **CSS Modules** — scoped styles in `components/*.module.css`
- **Root Layout** — `app/layout.js` with metadata API and Google Analytics
- **App Router** — file-based routing with `app/page.js`
- **Path aliases** — `@/` configured via `jsconfig.json`
- **Vercel deployment** — `vercel.json` config, `main` branch triggers deploys
