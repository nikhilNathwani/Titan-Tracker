"use client";

import { useEffect, useRef, useState } from "react";
import { commitEpisode, logout, previewEpisode } from "./actions";
import { clearDraft, loadDraft, saveDraft } from "./draft";
import {
	emptyEpisodeInput,
	resolveTitanAssignments,
	type EpisodeInput,
	type NormalizedEpisode,
	type RoundInput,
	type RoundNum,
	type SubmitResult,
} from "./episode";
import RoundFields from "./RoundFields";
import ReviewPanel from "./ReviewPanel";
import TitleCaseInput from "./TitleCaseInput";
import styles from "./admin.module.css";

function isComplete(value: EpisodeInput): boolean {
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

interface EpisodeFormProps {
	titans: string[];
	suggestion: { season_num: number; episode_num: number };
}

type Stage =
	| { name: "edit" }
	| { name: "review"; episode: NormalizedEpisode; newTitans: string[] }
	| { name: "done"; episode: NormalizedEpisode; newTitans: string[] };

export default function EpisodeForm({ titans, suggestion }: EpisodeFormProps) {
	const [input, setInput] = useState<EpisodeInput>(() =>
		emptyEpisodeInput(suggestion),
	);
	const [stage, setStage] = useState<Stage>({ name: "edit" });
	const [errors, setErrors] = useState<string[]>([]);
	const [pending, setPending] = useState(false);
	// Which round's titan is currently auto-filled (null = none yet).
	const [titanAutoIndex, setTitanAutoIndex] = useState<number | null>(null);
	const [draftRestored, setDraftRestored] = useState(false);
	// Blocks the autosave effect from firing before the restore attempt.
	const readyToPersist = useRef(false);

	// Restore an autosaved draft once, on mount.
	useEffect(() => {
		const draft = loadDraft();
		if (draft) {
			setInput(draft.input);
			setTitanAutoIndex(draft.titanAutoIndex);
			setDraftRestored(true);
		}
		readyToPersist.current = true;
	}, []);

	// Autosave while editing.
	useEffect(() => {
		if (!readyToPersist.current || stage.name !== "edit") return;
		saveDraft({ input, titanAutoIndex });
	}, [input, titanAutoIndex, stage]);

	function startOver() {
		clearDraft();
		setInput(emptyEpisodeInput(suggestion));
		setTitanAutoIndex(null);
		setDraftRestored(false);
		setErrors([]);
	}

	function patchEpisode(patch: Partial<EpisodeInput>) {
		setInput((prev) => ({ ...prev, ...patch }));
	}

	function patchRound(index: number, patch: Partial<RoundInput>) {
		setInput((prev) => ({
			...prev,
			rounds: prev.rounds.map((round, i) =>
				i === index ? { ...round, ...patch } : round,
			),
		}));
	}

	function selectTitan(roundIndex: number, titanName: string) {
		const picks = input.rounds.map((round) => round.titan_name);
		// Drop the previous auto pick so it can be recomputed from scratch.
		if (titanAutoIndex !== null) picks[titanAutoIndex] = "";
		// Clicking the already-selected titan clears it.
		picks[roundIndex] = picks[roundIndex] === titanName ? "" : titanName;

		const { titans: resolved, autoIndex } = resolveTitanAssignments(
			picks,
			titans,
		);
		setTitanAutoIndex(autoIndex);
		setInput((prev) => ({
			...prev,
			rounds: prev.rounds.map((round, i) => ({
				...round,
				titan_name: resolved[i],
			})),
		}));
	}

	// Titans manually locked to a different round (the auto round doesn't lock).
	function titansLockedElsewhere(roundIndex: number): string[] {
		return input.rounds
			.map((round, i) =>
				i !== roundIndex && i !== titanAutoIndex ? round.titan_name : "",
			)
			.filter(Boolean);
	}

	function handleResultErrors(result: SubmitResult): boolean {
		if (result.status === "validation_error") {
			setErrors(result.errors);
			return true;
		}
		if (result.status === "error") {
			setErrors([result.message]);
			return true;
		}
		setErrors([]);
		return false;
	}

	async function runAction<T extends SubmitResult>(action: () => Promise<T>) {
		setErrors([]);
		setPending(true);
		try {
			return await action();
		} catch {
			setErrors(["Something went wrong talking to the server. Try again."]);
			return null;
		} finally {
			setPending(false);
		}
	}

	async function handleReview(event: React.FormEvent) {
		event.preventDefault();
		const result = await runAction(() => previewEpisode(input));
		if (!result || handleResultErrors(result)) return;
		if (result.status === "preview_ok") {
			setStage({
				name: "review",
				episode: result.episode,
				newTitans: result.newTitans,
			});
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	}

	async function handleConfirm() {
		const result = await runAction(() => commitEpisode(input));
		if (!result || handleResultErrors(result)) return;
		if (result.status === "committed") {
			clearDraft();
			setDraftRestored(false);
			setStage({
				name: "done",
				episode: result.episode,
				newTitans: result.newTitans,
			});
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	}

	function handleAddAnother() {
		if (stage.name !== "done") return;
		setInput(
			emptyEpisodeInput({
				season_num: stage.episode.season_num,
				episode_num: stage.episode.episode_num + 1,
			}),
		);
		setTitanAutoIndex(null);
		setErrors([]);
		setStage({ name: "edit" });
	}

	async function handleLogout() {
		setPending(true);
		await logout();
		window.location.reload();
	}

	if (stage.name === "review") {
		return (
			<ReviewPanel
				episode={stage.episode}
				newTitans={stage.newTitans}
				pending={pending}
				errors={errors}
				onBack={() => {
					setErrors([]);
					setStage({ name: "edit" });
				}}
				onConfirm={handleConfirm}
			/>
		);
	}

	if (stage.name === "done") {
		return (
			<div className={styles.card}>
				<h1 className={styles.heading}>Episode added ✓</h1>
				<p className={styles.subtle}>
					Season {stage.episode.season_num}, Episode{" "}
					{stage.episode.episode_num} was written to the database. The public
					site was revalidated — the new numbers appear on the next page load
					(give it a few seconds).
				</p>
				<div className={styles.buttonRow}>
					<button
						type="button"
						className={styles.primaryButton}
						onClick={handleAddAnother}
					>
						Add another episode
					</button>
					<a href="/" className={styles.secondaryButton}>
						View the site
					</a>
				</div>
			</div>
		);
	}

	return (
		<form className={styles.card} onSubmit={handleReview} noValidate>
			<div className={styles.cardHeader}>
				<h1 className={styles.heading}>Add an episode</h1>
				<button
					type="button"
					className={styles.linkButton}
					onClick={handleLogout}
					disabled={pending}
				>
					Log out
				</button>
			</div>

			{draftRestored && (
				<div className={styles.draftNote}>
					<span>Restored your unsaved draft.</span>
					<button
						type="button"
						className={styles.linkButton}
						onClick={startOver}
						disabled={pending}
					>
						Start over
					</button>
				</div>
			)}

			{errors.length > 0 && (
				<ul className={styles.errorList}>
					{errors.map((message) => (
						<li key={message}>{message}</li>
					))}
				</ul>
			)}

			<fieldset
				className={styles.episodeFieldset}
				disabled={pending}
				aria-label="Episode details"
			>
				<p className={styles.legend}>Episode details</p>
				<div className={styles.fieldRow}>
					<label className={styles.field}>
						<span className={styles.label}>Season</span>
						<input
							type="number"
							inputMode="numeric"
							min={1}
							value={input.season_num}
							onChange={(event) =>
								patchEpisode({ season_num: event.target.value })
							}
							className={styles.input}
						/>
					</label>
					<label className={styles.field}>
						<span className={styles.label}>Episode</span>
						<input
							type="number"
							inputMode="numeric"
							min={1}
							value={input.episode_num}
							onChange={(event) =>
								patchEpisode({ episode_num: event.target.value })
							}
							className={styles.input}
						/>
					</label>
				</div>

				<div className={styles.fieldRow}>
					<TitleCaseInput
						label="Challenger"
						value={input.challenger_name}
						onChange={(next) => patchEpisode({ challenger_name: next })}
					/>
					<TitleCaseInput
						label="Judge"
						value={input.judge_name}
						onChange={(next) => patchEpisode({ judge_name: next })}
					/>
				</div>
			</fieldset>

			{input.rounds.map((round, index) => (
				<RoundFields
					key={index}
					roundNum={(index + 1) as RoundNum}
					value={round}
					roster={titans}
					disabledTitans={titansLockedElsewhere(index)}
					isTitanAuto={titanAutoIndex === index}
					onSelectTitan={(name) => selectTitan(index, name)}
					onChange={(patch) => patchRound(index, patch)}
					disabled={pending}
				/>
			))}

			{!pending && !isComplete(input) && (
				<p className={styles.hint}>Every field is required to continue.</p>
			)}
			<button
				type="submit"
				className={styles.primaryButton}
				disabled={pending || !isComplete(input)}
			>
				{pending ? "Checking…" : "Review"}
			</button>
		</form>
	);
}
