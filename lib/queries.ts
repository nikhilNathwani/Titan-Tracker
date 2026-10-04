// The public site's data access: loads the .sql files in lib/queries/, runs
// them, and shapes the results into what components render. Pages and
// components call the get* functions below instead of querying the database
// themselves; the SQL text is private to this file. Server-only.
//
// NOTE: these queries are read from disk with fs.readFileSync at module load.
// That is only safe because every route that imports this module is statically
// prerendered (app/page.tsx is `force-static`), so the reads happen at build
// time where the .sql files exist — not in a Vercel serverless function, whose
// bundle would not reliably include them (Next's file tracer can't follow a
// process.cwd()-based path). If you ever make the homepage (or anything else in
// its tree) dynamic, switch this file to importing the .sql files instead:
//   next.config.mjs:  webpack: (c) => { c.module.rules.push({ test: /\.sql$/, type: "asset/source" }); return c; }
//   here:             import winLossQuery from "./queries/records/winLoss.sql";
import fs from "fs";
import path from "path";
import { cache } from "react";
import { pool } from "./db";
import { processTitanRecords } from "./ranking";
import type {
	TitanName,
	RoundNum,
	TitanRecord,
	BestScore,
	RoundStats,
	WinLossTie,
	AvgScoresMap,
	BestScoresMap,
	PerRoundStatsMap,
} from "./types";

const winLossQuery: string = fs.readFileSync(
	path.join(process.cwd(), "lib/queries/records", "winLoss.sql"),
	"utf8",
);

const titanRecordsQuery: string = fs.readFileSync(
	path.join(process.cwd(), "lib/queries/records", "titanRecords.sql"),
	"utf8",
);

const avgScoresQuery: string = fs.readFileSync(
	path.join(process.cwd(), "lib/queries/stats", "avgScores.sql"),
	"utf8",
);

const bestScoresQuery: string = fs.readFileSync(
	path.join(process.cwd(), "lib/queries/stats", "bestScores.sql"),
	"utf8",
);

const perRoundStatsQuery: string = fs.readFileSync(
	path.join(process.cwd(), "lib/queries/stats", "perRoundStats.sql"),
	"utf8",
);

// ─── Data access ─────────────────────────────────────────────────────────────

/** Overall win/loss/tie record of all titans combined. */
export async function getWinLoss(): Promise<WinLossTie> {
	const { rows } = await pool.query<WinLossTie>(winLossQuery);
	return rows[0];
}

/**
 * Every titan with a rank label, plus the active (ranked) and inactive lists.
 * Cached for the duration of a render, so the page and SiteHeader share one
 * query instead of each running their own.
 */
export const getTitans = cache(async () => {
	const { rows } = await pool.query<TitanRecord>(titanRecordsQuery);
	return processTitanRecords(rows);
});

/** Each titan's average score, out of 10. */
export async function getAvgScores(): Promise<AvgScoresMap> {
	const { rows } = await pool.query<{
		titan_name: TitanName;
		avg_score: number;
	}>(avgScoresQuery);
	const avgScoresMap: AvgScoresMap = {};
	rows.forEach((row) => {
		avgScoresMap[row.titan_name] = row.avg_score;
	});
	return avgScoresMap;
}

/** Each titan's best round. */
export async function getBestScores(): Promise<BestScoresMap> {
	const { rows } = await pool.query<{ titan_name: TitanName } & BestScore>(
		bestScoresQuery,
	);
	const bestScoresMap: BestScoresMap = {};
	rows.forEach(({ titan_name, ...bestScore }) => {
		bestScoresMap[titan_name] = bestScore;
	});
	return bestScoresMap;
}

/**
 * Each titan's stats for rounds 1–3, plus the largest battle count across all
 * titans (for scaling the histogram bars).
 */
export async function getPerRoundStats(): Promise<{
	perRoundStatsMap: PerRoundStatsMap;
	maxBattleCount: number;
}> {
	const [{ allTitans }, { rows }] = await Promise.all([
		getTitans(),
		pool.query<{ titan_name: TitanName; round_num: RoundNum } & RoundStats>(
			perRoundStatsQuery,
		),
	]);

	// Initialize all titans with empty rounds so components always get a
	// complete object even if the DB has no rows yet for that titan/round.
	const perRoundStatsMap: PerRoundStatsMap = {};
	for (const t of allTitans) {
		perRoundStatsMap[t.titan_name] = {
			1: { battle_count: 0, avg_score: null, avg_margin: null },
			2: { battle_count: 0, avg_score: null, avg_margin: null },
			3: { battle_count: 0, avg_score: null, avg_margin: null },
		};
	}
	// Starts at 1 to avoid dividing by zero.
	let maxBattleCount = 1;
	rows.forEach(({ titan_name, round_num, ...stats }) => {
		if (perRoundStatsMap[titan_name]) {
			perRoundStatsMap[titan_name][round_num] = stats;
			maxBattleCount = Math.max(maxBattleCount, stats.battle_count);
		}
	});

	return { perRoundStatsMap, maxBattleCount };
}
