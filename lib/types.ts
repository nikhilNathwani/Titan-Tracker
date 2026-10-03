// A titan's name, as stored in the titans table. Plain string alias for
// readability; titans are data (added via /admin), so this is not an enum.
export type TitanName = string;

// ─── Query results ───────────────────────────────────────────────────────────
// pg returns bigint (e.g. COUNT, RANK) and numeric (e.g. AVG) columns as
// strings, so the .sql files cast those to ::int / ::float. That makes pg
// return real numbers, so these types describe the rows exactly as received.
// If you add a numeric column to a query, cast it the same way.

export interface WinLossData {
	num_win: number;
	num_tie: number;
	num_loss: number;
}

export interface TitanRecord {
	titan_name: TitanName;
	num_win: number;
	num_tie: number;
	num_loss: number;
	/** null for inactive titans */
	rank: number | null;
	is_active: boolean;
}

export interface BestScore {
	titan_score: number;
	max_score: number;
	ingredient1: string;
	ingredient2: string;
}

export interface RoundStats {
	battle_count: number;
	avg_score: number | null;
	avg_margin: number | null;
}

// Rows that become map entries carry their map keys alongside the value.
export interface AvgScoreRow {
	titan_name: TitanName;
	avg_score: number;
}
export type BestScoreRow = BestScore & { titan_name: TitanName };
export type PerRoundStatsRow = RoundStats & {
	titan_name: TitanName;
	round_num: number;
};

// ─── Shaped for display ──────────────────────────────────────────────────────

export interface TitanWithRank extends TitanRecord {
	rankString: string;
}

export type AvgScoresMap = Record<TitanName, number>;
export type BestScoresMap = Record<TitanName, BestScore>;
export type PerRoundStatsMap = Record<TitanName, Record<number, RoundStats>>;
