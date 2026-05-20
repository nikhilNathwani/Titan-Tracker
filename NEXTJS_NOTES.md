# Next.js Notes

Personal study guide for Next.js — grounded in Titan Tracker's actual codebase.

---

## Part 1: What Problem Does Next.js Solve?

### React alone is just a UI library

React lets you build UI components, manage state, and respond to events. But it doesn't give you:

- **Routing** — React has no router. You'd add React Router yourself.

  > **Q:** What is routing? Is it just enabling sub-URLs like a sitemap?
  >
  > **A:** Routing maps URLs to the code that should run when someone visits them. It's much more than a sitemap (which just lists URLs for search engines) — routing is what decides "user went to `/about`, so run *this* code." In Next.js, routing is file-based: creating `app/about/page.js` automatically makes `/about` work, no manual wiring needed.

- **SSR/SSG** — By default, a React SPA renders entirely in the browser. Search engines and link previews can't easily read the content because the HTML is blank until JavaScript runs.
- **Data fetching conventions** — React doesn't tell you how to fetch data or when.

  > **Q:** Does "data fetching" refer to the CSR/SSR/SSG stuff?
  >
  > **A:** They're closely linked but different. Data fetching is *how and when* you retrieve data (from a DB, an API, etc.). CSR/SSR/SSG determine *where* HTML is built. The rendering strategy dictates when fetching happens: SSG fetches at build time, SSR fetches on every server request, CSR fetches in the browser after JavaScript loads.

- **A server** — A raw React app is a static bundle. It has no backend.

  > **Q:** What does "static bundle" mean? How does this compare to Titan Tracker vs. NBA Moneyline?
  >
  > **A:** A static bundle is what a plain React (Vite/CRA) app produces: a folder of JS files where the HTML is nearly empty (`<div id="root"></div>`). React fills that div by running JavaScript in the browser. In the old NBA Moneyline (Express): browser loads empty HTML → downloads JS → JS calls `/api/stats` → waits → builds DOM. In Titan Tracker (Next.js SSG): `npm run build` pre-renders complete HTML with all data already inside it. Users receive the full page immediately.

### Next.js fills those gaps

Next.js is a **React framework**. It wraps React and adds:

| Feature                               | What it means                                                      |
| ------------------------------------- | ------------------------------------------------------------------ |
| File-based routing                    | Files in `app/` become URL routes automatically                    |
| Server-side rendering (SSR)           | The server renders HTML before sending it to the browser           |
| Static site generation (SSG)          | Pages are pre-built at deploy time into plain HTML files           |
| Incremental static regeneration (ISR) | Pages rebuild themselves on a schedule without a full deploy       |
| API routes                            | You can write backend endpoints alongside your frontend            |
| Image optimization                    | `next/image` handles lazy loading, resizing, and format conversion |
| Font optimization                     | `next/font` loads Google Fonts without layout shift                |

> **Q:** Should I use `next/image` and `next/font`? Do I already use them?
>
> **A:** You're not using either yet. Both are worth switching to:
> - **`next/image`**: replace plain `<img>` tags (used for titan avatars). Gets you automatic lazy loading, WebP conversion, and prevents layout shift by requiring explicit `width`/`height`.
> - **`next/font`**: replace the Google Fonts `<link>` tag in `layout.js`. Inlines font data at build time, eliminating the external Google Fonts request and preventing flash of unstyled text (FOUT).

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

> **Q:** Could I have achieved faster loads with CSR by optimizing queries (e.g., `Promise.all` instead of 5 separate round trips)?
>
> **A:** Optimizing queries would help, but CSR has an unavoidable waterfall: (1) download HTML, (2) download + parse JS, (3) fetch data (even in parallel), (4) render DOM. SSG collapses all four into one — the browser receives complete HTML immediately. Even perfectly optimized CSR still requires two network round trips that SSG eliminates entirely.

---

## Part 2: Core Concepts

### 2.1 The App Router (the modern way)

Next.js has two routing systems. The **App Router** (`app/` directory) is the current approach. The older **Pages Router** (`pages/` directory) still works but is legacy.

In the App Router:

- `app/page.js` → renders at `/`
- `app/about/page.js` → renders at `/about`
- `app/layout.js` → a persistent shell that wraps all pages (navigation, `<html>`, `<body>`)

  > **Q:** Should `SiteHeader` (hamburger nav) live in `layout.js` since it persists across pages?
  >
  > **A:** Yes, ideally. Right now it's in `page.js` because there's only one route. If you add a second page (e.g., `/about`), move `SiteHeader` to `layout.js` so it appears everywhere automatically without duplicating it.
- `app/loading.js` → shown while the page loads (optional)
- `app/error.js` → shown if the page throws an error (optional)

  > **Q:** Should I add `app/loading.js` and `app/error.js`?
  >
  > **A:** For Titan Tracker as-is (SSG, single page): not critical. `loading.js` is for pages with async data that takes time — since the page builds at deploy time, visitors never wait. `app/error.js` is worth adding if you want a polished fallback instead of Next.js's default crash page. For a multi-page production app, both become more important.
- `app/api/route.js` → a serverless API endpoint at `/api`

  > **Q:** What is this? What does "serverless" mean? Do I use it in Titan Tracker? Earlier you said React doesn't give you a server, but now we're talking about *server*less?
  >
  > **A:** An API route is a file that returns data (JSON, etc.) instead of HTML — like an Express handler but colocated in your Next.js app. "Serverless" means there's no permanent server process: Vercel spins up a temporary function per request, runs it, and shuts it down. You never manage a server — just write the function.
  >
  > Titan Tracker has **no API routes** because data is fetched once at build time (SSG) and the resulting HTML is static. There's nothing to serve at runtime. You'd add API routes only if users needed to submit data or if you needed fresh data on each request.
  >
  > The "server vs serverless" confusion: React alone = no backend code at all. Next.js = you *can* run backend code, either in Server Components (at build time for SSG) or in API routes (on-demand as serverless functions). "Serverless" doesn't mean no server — it means you don't manage the server infrastructure.

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

> **Q:** Are Server/Client Components also "routes"? What's the difference between a route and a component? Don't some components in Titan Tracker correspond to routes?
>
> **A:** Routes and components are different things. A **route** is a URL — only files named `page.js` or `route.js` inside `app/` are routes. A **component** (`TitanCard`, `WinLoss`, `ShareButton`) is a piece of UI — it has no URL and is rendered by a route. In Titan Tracker, the only route is `/` (handled by `app/page.js`). Everything in `components/` is just UI built by that one route. The `#Brooke-Williamson`-style links are HTML fragment identifiers that scroll the page — they're not routes.

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

| Strategy      | When HTML is built               | Good for                                         |
| ------------- | -------------------------------- | ------------------------------------------------ |
| SSG (Static)  | At build/deploy time             | Blogs, docs, data that rarely changes            |
| SSR (Dynamic) | On every request                 | User-specific pages, real-time data              |
| ISR           | At build time, then periodically | Data that changes but doesn't need to be instant |
| CSR           | In the browser                   | Dashboards, admin tools, pages behind login      |

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
				{children} {/* page.js renders here */}
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

