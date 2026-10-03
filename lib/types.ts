// A titan's name, as stored in the titans table. Plain string alias for
// readability; titans are data (added via /admin), so this is not an enum.
export type TitanName = string;

// The show always has exactly three rounds. RoundNum is derived from the array
// so the two can't drift apart; loop over ROUND_NUMS when you need each round.
export const ROUND_NUMS = [1, 2, 3] as const;
export type RoundNum = (typeof ROUND_NUMS)[number];

// ─── Database tables ─────────────────────────────────────────────────────────
// One row of each table, as stored. Admin writes these; the public page reads
// parts of them. Other types below pick from these so the shapes stay in sync.

/** One row of titans. */
export interface Titan {
	titan_name: TitanName;
	is_active: boolean;
}

/** One row of titan_episodes. */
export interface Episode {
	season_num: number;
	episode_num: number;
	challenger_name: string;
	judge_name: string;
}

/** One row of titan_rounds. */
export interface Round {
	season_num: number;
	episode_num: number;
	round_num: RoundNum;
	titan_name: TitanName;
	ingredient1: string;
	ingredient2: string;
	max_score: number;
	titan_score: number;
	challenger_score: number;
}

// ─── Query results ───────────────────────────────────────────────────────────
// lib/db.ts configures pg to return bigint (COUNT, RANK) and numeric (AVG)
// values as JS numbers, so these types match the query rows as received.
// For queries that feed the maps below, page.tsx adds the map keys inline,
// e.g. pool.query<{ titan_name: TitanName } & BestScore>(...).

export interface WinLossTie {
	num_win: number;
	num_tie: number;
	num_loss: number;
}

/** A titan with its record and rank (see titanRecords.sql). */
export interface TitanRecord extends Titan, WinLossTie {
	/** null for inactive titans */
	rank: number | null;
}

/** A titan's best round (see bestScores.sql). */
export type BestScore = Pick<
	Round,
	"titan_score" | "max_score" | "ingredient1" | "ingredient2"
>;

export interface RoundStats {
	battle_count: number;
	avg_score: number | null;
	avg_margin: number | null;
}

// ─── Shaped for display ──────────────────────────────────────────────────────

export interface TitanWithRank extends TitanRecord {
	rankString: string;
}

export type AvgScoresMap = Record<TitanName, number>;
export type BestScoresMap = Record<TitanName, BestScore>;
export type PerRoundStatsMap = Record<TitanName, Record<RoundNum, RoundStats>>;
