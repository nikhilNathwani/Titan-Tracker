# Database

Titan Tracker stores everything in one Postgres database (Neon, via Vercel) with three tables.

> **There is only one database.** `POSTGRES_URL` is a single Vercel variable shared by Production, Preview and Development, so local `next dev`, SQLTools and the live site all read and write the same data.

## Tables and relationships

```
titans                titan_rounds                          titan_episodes
──────────────        ──────────────────────────────        ──────────────────
titan_name  PK ◄───── titan_name        FK                  season_num   PK
is_active             season_num        PK, FK ───────────► season_num   PK
                      episode_num       PK, FK ───────────► episode_num  PK
                      round_num         PK                  challenger_name
                      ingredient1                           judge_name
                      ingredient2
                      max_score
                      titan_score
                      challenger_score
```

Each episode has three rounds, and each round belongs to one episode and one titan.

### `titans`

| Column       | Type      | Rules                                                                      |
| ------------ | --------- | -------------------------------------------------------------------------- |
| `titan_name` | `text`    | **Primary key**                                                            |
| `is_active`  | `boolean` | Not null, default `true`. Inactive titans are unranked ("NR") on the site. |

### `titan_episodes`

| Column            | Type           | Rules                                             |
| ----------------- | -------------- | ------------------------------------------------- |
| `season_num`      | `integer`      | **Primary key** (with `episode_num`). At least 1. |
| `episode_num`     | `integer`      | **Primary key** (with `season_num`). At least 1.  |
| `challenger_name` | `varchar(255)` | Not null                                          |
| `judge_name`      | `varchar(255)` | Not null                                          |

### `titan_rounds`

| Column                            | Type           | Rules                                                                                                      |
| --------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------- |
| `season_num`                      | `integer`      | **Primary key** (with `episode_num`, `round_num`); **foreign key** → `titan_episodes` (with `episode_num`) |
| `episode_num`                     | `integer`      | as above                                                                                                   |
| `round_num`                       | `integer`      | **Primary key** (with season/episode). Must be 1, 2 or 3.                                                  |
| `titan_name`                      | `varchar(255)` | Not null; **foreign key** → `titans.titan_name`. **Unique** per episode: a titan cooks at most one round.  |
| `ingredient1`, `ingredient2`      | `varchar(255)` | Not null                                                                                                   |
| `max_score`                       | `integer`      | Not null. Must be 10 for rounds 1–2, 20 for round 3.                                                       |
| `titan_score`, `challenger_score` | `integer`      | Not null. Must be 0 to `max_score`.                                                                        |

### What the foreign keys do

- **Inserting:** a round can only reference an episode and a titan that already exist. Insert the titan (if new), then the episode, then its rounds. The admin portal does it in that order inside one transaction.
- **Deleting:** you can't delete an episode or a titan that still has rounds. Delete the rounds first (see below).
- **Renaming / renumbering:** both foreign keys are `ON UPDATE CASCADE`. Fixing a titan's name in `titans`, or an episode's season/episode number in `titan_episodes`, updates the matching rounds automatically.

### Rules the database does _not_ enforce

Everything in the tables above is enforced by the database itself (named constraints, listed under History). Two rules are only checked by the admin portal (`app/admin/episodeDb.ts`, `validateEpisode`), so follow them by hand in manual SQL:

- **exactly 3 rounds per episode.** A `CHECK` can only look at one row at a time, so it can't count an episode's rounds. (The primary key and `round_num` check do stop a 4th round or a repeated round number.)
- **names and ingredients at most 100 characters.** That's a form/display limit, not a data-integrity rule; the columns allow 255.

## Where this lives in the code

- **Types:** `lib/types.ts` has one type per table: `Titan`, `Episode`, `Round`. Other types pick fields from them.
- **Reads:** the public page's queries are in `lib/queries/**/*.sql`, loaded by `lib/queries.ts`. They run at build time (the page is static), so the site only shows new data after a redeploy.
- **Writes:** the admin portal at `/admin` (`app/admin/`).
- **Number parsing:** `lib/db.ts` makes `pg` return `COUNT`/`RANK` (bigint) and `AVG` (numeric) results as JS numbers instead of strings.
- **Roles:** the app connects as `default`, which owns the tables. SQLTools in VS Code connects as `titan_editor` (select/insert/update/delete only).

## Handy queries

Run these in SQLTools. Anything that changes data affects the live site's next deploy.

### View data

```sql
SELECT * FROM titans ORDER BY titan_name;

SELECT * FROM titan_episodes ORDER BY season_num, episode_num;

SELECT * FROM titan_rounds ORDER BY season_num, episode_num, round_num;

-- One episode with its rounds
SELECT e.season_num, e.episode_num, e.challenger_name, e.judge_name,
       r.round_num, r.titan_name, r.ingredient1, r.ingredient2,
       r.titan_score, r.challenger_score, r.max_score
FROM titan_episodes e
JOIN titan_rounds r USING (season_num, episode_num)
WHERE e.season_num = 5 AND e.episode_num = 6
ORDER BY r.round_num;
```

### Mark a titan inactive (or active again)

The admin portal adds titans but doesn't retire them, so this one is manual.

