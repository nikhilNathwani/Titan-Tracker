// Local (per-browser) autosave for the in-progress episode form, so an accidental
// refresh / back-navigation / tab close doesn't lose what was typed.
//
// Written on every change while editing, restored on mount, cleared once an
// episode is committed. Pristine forms (nothing but the defaulted season/episode)
// are never saved, and drafts older than a week are ignored.

import { type EpisodeInput } from "./episode";

const KEY = "titan-admin:episode-draft";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface Draft {
	input: EpisodeInput;
	titanAutoIndex: number | null;
}

interface StoredDraft extends Draft {
	savedAt: number;
}

/** True when the form holds nothing worth preserving. */
export function isPristine(input: EpisodeInput): boolean {
	if (input.challenger_name.trim() || input.judge_name.trim()) return false;
	return input.rounds.every(
		(round) =>
			!round.titan_name &&
			!round.ingredient1.trim() &&
			!round.ingredient2.trim() &&
			!round.titan_score &&
			!round.challenger_score,
	);
}

export function loadDraft(): Draft | null {
	try {
		const raw = window.localStorage.getItem(KEY);
		if (!raw) return null;
		const stored = JSON.parse(raw) as StoredDraft;
		const fresh = Date.now() - (stored?.savedAt ?? 0) <= MAX_AGE_MS;
		if (stored?.input?.rounds?.length === 3 && fresh) {
			return {
				input: stored.input,
				titanAutoIndex: stored.titanAutoIndex ?? null,
			};
		}
		return null;
	} catch {
		return null;
	}
}

export function saveDraft(draft: Draft): void {
	try {
		if (isPristine(draft.input)) {
			window.localStorage.removeItem(KEY);
			return;
		}
		const stored: StoredDraft = { ...draft, savedAt: Date.now() };
		window.localStorage.setItem(KEY, JSON.stringify(stored));
	} catch {
		// Storage unavailable / full / blocked — carry on without a draft.
	}
}

export function clearDraft(): void {
	try {
		window.localStorage.removeItem(KEY);
	} catch {
		// ignore
	}
}
