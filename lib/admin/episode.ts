// Episode data model — pure types and helpers, safe to import from client
// components. Anything that touches the database lives in ./queries.

import {
	ROUND_NUMS,
	type RoundNum,
	type Episode,
	type TitanName,
	type Round,
} from "@/lib/types";

export function maxScoreForRound(round: RoundNum): number {
	return round === 3 ? 20 : 10;
}

export const MAX_TEXT_LEN = 100;

// ─── Raw form input (all strings — this is what the browser sends) ───────────

export interface RoundInput {
	titan_name: TitanName;
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
	rounds: RoundInput[]; // one per ROUND_NUMS entry: round N lives at index N-1
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
 * The show runs exactly one titan per round, so when the roster has one titan
 * per round and all but one round are filled, the last is fully determined. Returns the resolved
 * three names plus the index that was auto-filled (or null).
 */
export function resolveTitanAssignments(
	picks: TitanName[],
	roster: TitanName[],
): { titans: TitanName[]; autoIndex: number | null } {
	const titans = [...picks];
	if (
		roster.length !== ROUND_NUMS.length ||
		titans.length !== ROUND_NUMS.length
	) {
		return { titans, autoIndex: null };
	}

	const filled = titans
		.map((name, i) => (name ? i : -1))
		.filter((i) => i >= 0);
	const empty = titans
		.map((name, i) => (name ? -1 : i))
		.filter((i) => i >= 0);

	if (filled.length === ROUND_NUMS.length - 1 && empty.length === 1) {
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
		rounds: ROUND_NUMS.map(() => emptyRoundInput()),
	};
}

/** True when every field of the form has a value (the Review button's gate). */
export function isComplete(value: EpisodeInput): boolean {
	if (!value.season_num.trim() || !value.episode_num.trim()) return false;
	if (!value.challenger_name.trim() || !value.judge_name.trim()) return false;
	return value.rounds.every(
		(round) =>
			round.titan_name &&
			round.ingredient1.trim() &&
			round.ingredient2.trim() &&
			round.titan_score !== "" &&
			round.challenger_score !== "",
	);
}

/**
 * Titans manually picked for rounds other than `roundIndex`, which that round
 * can't also pick. The auto-filled round (`autoIndex`) doesn't lock its titan.
 */
export function titansLockedElsewhere(
	rounds: RoundInput[],
	roundIndex: number,
	autoIndex: number | null,
): TitanName[] {
	return rounds
		.map((round, i) =>
			i !== roundIndex && i !== autoIndex ? round.titan_name : "",
		)
		.filter(Boolean);
}

// ─── Normalized / validated shape (what actually hits the database) ─────────

/** A titan_rounds row; season/episode come from the episode it belongs to. */
export type NormalizedRound = Omit<Round, "season_num" | "episode_num">;

/** A titan_episodes row plus its rounds. */
export interface NormalizedEpisode extends Episode {
	rounds: NormalizedRound[];
}

export type ValidationResult =
	| { ok: true; episode: NormalizedEpisode; newTitans: TitanName[] }
	| { ok: false; errors: string[] };

/** Outcome of a preview / commit action (shared between server and client). */
export type SubmitResult =
	| {
			status: "preview_ok";
			episode: NormalizedEpisode;
			newTitans: TitanName[];
	  }
	| {
			status: "committed";
			episode: NormalizedEpisode;
			newTitans: TitanName[];
	  }
	| { status: "validation_error"; errors: string[] }
	| { status: "error"; message: string };