```sql
UPDATE titans SET is_active = FALSE WHERE titan_name = 'Titan Name';
UPDATE titans SET is_active = TRUE  WHERE titan_name = 'Titan Name';
```

### Fix a typo

```sql
-- Rename a titan: their rounds follow automatically (ON UPDATE CASCADE)
UPDATE titans SET titan_name = 'Correct Name' WHERE titan_name = 'Wrong Name';

-- Fix an episode's challenger or judge
UPDATE titan_episodes SET judge_name = 'Correct Name'
WHERE season_num = 5 AND episode_num = 6;

-- Fix one round
UPDATE titan_rounds SET titan_score = 8
WHERE season_num = 5 AND episode_num = 6 AND round_num = 2;
```

### Add data manually

Normally use the admin portal, which validates everything. If you must do it by hand, insert in this order:

```sql
BEGIN;

-- Only if the titan is new
INSERT INTO titans (titan_name) VALUES ('New Titan Name');

INSERT INTO titan_episodes (season_num, episode_num, challenger_name, judge_name)
VALUES (5, 7, 'Challenger Name', 'Judge Name');

INSERT INTO titan_rounds (
	season_num, episode_num, round_num, titan_name,
	ingredient1, ingredient2, max_score, titan_score, challenger_score
)
VALUES
	(5, 7, 1, 'Titan A', 'Ingredient', 'Ingredient', 10, 8, 4),
	(5, 7, 2, 'Titan B', 'Ingredient', 'Ingredient', 10, 7, 6),
	(5, 7, 3, 'Titan C', 'Ingredient', 'Ingredient', 20, 13, 19);

COMMIT;
```

### Delete an episode

Rounds first (the foreign key blocks deleting an episode that still has rounds):

```sql
BEGIN;
DELETE FROM titan_rounds   WHERE season_num = 5 AND episode_num = 7;
DELETE FROM titan_episodes WHERE season_num = 5 AND episode_num = 7;
COMMIT;
```

A titan can only be deleted once they have no rounds. Usually you want to mark them inactive instead.

## History

- **2026-10-04:** added the primary keys, foreign keys and `NOT NULL` rules above. Before this, `titan_episodes` and `titan_rounds` had no constraints at all and `titans` only had `UNIQUE (titan_name)`; the rules lived only in the admin code. All existing data (4 titans, 42 episodes, 126 rounds) already satisfied them. The change, run as one transaction:

```sql
ALTER TABLE titans DROP CONSTRAINT titans_titan_name_key;
ALTER TABLE titans ADD CONSTRAINT titans_pkey PRIMARY KEY (titan_name);
ALTER TABLE titans ALTER COLUMN is_active SET NOT NULL;

ALTER TABLE titan_episodes
	ALTER COLUMN season_num SET NOT NULL,
	ALTER COLUMN episode_num SET NOT NULL,
	ALTER COLUMN challenger_name SET NOT NULL,
	ALTER COLUMN judge_name SET NOT NULL,
	ADD CONSTRAINT titan_episodes_pkey PRIMARY KEY (season_num, episode_num);

ALTER TABLE titan_rounds
	ALTER COLUMN season_num SET NOT NULL,
	ALTER COLUMN episode_num SET NOT NULL,
	ALTER COLUMN round_num SET NOT NULL,
	ALTER COLUMN titan_name SET NOT NULL,
	ALTER COLUMN ingredient1 SET NOT NULL,
	ALTER COLUMN ingredient2 SET NOT NULL,
	ALTER COLUMN max_score SET NOT NULL,
	ALTER COLUMN titan_score SET NOT NULL,
	ALTER COLUMN challenger_score SET NOT NULL,
	ADD CONSTRAINT titan_rounds_pkey PRIMARY KEY (season_num, episode_num, round_num),
	ADD CONSTRAINT titan_rounds_episode_fkey FOREIGN KEY (season_num, episode_num)
		REFERENCES titan_episodes (season_num, episode_num) ON UPDATE CASCADE,
	ADD CONSTRAINT titan_rounds_titan_fkey FOREIGN KEY (titan_name)
		REFERENCES titans (titan_name) ON UPDATE CASCADE;
```

- **2026-10-04 (later):** added `CHECK` and `UNIQUE` rules for what had only been checked in the admin code. Existing data already satisfied all of them.

```sql
ALTER TABLE titan_episodes
	ADD CONSTRAINT titan_episodes_numbers_positive
		CHECK (season_num >= 1 AND episode_num >= 1);

ALTER TABLE titan_rounds
	ADD CONSTRAINT titan_rounds_round_num_valid
		CHECK (round_num BETWEEN 1 AND 3),
	ADD CONSTRAINT titan_rounds_max_score_matches_round
		CHECK (max_score = CASE WHEN round_num = 3 THEN 20 ELSE 10 END),
	ADD CONSTRAINT titan_rounds_scores_in_range
		CHECK (titan_score BETWEEN 0 AND max_score
		       AND challenger_score BETWEEN 0 AND max_score),
	ADD CONSTRAINT titan_rounds_one_round_per_titan
		UNIQUE (season_num, episode_num, titan_name);
```
