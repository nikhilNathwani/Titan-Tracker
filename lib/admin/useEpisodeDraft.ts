// Autosave for the episode form (React hook; client components only). Wraps
// the localStorage helpers in ./draft with the restore-on-mount and
// save-on-change behavior.

import { useEffect, useRef, useState } from "react";
import { clearDraft, loadDraft, saveDraft, type Draft } from "./draft";

export function useEpisodeDraft({
	draft,
	enabled,
	onRestore,
}: {
	/** The form's current state, saved on every change while `enabled`. */
	draft: Draft;
	/** Save only while editing (not on the review / done screens). */
	enabled: boolean;
	/** Called once on mount if a saved draft exists. */
	onRestore: (draft: Draft) => void;
}): { draftRestored: boolean; discardDraft: () => void } {
	const [draftRestored, setDraftRestored] = useState(false);
	// Blocks the autosave effect from firing before the restore attempt.
	const readyToPersist = useRef(false);

	// Restore an autosaved draft once, on mount.
	useEffect(() => {
		const saved = loadDraft();
		if (saved) {
			onRestore(saved);
			setDraftRestored(true);
		}
		readyToPersist.current = true;
	}, []); // mount only: onRestore isn't a dependency on purpose

	// Autosave while editing.
	const { input, titanAutoIndex } = draft;
	useEffect(() => {
		if (!readyToPersist.current || !enabled) return;
		saveDraft({ input, titanAutoIndex });
	}, [input, titanAutoIndex, enabled]);

	function discardDraft() {
		clearDraft();
		setDraftRestored(false);
	}

	return { draftRestored, discardDraft };
}
