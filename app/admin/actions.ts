"use server";

import { revalidatePath } from "next/cache";
import {
	endSession,
	isAuthenticated,
	passwordIsCorrect,
	startSession,
} from "./auth";
import { EpisodeError, insertEpisode, validateEpisode } from "./episodeDb";
import type { EpisodeInput, SubmitResult } from "./episode";

export async function login(
	password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
	if (!passwordIsCorrect(password)) {
		// Small fixed delay to take the edge off brute-force attempts.
		await new Promise((resolve) => setTimeout(resolve, 600));
		return { ok: false, error: "Incorrect password." };
	}
	startSession();
	return { ok: true };
}

export async function logout(): Promise<void> {
	endSession();
}

function messageFor(err: unknown): string {
	if (err instanceof EpisodeError) return err.message;
	console.error("[admin] episode insert failed:", err);
	return "The database rejected the insert. Nothing was saved. Check the server logs.";
}

/** Validate + dry-run the insert (rolled back). Proves the write would succeed. */
export async function previewEpisode(
	input: EpisodeInput,
): Promise<SubmitResult> {
	if (!isAuthenticated()) {
		return { status: "error", message: "Session expired — reload the page and log in again." };
	}

	const validation = await validateEpisode(input);
	if (!validation.ok) {
		return { status: "validation_error", errors: validation.errors };
	}

	try {
		await insertEpisode(validation.episode, { dryRun: true });
	} catch (err) {
		return { status: "error", message: messageFor(err) };
	}

	return {
		status: "preview_ok",
		episode: validation.episode,
		newTitans: validation.newTitans,
	};
}

/** Validate + commit the insert for real, then refresh the public site. */
export async function commitEpisode(input: EpisodeInput): Promise<SubmitResult> {
	if (!isAuthenticated()) {
		return { status: "error", message: "Session expired — reload the page and log in again." };
	}

	const validation = await validateEpisode(input);
	if (!validation.ok) {
		return { status: "validation_error", errors: validation.errors };
	}

	try {
		await insertEpisode(validation.episode, { dryRun: false });
	} catch (err) {
		return { status: "error", message: messageFor(err) };
	}

	// The homepage and site header are statically generated from the DB;
	// invalidate them so the new episode shows without a redeploy.
	revalidatePath("/", "layout");

	return {
		status: "committed",
		episode: validation.episode,
		newTitans: validation.newTitans,
	};
}
