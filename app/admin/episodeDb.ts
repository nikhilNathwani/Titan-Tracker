// Server-only: validation that needs the database, plus the transactional insert.
//
// Adding one episode = 1 row in `titan_episodes` + 3 rows in `titan_rounds`.
// The database has no PK / FK / NOT NULL constraints, so every rule is enforced
// here.

import { pool } from "@/lib/db";
import {
	maxScoreForRound,
	MAX_TEXT_LEN,
	type EpisodeInput,
	type NormalizedEpisode,
	type NormalizedRound,
	type RoundNum,
	type ValidationResult,
} from "./episode";

/** User-facing error thrown from the insert path (safe to show verbatim). */
export class EpisodeError extends Error {}

function parseIntStrict(raw: string): number | null {
	const trimmed = raw.trim();
	if (!/^-?\d+$/.test(trimmed)) return null;
	return Number(trimmed);
}

/** Trim and collapse internal whitespace — case is left as the user typed it. */
function cleanText(raw: string): string {
	return raw.trim().replace(/\s+/g, " ");
}

export async function validateEpisode(
	input: EpisodeInput,
): Promise<ValidationResult> {
	const errors: string[] = [];

	const season = parseIntStrict(input.season_num);
	if (season === null || season < 1 || season > 99) {
		errors.push("Season must be a whole number between 1 and 99.");
	}

	const episode = parseIntStrict(input.episode_num);
	if (episode === null || episode < 1 || episode > 99) {
		errors.push("Episode must be a whole number between 1 and 99.");
	}

	const challenger = cleanText(input.challenger_name);
	if (!challenger) errors.push("Challenger name is required.");
	else if (challenger.length > MAX_TEXT_LEN)
		errors.push(`Challenger name must be ${MAX_TEXT_LEN} characters or fewer.`);

	const judge = cleanText(input.judge_name);
	if (!judge) errors.push("Judge name is required.");
	else if (judge.length > MAX_TEXT_LEN)
		errors.push(`Judge name must be ${MAX_TEXT_LEN} characters or fewer.`);

	if (input.rounds.length !== 3) {
		errors.push("Exactly 3 rounds are required.");
	}

	const normalizedRounds: NormalizedRound[] = [];
	input.rounds.slice(0, 3).forEach((round, index) => {
		const roundNum = (index + 1) as RoundNum;
		const label = `Round ${roundNum}`;
		const maxScore = maxScoreForRound(roundNum);

		const titanName = round.titan_name.trim();
		if (!titanName) errors.push(`${label}: titan is required.`);
		else if (titanName.length > MAX_TEXT_LEN)
			errors.push(`${label}: titan name must be ${MAX_TEXT_LEN} characters or fewer.`);

		const ingredient1 = cleanText(round.ingredient1);
		const ingredient2 = cleanText(round.ingredient2);
		if (!ingredient1) errors.push(`${label}: ingredient 1 is required.`);
		if (!ingredient2) errors.push(`${label}: ingredient 2 is required.`);
		if (ingredient1.length > MAX_TEXT_LEN || ingredient2.length > MAX_TEXT_LEN)
			errors.push(`${label}: ingredients must be ${MAX_TEXT_LEN} characters or fewer.`);

		const titanScore = parseIntStrict(round.titan_score);
		if (titanScore === null || titanScore < 0 || titanScore > maxScore)
			errors.push(`${label}: titan score must be a whole number from 0 to ${maxScore}.`);

		const challengerScore = parseIntStrict(round.challenger_score);
		if (challengerScore === null || challengerScore < 0 || challengerScore > maxScore)
			errors.push(`${label}: challenger score must be a whole number from 0 to ${maxScore}.`);

		if (
			titanName &&
			ingredient1 &&
			ingredient2 &&
			titanScore !== null &&
			challengerScore !== null
		) {
			normalizedRounds.push({
				round_num: roundNum,
				titan_name: titanName,
				ingredient1,
				ingredient2,
				max_score: maxScore,
				titan_score: titanScore,
				challenger_score: challengerScore,
			});
		}
	});

	const distinctTitans = new Set(normalizedRounds.map((r) => r.titan_name));
	if (normalizedRounds.length === 3 && distinctTitans.size !== 3) {
		errors.push("Each titan can only cook one round per episode.");
	}

	if (errors.length > 0 || season === null || episode === null) {
		return { ok: false, errors };
	}

	const [dup, existingTitans] = await Promise.all([
		pool.query(
			"SELECT 1 FROM titan_episodes WHERE season_num = $1 AND episode_num = $2",
			[season, episode],
		),
		pool.query<{ titan_name: string }>("SELECT titan_name FROM titans"),
	]);

	if ((dup.rowCount ?? 0) > 0) {
		errors.push(
			`Season ${season}, Episode ${episode} already exists in the database.`,
		);
	}

	const knownTitans = new Set(existingTitans.rows.map((r) => r.titan_name));
	const newTitans = [
		...new Set(
			normalizedRounds
				.map((r) => r.titan_name)
				.filter((name) => !knownTitans.has(name)),
		),
	];

	if (errors.length > 0) return { ok: false, errors };

	return {
		ok: true,
		episode: {
			season_num: season,
			episode_num: episode,
			challenger_name: challenger,
			judge_name: judge,
			rounds: normalizedRounds,
		},
		newTitans,
	};
}

/**
 * Insert an episode and its 3 rounds inside a single transaction. Any new titan
 * names are added to `titans` first. With `dryRun: true` the transaction is
 * rolled back — used to prove the write would succeed before the user confirms.
 */
export async function insertEpisode(
	episode: NormalizedEpisode,
	opts: { dryRun: boolean },
): Promise<void> {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");

		// Re-check inside the transaction to close the gap between validation
		// and commit.
		const dup = await client.query(
			"SELECT 1 FROM titan_episodes WHERE season_num = $1 AND episode_num = $2",
			[episode.season_num, episode.episode_num],
		);
		if ((dup.rowCount ?? 0) > 0) {
			throw new EpisodeError(
				`Season ${episode.season_num}, Episode ${episode.episode_num} already exists.`,
			);
		}

		for (const titanName of new Set(episode.rounds.map((r) => r.titan_name))) {
			await client.query(
				`INSERT INTO titans (titan_name, is_active)
				 SELECT $1, true
				 WHERE NOT EXISTS (SELECT 1 FROM titans WHERE titan_name = $1)`,
				[titanName],
			);
		}

		await client.query(
			`INSERT INTO titan_episodes (season_num, episode_num, challenger_name, judge_name)
			 VALUES ($1, $2, $3, $4)`,
			[
				episode.season_num,
				episode.episode_num,
				episode.challenger_name,
				episode.judge_name,
			],
		);

		for (const round of episode.rounds) {
			await client.query(
				`INSERT INTO titan_rounds
				 (season_num, episode_num, round_num, titan_name,
				  ingredient1, ingredient2, max_score, titan_score, challenger_score)
				 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
				[
					episode.season_num,
					episode.episode_num,
					round.round_num,
					round.titan_name,
					round.ingredient1,
					round.ingredient2,
					round.max_score,
					round.titan_score,
					round.challenger_score,
				],
			);
		}

		await client.query(opts.dryRun ? "ROLLBACK" : "COMMIT");
	} catch (err) {
		await client.query("ROLLBACK");
		throw err;
	} finally {
		client.release();
	}
}
