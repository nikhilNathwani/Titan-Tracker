import type { NormalizedEpisode } from "@/lib/admin/episode";
import shared from "./shared.module.css";

interface EpisodeAddedProps {
	episode: NormalizedEpisode;
	onAddAnother: () => void;
}

/** Shown after an episode is committed. */
export default function EpisodeAdded({
	episode,
	onAddAnother,
}: EpisodeAddedProps) {
	return (
		<div className={shared.card}>
			<h1 className={shared.heading}>Episode added ✓</h1>
			<p className={shared.subtle}>
				Season {episode.season_num}, Episode {episode.episode_num} was
				written to the database. The public site was revalidated — the
				new numbers appear on the next page load (give it a few
				seconds).
			</p>
			<div className={shared.buttonRow}>
				<button
					type="button"
					className={shared.primaryButton}
					onClick={onAddAnother}
				>
					Add another episode
				</button>
				<a href="/" className={shared.secondaryButton}>
					View the site
				</a>
			</div>
		</div>
	);
}
