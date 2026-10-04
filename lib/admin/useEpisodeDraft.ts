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

	// Restore an autosaved draft once, on mount. This has to be an effect:
	// localStorage only exists in the browser, so reading it during render would
	// make the server HTML and the first client render disagree (hydration
	// mismatch). Setting state here, after hydration, is the intended exception
	// to the "no setState in effects" rule.
	useEffect(() => {
		const saved = loadDraft();
		if (saved) {
			onRestore(saved);
			// eslint-disable-next-line react-hooks/set-state-in-effect -- see above
			setDraftRestored(true);
		}
		readyToPersist.current = true;
		// Mount only: re-running when onRestore changes would re-restore the
		// draft over the user's edits.
		// eslint-disable-next-line react-hooks/exhaustive-deps -- see above
	}, []);

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