> **Q:** "app/layout.js or any page.js" — does it matter which one you put metadata into?
>
> **A:** It matters because of scope. `metadata` in `layout.js` applies to every page under that layout. `metadata` in a specific `page.js` applies only to that route and overrides the layout's metadata for that page. Pattern: put default/site-wide metadata in `layout.js`, put page-specific overrides in each `page.js`. In Titan Tracker (one page), they're effectively equivalent — the current approach (all in `layout.js`) is correct.

This is the `metadata` object at the top of Titan Tracker's `layout.js`.

### 2.6 Data Fetching

In the App Router, data fetching is just `async/await` inside server components:

```jsx
// Direct DB query (what Titan Tracker does)
const result = await pool.query(winLossQuery);

// Or fetch from an API
const data = await fetch("https://api.example.com/data").then((r) => r.json());
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

| Approach    | File                           | Scope                   |
| ----------- | ------------------------------ | ----------------------- |
| Global CSS  | Imported in `layout.js`        | Applies everywhere      |
| CSS Modules | `ComponentName.module.css`     | Scoped to one component |
| Tailwind    | Config in `tailwind.config.js` | Utility classes         |
| CSS-in-JS   | Various libraries              | Per-component           |

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

  > **Q:** Should I migrate NBA Moneyline to Next.js? What about Todoist NBA Schedule Saver?
  >
  > **A:** **NBA Moneyline**: yes, strong candidate. Same pattern as Titan Tracker — PostgreSQL, read-heavy, rarely updated. The migration would be nearly identical.
  > **Todoist NBA Schedule Saver**: probably not. It's a utility app with OAuth flows, user-specific sessions, and webhook-style imports — all dynamic by nature and with no SEO need. Express is actually a clean fit. If anything, migrate the frontend form to React for cleaner UI code, but keep Express for the logic.
- **Content changes infrequently** — SSG is ideal; you rebuild on deploy
- **You want full-stack in one repo** — frontend and backend together, no separate Express server

  > **Q:** Didn't I already have Express and frontend in one repo? Isn't that what NBA Moneyline and the Schedule Saver also have?
  >
  > **A:** Yes — the folder structure is the same. The distinction is the *runtime architecture*. With Express: a server process runs permanently, serves files from `public/`, and handles routes separately from your HTML. With Next.js: everything compiles into a single build artifact that Vercel runs as one coherent unit — React components, SSG, API routes, and routing are all part of the same system, not "static files over here, Express over there."

### Prefer plain React (Vite/CRA) when:

> **Q:** Where does Vite fit in all of this? What kind of tool/service is it?
>
> **A:** Vite is a **build tool** — it bundles your JavaScript, runs a fast dev server with hot-reload, and produces the final output files for deployment. It doesn't add routing or a backend; it just processes and bundles your code. Slidemoji uses Vite to bundle React into browser-ready files. Next.js has its own built-in build pipeline (Webpack, being replaced by Turbopack), so you don't add Vite separately to a Next.js project. Think of Vite as: "I want to use React but don't need a full-stack framework."

- You're building a **tool/app behind login** where SEO doesn't matter
- The page is **highly dynamic** with real-time data (every request is different)
- You want a **simpler mental model** — no server/client boundary to think about
- The project is a **prototype or side project** not meant to scale

### Prefer Express when:

- You're building a **pure REST API** that serves JSON to other apps or mobile clients
- You need **fine-grained HTTP control** (custom middleware, streaming, WebSockets at scale)

  > **Q:** What are WebSockets? Do any of my projects need them or already use them?
  >
  > **A:** HTTP is request/response — browser asks, server answers, connection closes. WebSockets are a persistent two-way connection — the server can push data to the browser at any time without being asked. Used for: live chat, live sports scores, collaborative editing, multiplayer games.
  >
  > Slidemoji uses Firestore's `onSnapshot()` real-time listeners, which is Firebase's abstraction over a WebSocket-like persistent connection. You don't write WebSocket code directly — Firebase handles it. Titan Tracker doesn't need WebSockets (static data). None of your other projects use them.
- Your frontend is separate (separate React app, or mobile)

### Don't use Next.js when:

- It's a **simple static site** — use plain HTML/CSS or a static site generator like Astro

  > **Q:** When is Astro better than vanilla? Would Trigram benefit from Astro?
  >
  > **A:** The break-even point for Astro over vanilla: you have multiple pages needing a shared layout, you want a build pipeline without writing your own, or you want to use React/Vue components in an otherwise static site. Trigram is likely a single-page word game with JS state — vanilla is the right call. Astro would add build tooling overhead with no real payoff for a self-contained single-page app.
- You need **real-time features** like chat or live scores — you'd still need a WebSocket server alongside Next.js
- Your team is unfamiliar with React — Next.js adds complexity on top of React

---

## Part 4: Does Next.js Require React? Does It Require Vercel?

### Does it require React?

**Yes.** Next.js is a React framework. The whole component model (JSX, Server Components, Client Components, hooks) is React. You can't use Next.js without React.

### Does it require Vercel?

**No.** Vercel created Next.js, but they open-sourced it and it runs anywhere:

| Deployment target         | How                                                        |
| ------------------------- | ---------------------------------------------------------- |
| Vercel                    | Zero config, automatic                                     |
| Railway / Render / Fly.io | Node.js server, `npm run start`                            |
| Docker                    | Official Docker support                                    |
| AWS / GCP / Azure         | Node.js or serverless functions                            |
| Fully static export       | `output: "export"` in `next.config.mjs` → pure HTML/CSS/JS |

> **Q:** What is Docker? Docker vs. Vercel?
>
> **A:** Docker packages your application and all its dependencies (the right Node version, npm packages, system libraries) into a self-contained "container" that runs identically anywhere — your laptop, AWS, a coworker's machine. You build a Docker image once and run it anywhere.
>
> Vercel is a **hosting platform** optimized for web apps. Docker is a **packaging and deployment tool** for when you need to run your app on your own infrastructure (AWS EC2, a company's private servers, etc.). For most web projects, Vercel/Railway/Render are simpler. Docker is for when you need custom system-level dependencies or you're deploying to infrastructure you control.

For Titan Tracker, Vercel is used because it's free, has a great CI/CD integration, and the team that made Next.js optimizes for it. But it's not required.

### Is Next.js part of Node.js?

**No, but it runs on top of Node.js.** Think of it this way:

> **Q:** Why did it take so long for JavaScript to run on the server? Python/Django and Ruby/Rails already existed.
>
> **A:** JavaScript was created in 1995 specifically for browsers — it was intentionally sandboxed with no file system access or networking. Python (1991) and Ruby (1995) were general-purpose languages from day one, designed to run on the command line and do anything. Node.js (2009) was Ryan Dahl's insight: take Chrome's V8 JavaScript engine (which Google had made very fast and open-sourced), and wrap it with file system access and networking APIs. The timing was also right — JavaScript's event loop model (non-blocking I/O) turned out to be excellent for I/O-heavy server code.

- **Node.js** is the JavaScript runtime — the engine that lets JavaScript run outside the browser. It's like the JVM for Java, or the Python interpreter for Python.
- **npm** is Node's package manager — how you install libraries and run scripts.
- **Next.js** is a framework that runs _inside_ Node.js, the same way Django runs inside Python or Rails runs inside Ruby.

```
Node.js (runtime)
  └── Next.js (framework, runs as a Node.js process)
        └── React (UI library, bundled by Next.js)
