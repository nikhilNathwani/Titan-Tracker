// The public site's data access: runs the SQL in lib/queries/ and shapes the
// results into what components render. Pages and components call the get*
// functions below instead of querying the database themselves; the SQL text is
// private to this file. Server-only.
//
// The .sql files are imported as strings (a Turbopack rule in next.config.mjs),
// so the queries are built into the bundle: no disk reads at runtime, and it
// works the same for static pages and serverless functions.
import winLossQuery from "./queries/records/winLoss.sql";
import titanRecordsQuery from "./queries/records/titanRecords.sql";
import avgScoresQuery from "./queries/stats/avgScores.sql";
import bestScoresQuery from "./queries/stats/bestScores.sql";
import perRoundStatsQuery from "./queries/stats/perRoundStats.sql";
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
	const avgScores: AvgScoresMap = {};
	rows.forEach((row) => {
		avgScores[row.titan_name] = row.avg_score;
	});
	return avgScores;
}

/** Each titan's best round. */
export async function getBestScores(): Promise<BestScoresMap> {
	const { rows } = await pool.query<{ titan_name: TitanName } & BestScore>(
		bestScoresQuery,
	);
	const bestScores: BestScoresMap = {};
	rows.forEach(({ titan_name, ...bestScore }) => {
		bestScores[titan_name] = bestScore;
	});
	return bestScores;
}

/**
 * Each titan's stats for rounds 1–3, plus the largest battle count across all
 * titans (for scaling the histogram bars).
 */
export async function getPerRoundStats(): Promise<{
	perRoundStats: PerRoundStatsMap;
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
	const perRoundStats: PerRoundStatsMap = {};
	for (const t of allTitans) {
		perRoundStats[t.titan_name] = {
			1: { battle_count: 0, avg_score: null, avg_margin: null },
			2: { battle_count: 0, avg_score: null, avg_margin: null },
			3: { battle_count: 0, avg_score: null, avg_margin: null },
		};
	}
	// Starts at 1 to avoid dividing by zero.
	let maxBattleCount = 1;
	rows.forEach(({ titan_name, round_num, ...stats }) => {
		if (perRoundStats[titan_name]) {
			perRoundStats[titan_name][round_num] = stats;
			maxBattleCount = Math.max(maxBattleCount, stats.battle_count);
		}
	});

	return { perRoundStats, maxBattleCount };
}
