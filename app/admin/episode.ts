// Episode data model — pure types and helpers, safe to import from client
// components. Anything that touches the database lives in ./episodeDb.

export const ROUND_NUMS = [1, 2, 3] as const;
export type RoundNum = (typeof ROUND_NUMS)[number];

export function maxScoreForRound(round: RoundNum): number {
	return round === 3 ? 20 : 10;
}

export const MAX_TEXT_LEN = 100;

// ─── Raw form input (all strings — this is what the browser sends) ───────────

export interface RoundInput {
	titan_name: string;
	ingredient1: string;
	ingredient2: string;
	titan_score: string;
	challenger_score: string;
}

export interface EpisodeInput {
	season_num: string;
	episode_num: string;
	challenger_name: string;
	judge_name: string;
	rounds: RoundInput[]; // round N lives at index N-1
}

export function emptyRoundInput(): RoundInput {
	return {
		titan_name: "",
		ingredient1: "",
		ingredient2: "",
		titan_score: "",
		challenger_score: "",
	};
}

/**
 * Auto-assign the last round's titan once the other two are picked.
 *
 * The show runs exactly one titan per round, so when the roster has 3 titans
 * and 2 rounds are filled, the 3rd is fully determined. Returns the resolved
 * three names plus the index that was auto-filled (or null).
 */
export function resolveTitanAssignments(
	picks: string[],
	roster: string[],
): { titans: string[]; autoIndex: number | null } {
	const titans = [...picks];
	if (roster.length !== 3 || titans.length !== 3) {
		return { titans, autoIndex: null };
	}

	const filled = titans.map((name, i) => (name ? i : -1)).filter((i) => i >= 0);
	const empty = titans.map((name, i) => (name ? -1 : i)).filter((i) => i >= 0);

	if (filled.length === 2 && empty.length === 1) {
		const used = new Set(filled.map((i) => titans[i]));
		const remaining = roster.filter((name) => !used.has(name));
		if (remaining.length === 1) {
			titans[empty[0]] = remaining[0];
			return { titans, autoIndex: empty[0] };
		}
	}

	return { titans, autoIndex: null };
}

export function emptyEpisodeInput(seed: {
	season_num: number;
	episode_num: number;
}): EpisodeInput {
	return {
		season_num: String(seed.season_num),
		episode_num: String(seed.episode_num),
		challenger_name: "",
		judge_name: "",
		rounds: [emptyRoundInput(), emptyRoundInput(), emptyRoundInput()],
	};
}

// ─── Normalized / validated shape (what actually hits the database) ─────────

export interface NormalizedRound {
	round_num: RoundNum;
	titan_name: string;
	ingredient1: string;
	ingredient2: string;
	max_score: number;
	titan_score: number;
	challenger_score: number;
}

export interface NormalizedEpisode {
	season_num: number;
	episode_num: number;
	challenger_name: string;
	judge_name: string;
	rounds: NormalizedRound[];
}

export type ValidationResult =
	| { ok: true; episode: NormalizedEpisode; newTitans: string[] }
	| { ok: false; errors: string[] };

/** Outcome of a preview / commit action (shared between server and client). */
export type SubmitResult =
	| { status: "preview_ok"; episode: NormalizedEpisode; newTitans: string[] }
	| { status: "committed"; episode: NormalizedEpisode; newTitans: string[] }
	| { status: "validation_error"; errors: string[] }
	| { status: "error"; message: string };
