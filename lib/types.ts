// ─── Raw DB row shapes ───────────────────────────────────────────────────────
// pg returns all numeric columns as strings by default.

export interface WinLossRow {
	num_win: string;
	num_tie: string;
	num_loss: string;
}

export interface TitanRecordRow {
	titan_name: string;
	num_win: string;
	num_tie: string;
	num_loss: string;
	/** pg returns numeric rank or null */
	rank: string | null;
	is_active: boolean;
}

export interface AvgScoreRow {
	titan_name: string;
	avg_score: string;
}

export interface BestScoreRow {
	titan_name: string;
	titan_score: string;
	max_score: string;
	ingredient1: string;
	ingredient2: string;
}

export interface PerRoundStatsRow {
	titan_name: string;
	round_num: number;
	battle_count: string;
	avg_score: string | null;
	avg_margin: string | null;
}

// ─── Processed / shaped data ─────────────────────────────────────────────────

export interface WinLossData {
	num_win: number;
	num_tie: number;
	num_loss: number;
}

export interface TitanRecord {
	titan_name: string;
	num_win: number;
	num_tie: number;
	num_loss: number;
	rank: number | null;
	is_active: boolean;
}

export interface TitanWithRank extends TitanRecord {
	rankString: string;
}

export interface BestScore {
	titan_score: string;
	max_score: string;
	ingredient1: string;
	ingredient2: string;
}

export interface RoundStats {
	battle_count: number;
	avg_score: number | null;
	avg_margin: number | null;
}

export type AvgScoresMap = Record<string, number>;
export type BestScoresMap = Record<string, BestScore>;
export type PerRoundStatsMap = Record<string, Record<number, RoundStats>>;