```

When you run `npm run dev`, Node.js starts a process that runs the Next.js dev server. When you run `npm run build`, Node.js runs the Next.js build pipeline. Node.js is the foundation; Next.js is what you build with.

### How do you create a new Next.js project?

**You don't set up the file structure manually.** One command scaffolds everything:

```bash
npx create-next-app@latest my-project
```

> **Q:** What is `npx`? Is it different from `npm`?
>
> **A:** `npm` installs packages and runs scripts defined in `package.json`. `npx` *runs* a package as a CLI tool without permanently installing it. `npx create-next-app@latest` downloads and runs the scaffolding tool once, then discards it — it doesn't end up in your `node_modules` or `package.json`. This is the standard pattern for one-time setup tools.

The CLI prompts you: TypeScript? Tailwind? App Router or Pages Router? ESLint? — and generates a project configured to your answers:

```
my-project/
├── app/
│   ├── layout.js
│   ├── page.js
│   └── globals.css
├── public/
├── next.config.mjs
├── package.json
└── jsconfig.json
```

The `app/` directory, the root layout, the global CSS import, the `jsconfig.json` path alias — all generated for you.

Titan Tracker was an existing Express app before migrating to Next.js, so the migration was manual (moving SQL queries into `lib/`, rewriting the Express routes as Server Components, etc.). But for a fresh project, `create-next-app` is the standard starting point and sets up all the boilerplate.

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

|                         | Next.js                     | TanStack Start             |
| ----------------------- | --------------------------- | -------------------------- |
| Routing                 | File-based (app/)           | TanStack Router            |
| Build tool              | Webpack/Turbopack           | Vite                       |
| Rendering               | Server Components + SSG/SSR | SSR + SSG                  |
| Vercel tie-in           | Created by Vercel           | None                       |
| Maturity                | Very mature (v14+)          | Still in beta (as of 2024) |
| React Server Components | Yes                         | Not yet (planned)          |

> **Q:** What is a "build tool"? What is Webpack?
>
> **A:** A build tool takes your source code (JSX, TypeScript, CSS Modules, imports, etc.) and transforms it into browser-compatible files. It transpiles JSX to plain JS, bundles hundreds of small files into a few larger ones (fewer HTTP requests), minifies code (removes whitespace, shortens variable names), and handles non-JS imports like CSS and images. Webpack was the dominant bundler for ~10 years (2014–2024) — powerful but famously slow to configure and build. Vite is the modern alternative: much faster, simpler config. Next.js uses Webpack internally, transitioning to Turbopack (their own Webpack replacement).

> **Q:** Can't I host a TanStack Start project on Vercel?
>
> **A:** You can. Vercel supports any Node.js app — it's not limited to Next.js. The difference is that Next.js gets special Vercel-native optimizations (Edge Functions, automatic ISR, the Image Optimization API). TanStack Start on Vercel would work fine, just without those extras.

**When to choose TanStack Start:** You want a Vite-based full-stack React framework with TanStack Router, and you don't want Vercel's ecosystem. As of now, Next.js is more production-ready and has a bigger community.

---

## Part 6: Analysis of Your Other Projects

### Titan Tracker (this project) ✅ Next.js is the right choice

- Stats are read-only, data changes only with new episode data
- SSG is perfect — page builds once, serves fast to all users
- Good for SEO (shareable link previews for the stat cards)

  > **Q:** What are "shareable link previews"?
  >
  > **A:** When you paste a URL into iMessage, Twitter, Slack, or Discord, a preview card appears — title, description, and an image. This is driven by Open Graph `<meta>` tags in the page's HTML. For SSG/SSR pages, those tags are in the HTML when the platform fetches the URL. For a plain React SPA (empty HTML until JS runs), platforms can't read the tags and the preview fails or shows nothing. The `openGraph` block in Titan Tracker's `layout.js` `metadata` is what makes link previews work.

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

> **Q:** Would SSR even be possible for Slidemoji, given that emoji SVGs are platform-specific?
>
> **A:** Good catch — this is a real concern. Emoji rendering is platform-specific (Apple emoji look different from Google emoji). SSR would render emoji using the server's font system, which might look different from what the user's device shows. For a game where emoji appearance is core to the UX, CSR (render entirely in the browser) is actually more correct — the user sees exactly what their device renders.

> **Q:** "Real-time game state (WebSockets or polling)" — do I use WebSockets in Slidemoji? Where/how?
>
> **A:** Slidemoji uses Firestore's `onSnapshot()` real-time listeners, not raw WebSockets. You call `onSnapshot(docRef, callback)` and Firebase maintains a persistent connection internally, calling your callback whenever the document changes. You write JavaScript event listeners; Firebase handles the underlying connection. No WebSocket code directly.

### Trigram — Doesn't need Next.js

Appears to be a static HTML/CSS/JS project. If it's just a simple word game with no database, pure static files are the right tool. Adding Next.js would be complexity with no payoff.

> **Q:** What about React or Astro for Trigram?
>
> **A:** React is overkill for a word game unless you plan significant complexity (multiplayer, leaderboards, user accounts) — vanilla JS handles simple game state well. Astro only makes sense if you have multiple pages needing a shared layout or want a build pipeline — a single-page game doesn't need either. Trigram is a clean case where vanilla is the right answer.

---

## Part 7: Project-Specific Architecture Notes

### What's canonical Next.js in Titan Tracker:

| Path                      | Next.js concept                                                          |
| ------------------------- | ------------------------------------------------------------------------ |
| `app/`                    | App Router directory                                                     |
| `app/layout.js`           | Root layout                                                              |
| `app/page.js`             | Home route (`/`)                                                         |
| `app/page.module.css`     | Page-scoped CSS Module                                                   |
| `components/`             | Shared React components (not a Next.js concept, but standard convention) |
| `components/*.module.css` | Component-scoped CSS Modules                                             |
| `lib/`                    | Shared server-side utilities (DB pool, query files)                      |
| `public/`                 | Static assets (images, fonts, global CSS) — served at `/`                |
| `next.config.mjs`         | Next.js config file                                                      |
| `jsconfig.json`           | Path aliases (`@/` → project root)                                       |
| `vercel.json`             | Vercel deployment config                                                 |

> **Q:** Where is the `/api` folder? Do we not need one for Titan Tracker?
>
> **A:** Titan Tracker has no `app/api/` folder and doesn't need one. The database is queried once at build time (SSG) and the results are baked into static HTML. There's no browser-side JavaScript that calls an API at runtime. You'd create `app/api/something/route.js` only if you needed a route that runs at request time — e.g., users submitting scores, or data that must be fresh on every visit.

> **Q:** Was I already doing connection pooling? Was I really doing 5 separate DB round trips before?
>
> **A:** Yes, the current `lib/db.js` uses `pg`'s `Pool`, which reuses connections — that's correct. The "5 round trips" referred to the old Express/CSR era: the browser made 5 separate HTTP requests to the server (one per data type: win-loss, titan records, avg scores, best scores, per-round stats). Now, `app/page.js` runs a single `Promise.all()` with all 5 queries in parallel at build time — one batch, and it only runs once at deploy, not on every page load.

> **Q:** "`public/` — served at `/`" — but `app/page.js` is also served at `/`?
>
> **A:** These are different things served at different paths. The `public/` prefix is *stripped* from the URL: `public/css/base.css` is served at `/css/base.css`, and `public/img/avatar.jpg` is served at `/img/avatar.jpg`. No file in `public/` lives at the root URL `/`. Only `app/page.js` responds to the exact path `/`. They don't conflict.

### What's project-specific (not Next.js convention):

| Path                   | What it is                                                                                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data/`                | SQL seed scripts for the database                                                                                                                                      |
| `app/queries/`         | Raw SQL files loaded at build time                                                                                                                                     |
| `lib/queries.js`       | Loads SQL files and exports query strings                                                                                                                              |
| `NEXTJS_NOTES.md`      | This file                                                                                                                                                              |
| `INTERVIEW_STORIES.md` | Behavioral interview prep                                                                                                                                              |

> **Q:** What's the difference between `data/` and `app/queries/`? Do I need both?
>
> **A:** Yes, they serve different purposes. `data/` contains SQL `INSERT`/`UPDATE` scripts for managing the database — run manually to seed or update episode data. They're not part of the app code at all. `app/queries/` contains SQL `SELECT` queries the Next.js app runs at build time when rendering the page. One populates the database; the other reads from it.

> **Q:** Loading SQL from `.sql` files via `lib/queries.js` — is this unconventional? How do most Next.js developers manage SQL queries?
>
> **A:** Most Next.js developers use an ORM like Prisma or Drizzle, which lets you write queries in TypeScript instead of raw SQL files. Example with Prisma: `const titans = await prisma.titan.findMany({ include: { rounds: true } })`. Your raw SQL approach isn't wrong — it actually gives you more control for complex analytics queries (aggregations, window functions for rankings). For a typical CRUD app, Prisma would be simpler. For stats/analytics like Titan Tracker, raw SQL is a defensible and common choice.

### Express.js relics still present:

| Path                | Status                              | Action                                         |
| ------------------- | ----------------------------------- | ---------------------------------------------- |
| `public/js/`        | Unused vanilla JS from Express era  | Safe to delete with `git rm -r public/js/`     |
| `public/index.html` | Unused static HTML from Express era | Safe to delete with `git rm public/index.html` |

Neither file is imported or served by the Next.js app. They're dead code.

---

## Part 8: Interview Prep

### "What is Next.js?"

> Next.js is a React framework that adds file-based routing, server-side rendering, static site generation, and API routes on top of React. I used it for Titan Tracker to pre-render the stats page at build time, so every visitor gets fast, SEO-friendly HTML without waiting for JavaScript to run.

### "What's the difference between SSR and SSG?"

> SSR (Server-Side Rendering) renders the page HTML on the server for every request. SSG (Static Site Generation) renders the page once at build time, and every user gets the same pre-built file. SSG is faster and cheaper for content that doesn't change per user. I use SSG in Titan Tracker because the stats only change when new episode data is deployed.

> **Q:** What does "every request" vs "at build time" mean? Explain as if I'm a novice.
>
> **A:** "Build time" = before anyone visits. You run `npm run build`. Next.js runs all your code, queries the database, renders HTML files, and saves them to disk. These files never change until you build again. Think of it like printing a newspaper in bulk in the morning — everyone gets the same paper, it's fast to hand out, but it's fixed until the next print run.
>
> "Every request" = each time someone visits the URL. The server runs your code fresh, queries the database for up-to-date data, renders HTML, and sends it back. Like a newspaper printed individually for each reader — always current, but slower.

### "What are React Server Components?"

> Server Components are React components that render only on the server (or at build time). They can be async and directly query a database. Their code is never sent to the browser — only the HTML output is. This is different from traditional SSR (like getServerSideProps in the old Pages Router) because each component can independently fetch its own data.

### "When would you use `"use client"`?"

> I add `"use client"` when a component needs browser-specific features: `useState`, `useEffect`, event handlers, or APIs like `navigator.share`. For example, my `ShareButton` component triggers the native share sheet on mobile or copies a URL to the clipboard — both of which require browser APIs, so it's a Client Component. Everything else in Titan Tracker is a Server Component.

### "What's the difference between dynamic and static rendering in Next.js?"

> Static rendering (SSG) pre-builds pages at deploy time. Dynamic rendering re-renders on each request. In Next.js App Router, you can force a page to be static with `export const dynamic = "force-static"`. If you use `cookies()`, `headers()`, or `searchParams` inside a page, Next.js automatically makes it dynamic. I use `force-static` in Titan Tracker because all stats are the same for every visitor.

> **Q:** Where does `export const dynamic = "force-static"` go in the file?
>
> **A:** Top of the file, before the component function, alongside other named exports. In `app/page.js` it sits right after the imports:
> ```js
> export const dynamic = "force-static";
>
> export default async function Home() { ... }
> ```

### "How does data fetching work in the App Router?"

> In a Server Component, you can `await` a database query or `fetch()` call directly in the component body. There's no `getStaticProps` or `getServerSideProps` anymore — it's just `async/await` at the top of the component. Next.js extends the native `fetch` API with caching options like `{ cache: "force-cache" }` for static behavior or `{ next: { revalidate: 60 } }` for ISR.

> **Q:** Do I use `await` or `fetch`? When to use one vs the other?
>
> **A:** `await` and `fetch` are different things. `await` is JavaScript syntax for waiting for any async operation. `fetch` is a function for making HTTP requests to external APIs. Titan Tracker uses `await pool.query()` — a direct database connection. You don't need `fetch` here because you're running server-side code with direct DB access. Use `fetch` when calling an external REST API (like the Todoist API). Use `pool.query()` or an ORM when querying a database directly.

> **Q:** Are we using Next.js's extended `fetch` with caching? Why aren't we doing ISR?
>
> **A:** No — Titan Tracker uses `pool.query()`, not `fetch`. The caching extensions only apply to `fetch` calls, not `pg` pool queries. ISR isn't used because Titan Tracker's data only changes when a new episode airs and you manually update the database — ISR is for data that updates automatically on a schedule. Since updates require a manual data + code deploy anyway, a full rebuild is the right approach.

> **Q:** What are `getStaticProps` and `getServerSideProps`? Do I need to know them?
>
> **A:** These were the old Pages Router's data-fetching functions. In old Next.js (`pages/` directory), you'd export a special function `getStaticProps()` that fetched data and returned it as props to the page component. The App Router replaced this — you just `await` directly in the component body. You should know what they are (you'll encounter them in tutorials and legacy codebases), but you don't use them in new Next.js projects.

### "What's the difference between the App Router and Pages Router?"

> The Pages Router is the original Next.js routing system. Pages are files in `pages/`, data fetching uses `getStaticProps`/`getServerSideProps`, and everything is a Client Component by default. The App Router (introduced in Next.js 13) is the modern system. It uses `app/`, supports React Server Components natively, collocates layouts and loading states, and is the recommended approach for new projects.

> **Q:** What does "collocates layouts and loading states" mean? What does it look like *without* collocation?
>
> **A:** Collocation = keeping related files next to each other. In the App Router, all files for a route live together in one folder:
> ```
> app/dashboard/
>   page.js      ← the page
>   layout.js    ← the layout that wraps it
>   loading.js   ← shown while it loads
>   error.js     ← shown if it crashes
> ```
> Without collocation (old Pages Router), layout was a separate component you manually imported, error pages lived in `pages/_error.js` globally, and there was no per-route loading state. The App Router makes the relationship explicit by folder structure.

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
- **App Router** — file-based routing with `app/page.js`

  > **Q:** Am I using the App Router if Titan Tracker is just one page with no sub-URLs?
  >
  > **A:** Yes. Having one route doesn't mean you're not using the routing system — the `app/` directory, `app/layout.js`, and `app/page.js` are all App Router features. If you ever add `/about`, you just create `app/about/page.js` and Next.js handles it automatically.

- **Path aliases** — `@/` configured via `jsconfig.json`

  > **Q:** What is the `@/` path alias? How am I using it? What would it look like without it?
  >
  > **A:** A path alias lets you import using a short prefix instead of relative paths. Without it: `import { pool } from "../../../lib/db"` (the `../` chain grows longer depending on how deep your file is). With `@/`: `import { pool } from "@/lib/db"` always means "from the project root." Configured in `jsconfig.json` as `{ "paths": { "@/*": ["./*"] } }`. Used throughout `app/page.js` and all components.

---

## Part 9: Firebase — BaaS vs Framework

### What is Firebase?

Firebase is **Backend as a Service (BaaS)** — a suite of hosted backend infrastructure from Google. You don't manage servers, databases, or auth systems yourself; you call Firebase SDKs from your app and the infrastructure runs on Google's cloud.

| Service               | What it does                                                                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Firestore**         | NoSQL document database with real-time sync                                                                                                        |
| **Realtime Database** | Simpler JSON tree database (older; prefer Firestore for new projects)                                                                              |
| **Authentication**    | Sign-in with email, Google, GitHub, Apple, etc.                                                                                                    |
| **Storage**           | File uploads (images, video, PDFs)                                                                                                                 |
| **Hosting**           | Static web hosting with a CDN                                                                                                                      |
| **Functions**         | Serverless functions triggered by events or HTTP                                                                                                   |
| **Emulator Suite**    | Runs all services locally so you don't need a live project to develop                                                                              |

> **Q:** Firebase Hosting — what is it? Is it different from Vercel? What's a CDN?
>
> **A:** A CDN (Content Delivery Network) copies your files to servers worldwide. Users in Tokyo get files from a Tokyo server, not Virginia. Both Vercel and Firebase Hosting use global CDNs — they're different products (Vercel is optimized for Next.js, Firebase Hosting is Firebase-native), but both deliver files fast globally.

> **Q:** Firebase Functions — what are they? Does Vercel have something equivalent? Does Slidemoji need both Vercel and Firebase?
>
> **A:** Firebase Functions are serverless Node.js functions deployed to Google Cloud, triggered by HTTP requests, Firestore events, or auth events. Vercel also has serverless functions (that's what Next.js API routes compile to). Slidemoji does **not** need both — it uses Firebase's full stack: Firebase Hosting for the frontend, Firebase Functions for server logic, Firestore for data. Vercel isn't involved.

### Firebase vs Next.js — not competitors

These tools live at different layers of the stack. **Next.js is a UI/routing/API framework**. **Firebase is backend infrastructure**. You can and often do use them together:

```
User → Next.js (routing, SSR, UI) → Firebase Auth  (who is this user?)
                                  → Firestore      (what's their data?)
                                  → Storage        (their uploads)
```

Slidemoji is a Firebase-native app: the whole backend is Firebase services (Firestore for game state, Auth for user accounts). Titan Tracker is a Next.js + PostgreSQL app: the framework handles routing and rendering, and a traditional SQL database handles data.

> **Q:** What does "Firebase-native" mean vs. non-native?
>
> **A:** "Firebase-native" means the app was designed around Firebase's specific features and architecture. The frontend calls the Firebase SDK directly, data is structured for Firestore's document model, auth uses Firebase tokens, and security rules run on Google's servers. A "non-native" use of Firebase would be: a Next.js app that uses Firebase only for Auth, but stores data in PostgreSQL and deploys to Vercel. Slidemoji is native because the entire backend is Firebase.

### Firebase Hosting vs Vercel

These ARE competitors:

|                 | Firebase Hosting                   | Vercel                                                                                                                |
| --------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Best for        | Firebase-native apps, static sites | Next.js, React/Vue apps                                                                                               |
| Next.js support | Basic (needs workarounds for SSR)  | First-class (made by same team)                                                                                       |
| CDN             | Global                             | Global                                                                                                                |
| Preview deploys | Yes                                | Yes                                                                                                                   |
| CI/CD           | GitHub Actions or Firebase CLI     | Automatic on push                                                                                                     |

> **Q:** Which is better for Slidemoji — Firebase Hosting or Vercel, given it's a React frontend?
>
> **A:** Firebase Hosting. Even though Slidemoji is React, it's Firebase-native — Auth tokens, Functions, and Firestore security rules all integrate more tightly when the frontend is also on Firebase's infrastructure. Vercel would technically work, but you'd lose integration benefits.

> **Q:** "CDN | Global" in the table — what does that mean?
>
> **A:** Both platforms have servers in many regions worldwide. Users always hit a nearby server for fast file delivery. "Global CDN" is a baseline feature of both — not a real differentiator.

> **Q:** What are Preview Deploys? How do I use them?
>
> **A:** When you push any branch to GitHub (not `main`), Vercel automatically deploys it to a unique URL like `titan-tracker-git-my-feature.vercel.app`. You can review and share that URL before merging. You're already getting this for free — every branch push shows up in your Vercel dashboard under Deployments. No setup needed.

For a Next.js app → Vercel. For a Firebase-native app → Firebase Hosting.

### Firestore vs PostgreSQL

|           | Firestore                                           | PostgreSQL (Titan Tracker)                   |
| --------- | --------------------------------------------------- | -------------------------------------------- |
| Type      | NoSQL document DB                                   | Relational (SQL)                             |
| Schema    | Schema-less, flexible                               | Strict schema with types                     |
| Queries   | No JOINs, limited aggregations                      | Full SQL: JOINs, GROUP BY, window functions  |
| Real-time | Built-in live listeners                             | Not built-in                                 |
| Scaling   | Auto-scales                                         | Manual (or managed service like Neon)        |
| Good for  | User-generated content, live sync, flexible schemas | Analytics, stats, structured relational data |

> **Q:** What if I wanted real-time listening with PostgreSQL?
>
> **A:** PostgreSQL has a built-in pub/sub mechanism via `LISTEN`/`NOTIFY` commands. For a practical abstraction, **Supabase** wraps this into a real-time API nearly identical to Firestore's `onSnapshot()`. For Titan Tracker, this is overkill — the data only changes when you deploy.

> **Q:** What does "scaling" mean?
>
> **A:** Scaling = the app's ability to handle more traffic. Firestore auto-scales automatically; you just pay per operation. PostgreSQL has a connection limit — under heavy load you can exhaust connections. "Scaling PostgreSQL" means using a connection pooler (PgBouncer), read replicas, or a larger server. For Titan Tracker, scaling is a non-issue: the page is static HTML on a CDN and scales to millions of requests without touching the database at all.

**Titan Tracker → PostgreSQL**: wins, losses, per-round scores, averages, and rankings are highly relational and benefit from SQL aggregation power.

**Slidemoji → Firestore**: game sessions are user-generated, short-lived, and benefit from real-time sync between players in the same game room.

> **Q:** "Game sessions are short-lived...real-time sync between players" — but Slidemoji saves game data for stats, and it's a 1-player game with no "room" concept.
>
> **A:** Fair correction — the original description assumed multiplayer. For a 1-player game, Firestore is still a good fit for different reasons: the schemaless structure lets game session data evolve without schema migrations, and the built-in auth and mobile-friendly SDK add value. The "room sync" benefit doesn't apply, but Firestore's flexibility for user-generated data (different games may have different shapes) is still relevant for stats.

### Authentication: Firebase Auth vs Auth.js vs Clerk

When you need user accounts in a Next.js app:

|                                     | Firebase Auth                      | Auth.js (next-auth)              | Clerk                         |
| ----------------------------------- | ---------------------------------- | -------------------------------- | ----------------------------- |
| Best with                           | Firebase backend                   | Any DB (PostgreSQL, MySQL, etc.) | Any setup                     |
| Setup                               | Firebase SDK                       | npm package + config             | npm package + Clerk dashboard |
| Providers                           | Google, GitHub, email, phone, etc. | Same                             | Same                          |
| UI components                       | Basic                              | None (DIY)                       | Polished, pre-built           |
| Cost                                | Free up to limits                  | Free (open source)               | Free tier, then paid          |
| Works with Firestore security rules | Yes (native)                       | No                               | No                            |

---

## Part 10: Astro — When Static Means Static

### What is Astro?

Astro is a **web framework for content-driven sites**. Like Next.js with SSG, it pre-renders pages at build time. Unlike Next.js, it ships **zero JavaScript by default** — the page is plain HTML, and only explicitly interactive components ("islands") get any JS at all.

Key ideas:

- **Islands Architecture**: the page is static HTML. Interactive components are isolated "islands" that hydrate independently.
- **Framework agnostic**: write components in React, Vue, Svelte, or plain HTML — even mix them on the same page.
- **Content Collections**: first-class support for Markdown/MDX with typed schema validation (great for blogs, docs).
- **Vite-powered**: fast dev server and builds, no Webpack.

### How Astro components work

```astro
---
// Frontmatter: runs at BUILD TIME only (like a Server Component)
import WinLoss from "../components/WinLoss.jsx";
const stats = await db.query(winLossQuery);  // Direct DB query at build time
---

<!-- Template: plain HTML, zero JS unless marked -->
<WinLoss data={stats} />          <!-- renders to HTML, no JS sent to browser -->
<ShareButton client:load />       <!-- island: hydrated in the browser -->
```

The `client:load` (or `client:idle`, `client:visible`) directive opts a component into hydration. Without it, React components in Astro render to HTML and ship no JavaScript at all.

### Astro vs Next.js for Titan Tracker

|                        | Next.js (current)               | Astro (hypothetical)                    |
| ---------------------- | ------------------------------- | --------------------------------------- |
| Rendering              | SSG via React Server Components | SSG via Islands Architecture            |
| JavaScript sent        | Client Components get hydrated  | Only explicitly marked islands          |
| Interactive components | `"use client"` directive        | `client:load` directive                 |
| Data fetching          | `async` server components       | Frontmatter in `.astro` files           |
| React support          | Native (it's a React framework) | Integration (add via `astro add react`) |
| Content/blog support   | Basic                           | First-class (Content Collections)       |
| Community              | Very large                      | Smaller but growing                     |
| Job market             | Widely sought                   | Less common                             |

**Would Astro have been a good choice for Titan Tracker?**

Technically yes — the site is mostly static HTML with only two interactive components (`ShareButton` and `SiteHeader`). The data fetching pattern (query DB at build time) maps cleanly to Astro frontmatter, and the Islands model would ship even less JS than Next.js does.

**But Next.js is the right call because:**

1. **React-first** — you already know React; no context switching or integration setup
2. **Career signal** — Next.js appears far more often in job postings than Astro
3. **Future flexibility** — adding auth, user-specific pages, or ISR is well-documented in Next.js
4. **Ecosystem** — more third-party libraries explicitly support Next.js

**Astro would be the better choice if Titan Tracker were:**

- A blog or documentation site (Content Collections would shine)
- A marketing landing page where maximum performance is the #1 goal
- A project where you want React AND Vue components coexisting

### When to choose Astro

| Situation                                     | Choice                       |
| --------------------------------------------- | ---------------------------- |
| Blog, docs, or content-heavy site             | ✅ Astro                     |
| Marketing landing page (perf-critical)        | ✅ Astro                     |
| Mixed framework team                          | ✅ Astro                     |
| Stats/dashboard that might get user features  | ✅ Next.js                   |
| App with real-time data or auth               | ✅ Next.js                   |
| Full-stack with complex routing and API needs | ✅ Next.js or TanStack Start |

> **Q:** Would Astro be good for my Personal Site? What framework is it currently (just vanilla)? Would React be worth it?
>
> **A:** It depends on what the site is:
> - If it's a simple portfolio/resume page: **vanilla is totally fine** and has zero overhead. Deploy to GitHub Pages for free.
> - **Astro is worth it** if you have 5+ pages needing a shared nav/footer layout, want a build pipeline for components, or want to use React for interactive bits without committing to a full React app.
> - **React alone** is overkill for a static portfolio — React's strength is managing complex state and interactivity, not rendering a bio page.
> - **Next.js** would be the choice if you want server-rendered content (a blog with a database) or SSG with a data source.
>
> My recommendation: vanilla if it's simple, Astro if you have multi-page structure or want to grow it. React/Next.js only if you have a specific dynamic feature in mind.

---

## Part 11: The Web Dev Landscape

### The stack layers

Tools at the **same row** are **peers/competitors** — pick one.  
Tools at **different rows** are **orthogonal** — you can (and often do) combine them.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HOSTING / CDN                                                              │
│  Vercel  │  Netlify  │  Firebase Hosting  │  Railway  │  Render  │  AWS    │
├─────────────────────────────────────────────────────────────────────────────┤
│  FULL-STACK FRAMEWORK  (wraps a UI library, adds routing + backend)         │
│  Next.js  │  Astro  │  TanStack Start  │  Remix  │  Nuxt  │  SvelteKit     │
│  (React)  │  (any)  │  (React)          │ (React) │ (Vue)  │ (Svelte)       │
├─────────────────────────────────────────────────────────────────────────────┤
│  UI LIBRARY                                                                 │
│  React  │  Vue  │  Svelte  │  Solid  │  (vanilla JS — no library)          │
├─────────────────────────────────────────────────────────────────────────────┤
│  API / BACKEND                                                              │
│  Express  │  Fastify  │  Next.js API routes  │  Firebase Functions          │
│           │           │  (collocated with UI) │  (event-driven)             │
├─────────────────────────────────────────────────────────────────────────────┤
│  BaaS  (optional — replaces the API + DB + Auth layers with hosted services)│
│  Firebase  (Auth + Firestore + Storage + Hosting + Functions)               │
│  Supabase  (Auth + PostgreSQL + Storage + Edge Functions)                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  DATABASE                                                                   │
│  PostgreSQL  │  MySQL  │  SQLite  │  MongoDB  │  Firestore  │  Redis        │
└─────────────────────────────────────────────────────────────────────────────┘
```

Note: **BaaS is not a layer you must have** — it's an alternative to running the API and Database layers yourself. If you use Firebase or Supabase, you often skip the Express/Fastify row entirely.

### Your projects mapped onto this table

| Project                | Hosting          | Framework                           | UI         | API / Backend                          | Database              |
| ---------------------- | ---------------- | ----------------------------------- | ---------- | -------------------------------------- | --------------------- |
| **Titan Tracker**      | Vercel           | Next.js                             | React      | Next.js SSG (no API routes at runtime) | PostgreSQL (Neon)     |
| **Slidemoji**          | Firebase Hosting | Vite (SPA, no full-stack framework) | React      | Firebase Functions                     | Firestore             |
| **NBA Schedule Saver** | Vercel           | — (Express)                         | Vanilla JS | Express                                | — (calls Todoist API) |
| **Trigram**            | Netlify          | —                                   | Vanilla JS | —                                      | —                     |

> **Q:** What are Firebase Functions in Slidemoji's context? Am I using them? How?
>
> **A:** Firebase Functions are serverless Node.js functions deployed to Google Cloud. They can be triggered by HTTP, Firestore events, or auth events. Whether Slidemoji uses them depends on the code — if there's any server-side game validation, score processing, or sending data before saving to Firestore, that logic lives in a Function. If everything writes to Firestore directly from the browser (client-side SDK), there may be no Functions at all.

> **Q:** Where is the NBA schedule data stored in Schedule Saver? Just JSON? Is that bad?
>
> **A:** Yes, `data/nba_schedule.json`, scraped by `scrapeSchedules.py`. This is fine for this use case: the schedule is fixed once per season, the data is small, and no user-specific querying is needed. A database would only make sense if multiple users had different schedules, you needed complex queries, or the data size became large. A JSON file bundled with the server is the right call for a scrape-and-import utility.

### Key relationships at a glance

```
React  ←────── Next.js wraps React (React is the UI layer inside the framework)
React  ←────── TanStack Start wraps React
Vue    ←────── Nuxt wraps Vue
Svelte ←────── SvelteKit wraps Svelte
React  ←────── Astro can use React (or Vue, or Svelte — framework-agnostic)

Next.js ──────→ can deploy to Vercel, Railway, Render, Docker, or bare Node.js
Firebase ─────→ includes its own hosting (Firebase Hosting) — it's self-contained

Firebase  }         BaaS options: both replace backend + DB + auth
Supabase  }         Firebase = NoSQL (Firestore); Supabase = relational (PostgreSQL)

PostgreSQL }        Raw databases: you manage connections and write SQL yourself
MongoDB    }        (or use an ORM like Prisma, Drizzle, etc.)

> **Q:** Is it overkill to manage raw connections and write SQL in Titan Tracker? What are the alternatives?
>
> **A:** Not overkill given the query complexity. Titan Tracker's SQL includes aggregations, window functions for rankings, and per-round breakdowns — the kind of queries where Prisma/Drizzle get awkward and often generate less efficient SQL. Your raw SQL approach gives full control and clarity.
>
> That said, for a typical CRUD app (user profiles, posts, comments), Prisma would save time: auto-generated types, no manual schema migrations, readable query syntax. For analytics/stats like Titan Tracker, raw SQL is the idiomatic professional choice.


Express            ← thin Node.js HTTP wrapper; you build the routing yourself
Next.js API routes ← serverless functions collocated in the same repo as your UI
Firebase Functions ← serverless functions triggered by Firestore events or HTTP
```

### How Titan Tracker's stack flows

```
Build time:

  PostgreSQL (Neon)
       ↓ queried once
  Next.js (SSG)
       ↓ renders to static HTML
  React components (TitanCard, WinLoss, ShareButton, etc.)
       ↓ output is pre-built HTML + minimal JS
  Vercel CDN ← stores the built files

Runtime (user visits the site):

  Browser → Vercel CDN → pre-built HTML (instant)
                      → minimal JS for ShareButton + SiteHeader
                      (PostgreSQL is never touched at runtime)
```

### How Slidemoji's stack flows

```
Runtime (user plays a game):

  Browser
    ↓ loads
  Firebase Hosting → serves the Vite + React bundle
    ↓ app runs in browser, calls Firebase SDK directly
  Firestore ← live sync: all players in the same room see updates in real time
  Firebase Auth ← user accounts
  Firebase Functions ← server-side logic (game validation, etc.)

  No separate Express/Node server in the middle.
  The frontend talks directly to Firebase services via the SDK.
```

> **Q:** "Firebase Hosting → serves the Vite + React bundle" — what does that mean?
>
> **A:** When you run `npm run build` in Slidemoji, Vite processes all your React components, TypeScript, and CSS and outputs a folder of plain browser-compatible files: `index.html`, `assets/main.abc123.js`, `assets/style.abc123.css`. This is the "bundle" — your entire React app compiled into a few optimized files. Firebase Hosting serves these static files from its CDN. The browser downloads `main.js`, React boots up, and your app runs entirely in the browser.

---

## Part 12: Next.js vs Other Backend Frameworks

Most web frameworks follow the same basic pattern: receive HTTP request → run logic → return response. What differs is the language, the ecosystem, and how much they give you out of the box.

> **Q:** Who/what sends the HTTP request? How does this happen in my projects?
>
> **A:** In web development, HTTP requests are sent by browsers. Every time a user navigates to a URL, submits a form, or JavaScript calls `fetch("https://...")`, the browser sends an HTTP request. In Titan Tracker (SSG), the browser sends a GET request to Vercel → Vercel returns pre-built HTML — no dynamic processing. In NBA Moneyline (Express), the browser GETs `/` to get HTML, then JS GETs `/api/stats` to get data, then builds the page.

| Framework             | Language                | Type                                      | Good for                                        |
| --------------------- | ----------------------- | ----------------------------------------- | ----------------------------------------------- |
| **Next.js**           | JavaScript / TypeScript | Full-stack React framework                | Content sites, SPAs, full-stack JS apps         |
| **Express (Node.js)** | JavaScript              | Minimal backend framework                 | REST APIs, backend-for-frontend, microservices  |
| **Django**            | Python                  | Full-stack, "batteries included"          | CRUD apps, admin-heavy tools, rapid prototyping |
| **Flask**             | Python                  | Minimal backend framework                 | Simple APIs, ML model serving, microservices    |
| **ASP.NET Core**      | C#                      | Full-stack framework                      | Enterprise apps, Microsoft/Azure ecosystem      |
| **Rails**             | Ruby                    | Full-stack, convention-over-configuration | Rapid prototyping, CRUD apps                    |


> **Q:** What does "backend-for-frontend" mean?
>
> **A:** A Backend-for-Frontend (BFF) is a backend API built specifically to serve one frontend client, rather than being a shared generic API. Instead of one API serving mobile, web, and desktop all at once, you have a separate lightweight API per client that returns exactly the data shape that frontend needs. Express is well-suited for this pattern.

> **Q:** What are microservices? Are any of my projects microservices?
>
> **A:** Microservices splits one application into many small, independently deployed services (auth service, payments service, notifications service, etc.). None of your projects use microservices — they're all monoliths, which is correct for side projects. Microservices add significant operational complexity and only make sense at large-team scale.

> **Q:** Does Express not support TypeScript? You only listed JavaScript.
>
> **A:** Express works fine with TypeScript. The "Language" column shows the primary native language. All Node.js frameworks work with TypeScript — you add `tsconfig.json` and TypeScript compiles to JavaScript. `@types/express` gives you full TypeScript support on top of Express.

> **Q:** Is Django more "rapid" for prototyping than my JavaScript projects?
>
> **A:** For certain app types, yes. Django's speed comes from: auto-generated admin UI (define a data model, get full CRUD at `/admin` instantly), built-in ORM with auto-migrations, and built-in auth. For a simple CRUD app, Django can get you to a working product faster. For a React-heavy frontend, Next.js is more powerful. It's a trade-off: Django is fast for backend-heavy apps; Next.js is fast for frontend-heavy apps.

### Node.js vs Next.js

This is the most important one to be clear on: **Node.js is not a framework** — it's a JavaScript runtime. Express is a minimal framework that runs in Node.js. Next.js is a full-stack framework that also runs in Node.js.

You don't choose "Node.js vs Next.js". You choose what framework to use, and both run in Node.js.

```
# Express: you wire everything manually
HTTP request → your routing code → your controller → response

# Next.js: routing is automatic, UI is colocated
HTTP request → file-based routing → Server Component → HTML response
```

> **Q:** "UI is colocated" — what does this mean? How is Express not colocated?
>
> **A:** In Express, your UI (HTML in `public/`, JavaScript in `public/js/`) lives separately from your backend (routes in `routes/`, business logic in `utils/`). The connection between them is manual. In Next.js, a `page.js` file is simultaneously the route AND the UI AND the data-fetching logic — all in one file, in one place. The data fetching and the component that uses it are colocated by design.

Express is the right tool when you need a pure JSON API (no UI), fine-grained HTTP control, or a backend that serves a separate frontend (mobile app, desktop client). Next.js is the right tool when the frontend and backend belong together.

> **Q:** "Frontend and backend belong together" — is that not the case with Todoist NBA Schedule Saver?
>
> **A:** The Schedule Saver is a borderline case. The frontend (form, confirmation UI) and backend (OAuth, Todoist API calls) are tightly coupled. But the app is a utility with no SEO needs, no SSG, and no React components — it's just HTML forms and Express handlers. Express is fine here. Next.js would add complexity (React components, build pipeline) without clear benefit. You'd only migrate if you wanted to rewrite the UI in React.

### Django vs Next.js

|             | Django                        | Next.js                                |
| ----------- | ----------------------------- | -------------------------------------- |
| Language    | Python                        | JavaScript                             |
| Templates   | Django templates (Jinja-like) | React (JSX)                            |
| ORM         | Built-in Django ORM           | None — use Prisma, Drizzle, or raw SQL |
| Admin panel | Auto-generated from models    | None built-in                          |
| Auth        | Built-in                      | Use Auth.js, Clerk, or Firebase Auth   |
| Migrations  | Built-in                      | None — use your ORM's migration tool   |
| Best for    | CRUD-heavy apps, Python teams | React-heavy UIs, JavaScript teams      |


> **Q:** What is an ORM?
>
> **A:** ORM (Object-Relational Mapper) is a library that lets you interact with a database using your programming language's syntax instead of raw SQL. Instead of `SELECT * FROM titans WHERE rank = 1`, you write `prisma.titan.findFirst({ where: { rank: 1 } })`. It generates SQL for you, provides type safety, and handles schema changes. Prisma and Drizzle are the common choices in the JS ecosystem. Django has its own ORM built in.

> **Q:** What does "migrations" mean?
>
> **A:** A migration is a versioned script that changes your database schema over time (e.g., "add a `score` column to `rounds`"). Migrations let you evolve the schema without losing data, and track exactly what version each environment is at. In Django, `makemigrations` auto-generates them from model changes. In Next.js with Prisma, `prisma migrate dev` does the same. In Titan Tracker, the `data/` SQL scripts serve this role manually.

Django's "batteries included" philosophy means you get an ORM, admin UI, auth, forms, and migrations out of the box. Next.js is more modular — you compose libraries for each concern. Neither is better; it's a language and ecosystem choice.

### Flask vs Next.js

Flask is Python's minimal web framework (like Express but Python). It has no built-in ORM, no admin panel, no auth — just routing and request/response handling. It's a good fit for:

- Simple REST APIs that a separate frontend (React, mobile) calls
- Data science backends — serving ML model predictions (FastAPI is also popular here)
- Prototypes where you want maximum control and minimum magic

Next.js collocates the UI with the backend. Flask is backend-only — you'd pair it with a separate React app or use Jinja templates for server-rendered HTML.

### ASP.NET Core vs Next.js

ASP.NET Core is Microsoft's web framework, written in C# on the .NET runtime. It's not something you'd typically encounter at a startup, but it dominates in:

- **Enterprise software** — banks, healthcare, insurance, government
- **Microsoft/Azure-heavy shops** — teams already in the Windows/C# ecosystem
- **Strongly-typed, compiled performance** — C# is statically typed and compiles to optimized native code

ASP.NET is a language-ecosystem choice (you're in C#/.NET land with Visual Studio, Azure, NuGet). Next.js is a JavaScript-ecosystem choice. You'd pick one based on your team's language background, not because one is technically superior for all cases.

> **Q:** Could my projects be built in ASP.NET? Is it worth learning?
>
> **A:** Technically yes — any web app can be built in any framework. But ASP.NET is not worth learning as a JavaScript developer unless you're targeting enterprise jobs in healthcare, finance, or Microsoft-heavy shops. If you're applying to startups and modern tech companies, your time is better spent deepening JavaScript/TypeScript, React, and Next.js skills.

> **Q:** Is the analogy: C# ↔ JS, .NET ↔ Node.js, ASP.NET ↔ Next.js?
>
> **A:** Nearly. The closest mapping is:
> - C# ↔ JavaScript (the language)
> - .NET runtime ↔ Node.js (the runtime that executes the language)
> - ASP.NET Core ↔ Express or Next.js (the web framework)
>
> The imperfect part: ASP.NET is more "batteries included" (like Django) and covers the full stack including views/templates, while Express is minimal. Next.js is closer to ASP.NET Core's Razor Pages than Express is.

> **Q:** Where does WordPress fit in all of this? I see many job postings asking for it. Does it involve coding?
>
> **A:** WordPress is a **CMS (Content Management System)** built in PHP. It's the most-used website platform on the web (~40% of all websites). It does involve coding — primarily PHP for themes and plugins, plus HTML/CSS/JS for frontend customization. The "drag-and-drop" builders (Elementor, Divi) sit on top of WordPress and reduce but don't eliminate the need for code.
>
> Job postings ask for WordPress because agencies and small businesses use it heavily for marketing sites, blogs, and ecommerce (via WooCommerce). It's a separate skill from React/Next.js. Worth knowing at a surface level for freelance work or agency jobs, but it's not in the same technology tree as your current stack.
