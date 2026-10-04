# Admin portal (`/admin`)

A password-gated form for adding one episode (1 `titan_episodes` row + 3
`titan_rounds` rows) without hand-writing SQL.

## Adding an episode

1. Open `/admin` (locally: http://localhost:3000/admin).
2. Log in with the `ADMIN_PASSWORD` env var, set in `.env.local` locally and in
   the Vercel project's Environment Variables for production. The session
   cookie lasts 8 hours.
3. Fill in season / episode / challenger / judge, then the 3 rounds. Season and
   episode are pre-filled with the episode after the latest one in the DB.
    - **Titan** is picked from buttons showing the active titans (one per
      round). Picking a titan disables it for the other rounds; once two rounds
      are set, the third auto-fills with the remaining titan (tagged "auto", and
      it re-swaps if an earlier round changes). The roster is
      `SELECT titan_name FROM titans WHERE is_active`, so when a titan is
      swapped mid-show, update `is_active` first (query in
      [DATABASE.md](DATABASE.md#mark-a-titan-inactive-or-active-again)).
    - **Scores** are picked from a number grid (10→0, or 20→0 for round 3,
      highest first). No typing, no out-of-range values.
    - Name and ingredient fields show a non-blocking **capitalization warning**
      on blur when the text is all lowercase or ALL CAPS ("sea urchin",
      "SEA URCHIN"). Anything with deliberate mixed case ("NY Strip Steak",
      "Estratto di Pomodoro") is trusted.
    - **Review** stays disabled until every field is filled.
4. **Review** runs a dry-run insert (a real transaction, rolled back) and shows
   the exact rows. It re-lists any capitalization warnings, and the confirm
   button becomes **Insert anyway** when there are some. Nothing is saved yet.
5. **Confirm & insert** commits the transaction and revalidates the homepage,
   so the new stats show up on the live site within a few seconds, with no
   redeploy.

## Rounds

Rounds 1 & 2 are scored out of 10, round 3 out of 20. `max_score` is set
automatically, not entered.

## Draft autosave

The in-progress form is saved to `localStorage` (key
`titan-admin:episode-draft`) on every change and restored on reload, so an
accidental refresh, back, or tab close doesn't lose it. A "Restored your unsaved
draft" bar with a **Start over** button appears when a draft is loaded. The
draft is cleared on a successful insert. Drafts older than 7 days, or with
nothing but the default season/episode, are ignored. Per-browser only.

## Files

Organized the same way as the public site: route in `app/`, UI in
`components/`, logic in `lib/`.

| File                                                     | Role                                                                  |
| -------------------------------------------------------- | --------------------------------------------------------------------- |
| `app/admin/page.tsx`                                     | Server component: session check → `LoginForm` or `EpisodeForm`        |
| `app/admin/layout.tsx`                                   | `noindex` metadata, page shell                                        |
| `components/Admin/EpisodeForm.tsx`                       | The form: state, titan picking, switching edit → review → done        |
| `components/Admin/EpisodeDetailsFields`                  | Season / episode / challenger / judge                                 |
| `components/Admin/RoundFields`                           | One round: titan buttons, ingredients, score grids                    |
| `components/Admin/ReviewPanel`                           | Review screen after the dry run                                       |
| `components/Admin/EpisodeAdded`                          | "Episode added" screen                                                |
| `components/Admin/LoginForm`, `NameInput`, `ScorePicker` | Smaller pieces                                                        |
| `components/Admin/shared.module.css`                     | Styles shared across admin components (each also has its own module)  |
| `lib/admin/actions.ts`                                   | Server actions: `login`, `logout`, `previewEpisode`, `commitEpisode`  |
| `lib/admin/auth.ts`                                      | Password check + signed HTTP-only session cookie (HMAC of the expiry) |
| `lib/admin/queries.ts`                                   | Server-only DB access: roster, next episode, validation, insert       |
| `lib/admin/episode.ts`                                   | Client-safe model, form helpers, `looksMiscapitalized`                |
| `lib/admin/draft.ts`, `useEpisodeDraft.ts`               | localStorage autosave helpers and the React hook that uses them       |

`app/robots.ts` disallows `/admin`.

## Security notes

- The password never touches source (the repo is public); env var only.
- Every mutating action re-checks the session server-side, so the gate can't be
  bypassed from the client.
- The database enforces keys and value rules too (see
  [DATABASE.md](DATABASE.md)), so even a bug in the form can't insert a
  duplicate episode, an out-of-range score, or a round for a missing titan.
- This is "keep casual visitors out," not hardened auth. Possible next steps if
  that ever matters: real rate limiting, or Vercel password protection on the
  route.

## Rotating the password

Change `ADMIN_PASSWORD` in `.env.local` (and Vercel). Existing session cookies
are signed with the old value, so they stop validating immediately.

## Not handled here (still SQL in SQLTools)

- Editing or deleting an existing episode.
- Marking a titan active/inactive.
- Schema changes.

Queries for the first two are in [DATABASE.md](DATABASE.md#handy-queries);
past schema changes are in its History section.
