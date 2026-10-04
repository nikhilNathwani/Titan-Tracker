"use client";

import { useState } from "react";
import { commitEpisode, logout, previewEpisode } from "@/lib/admin/actions";
import { useEpisodeDraft } from "@/lib/admin/useEpisodeDraft";
import {
	emptyEpisodeInput,
	isComplete,
	pickTitan,
	titansLockedElsewhere,
	type EpisodeInput,
	type NormalizedEpisode,
	type RoundInput,
	type SubmitResult,
} from "@/lib/admin/episode";
import { ROUND_NUMS, type TitanName } from "@/lib/types";
import EpisodeAdded from "./EpisodeAdded";
import EpisodeDetailsFields from "./EpisodeDetailsFields";
import RoundFields from "./RoundFields";
import ReviewPanel from "./ReviewPanel";
import shared from "./shared.module.css";
import styles from "./EpisodeForm.module.css";

interface EpisodeFormProps {
	titans: TitanName[];
	suggestion: { season_num: number; episode_num: number };
}

type Stage =
	| { name: "edit" }
	| { name: "review"; episode: NormalizedEpisode; newTitans: TitanName[] }
	| { name: "done"; episode: NormalizedEpisode; newTitans: TitanName[] };

export default function EpisodeForm({ titans, suggestion }: EpisodeFormProps) {
	const [input, setInput] = useState<EpisodeInput>(() =>
		emptyEpisodeInput(suggestion),
	);
	const [stage, setStage] = useState<Stage>({ name: "edit" });
	const [errors, setErrors] = useState<string[]>([]);
	const [pending, setPending] = useState(false);
	// Which round's titan is currently auto-filled (null = none yet).
	const [titanAutoIndex, setTitanAutoIndex] = useState<number | null>(null);
	const { draftRestored, discardDraft } = useEpisodeDraft({
		draft: { input, titanAutoIndex },
		enabled: stage.name === "edit",
		onRestore: (draft) => {
			setInput(draft.input);
			setTitanAutoIndex(draft.titanAutoIndex);
		},
	});

	function startOver() {
		discardDraft();
		setInput(emptyEpisodeInput(suggestion));
		setTitanAutoIndex(null);
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

	function selectTitan(roundIndex: number, titanName: TitanName) {
		const { titans: resolved, autoIndex } = pickTitan(
			input.rounds.map((round) => round.titan_name),
			titanAutoIndex,
			roundIndex,
			titanName,
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
			setErrors([
				"Something went wrong talking to the server. Try again.",
			]);
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
			discardDraft();
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
			<EpisodeAdded
				episode={stage.episode}
				onAddAnother={handleAddAnother}
			/>
		);
	}

	const complete = isComplete(input);

	return (
		<form className={shared.card} onSubmit={handleReview} noValidate>
			<div className={styles.cardHeader}>
				<h1 className={shared.heading}>Add an episode</h1>
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
				<ul className={shared.errorList}>
					{errors.map((message, i) => (
						<li key={i}>{message}</li>
					))}
				</ul>
			)}

			<EpisodeDetailsFields
				value={input}
				onChange={patchEpisode}
				disabled={pending}
			/>

			{ROUND_NUMS.map((roundNum, index) => (
				<RoundFields
					key={roundNum}
					roundNum={roundNum}
					value={input.rounds[index]}
					roster={titans}
					disabledTitans={titansLockedElsewhere(
						input.rounds,
						index,
						titanAutoIndex,
					)}
					isTitanAuto={titanAutoIndex === index}
					onSelectTitan={(name) => selectTitan(index, name)}
					onChange={(patch) => patchRound(index, patch)}
					disabled={pending}
				/>
			))}

			{!pending && !complete && (
				<p className={styles.hint}>
					Every field is required to continue.
				</p>
			)}
			<button
				type="submit"
				className={shared.primaryButton}
				disabled={pending || !complete}
			>
				{pending ? "Checking…" : "Review"}
			</button>
		</form>
	);
}
