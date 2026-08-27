"use client";

import type { NormalizedEpisode } from "./episode";
import { needsTitleCase, toTitleCase } from "./format";
import styles from "./admin.module.css";

function capitalizationIssues(episode: NormalizedEpisode): string[] {
	const fields: [string, string][] = [
		["Challenger", episode.challenger_name],
		["Judge", episode.judge_name],
		...episode.rounds.flatMap((r): [string, string][] => [
			[`Round ${r.round_num} ingredient 1`, r.ingredient1],
			[`Round ${r.round_num} ingredient 2`, r.ingredient2],
		]),
	];
	return fields
		.filter(([, val]) => needsTitleCase(val))
		.map(([label, val]) => `${label}: “${val}” → “${toTitleCase(val)}”`);
}

interface ReviewPanelProps {
	episode: NormalizedEpisode;
	newTitans: string[];
	pending: boolean;
	errors: string[];
	onBack: () => void;
	onConfirm: () => void;
}

function roundResult(titanScore: number, challengerScore: number): string {
	if (titanScore > challengerScore) return "Titan";
	if (titanScore < challengerScore) return "Challenger";
	return "Tie";
}

export default function ReviewPanel({
	episode,
	newTitans,
	pending,
	errors,
	onBack,
	onConfirm,
}: ReviewPanelProps) {
	const casingIssues = capitalizationIssues(episode);
	const titanTotal = episode.rounds.reduce((sum, r) => sum + r.titan_score, 0);
	const challengerTotal = episode.rounds.reduce(
		(sum, r) => sum + r.challenger_score,
		0,
	);

	return (
		<div className={styles.card}>
			<h1 className={styles.heading}>Review before inserting</h1>
			<p className={styles.subtle}>
				This exact data will be written: 1 row in <code>titan_episodes</code>{" "}
				and 3 rows in <code>titan_rounds</code>. Nothing is saved yet.
			</p>

			{errors.length > 0 && (
				<ul className={styles.errorList}>
					{errors.map((message) => (
						<li key={message}>{message}</li>
					))}
				</ul>
			)}

			<dl className={styles.summaryGrid}>
				<div>
					<dt className={styles.label}>Season / Episode</dt>
					<dd>
						S{episode.season_num} · E{episode.episode_num}
					</dd>
				</div>
				<div>
					<dt className={styles.label}>Challenger</dt>
					<dd>{episode.challenger_name}</dd>
				</div>
				<div>
					<dt className={styles.label}>Judge</dt>
					<dd>{episode.judge_name}</dd>
				</div>
				<div>
					<dt className={styles.label}>Episode score</dt>
					<dd>
						{titanTotal}&ndash;{challengerTotal}{" "}
						<span className={styles.subtle}>
							({roundResult(titanTotal, challengerTotal)})
						</span>
					</dd>
				</div>
			</dl>

			<div className={styles.tableScroll}>
				<table className={styles.reviewTable}>
					<thead>
						<tr>
							<th>Rd</th>
							<th>Titan</th>
							<th>Ingredients</th>
							<th>Titan</th>
							<th>Chal.</th>
							<th>Winner</th>
						</tr>
					</thead>
					<tbody>
						{episode.rounds.map((round) => (
							<tr key={round.round_num}>
								<td>{round.round_num}</td>
								<td>{round.titan_name}</td>
								<td>
									{round.ingredient1} &amp; {round.ingredient2}
								</td>
								<td>
									{round.titan_score}/{round.max_score}
								</td>
								<td>
									{round.challenger_score}/{round.max_score}
								</td>
								<td>
									{roundResult(round.titan_score, round.challenger_score)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{newTitans.length > 0 && (
				<p className={styles.warningText}>
					New titan{newTitans.length > 1 ? "s" : ""} will be added to the{" "}
					<code>titans</code> table: <strong>{newTitans.join(", ")}</strong>.
					Double-check the spelling.
				</p>
			)}

			{casingIssues.length > 0 && (
				<div className={styles.warningText}>
					<p>Capitalization looks off — you can go back and fix, or insert as-is:</p>
					<ul className={styles.casingList}>
						{casingIssues.map((issue) => (
							<li key={issue}>{issue}</li>
						))}
					</ul>
				</div>
			)}

			<p className={styles.successHint}>
				Dry run succeeded — the database accepted this insert and rolled it
				back.
			</p>

			<div className={styles.buttonRow}>
				<button
					type="button"
					className={styles.secondaryButton}
					onClick={onBack}
					disabled={pending}
				>
					← Back to edit
				</button>
				<button
					type="button"
					className={styles.primaryButton}
					onClick={onConfirm}
					disabled={pending}
				>
					{pending
						? "Inserting…"
						: casingIssues.length > 0
							? "Insert anyway"
							: "Confirm & insert"}
				</button>
			</div>
		</div>
	);
}
