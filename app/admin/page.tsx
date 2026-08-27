import { pool } from "@/lib/db";
import { isAuthenticated } from "./auth";
import LoginForm from "./LoginForm";
import EpisodeForm from "./EpisodeForm";
import styles from "./admin.module.css";

// Never cache the admin page — the session check must run on every request.
export const dynamic = "force-dynamic";

interface TitanRow {
	titan_name: string;
}
interface LastEpisodeRow {
	season_num: number;
	episode_num: number;
}

export default async function AdminPage() {
	if (!isAuthenticated()) {
		return (
			<main className={styles.wrap}>
				<LoginForm />
			</main>
		);
	}

	const [titansResult, lastEpisodeResult] = await Promise.all([
		pool.query<TitanRow>(
			"SELECT titan_name FROM titans WHERE is_active ORDER BY titan_name",
		),
		pool.query<LastEpisodeRow>(
			`SELECT season_num, episode_num FROM titan_episodes
			 ORDER BY season_num DESC, episode_num DESC LIMIT 1`,
		),
	]);

	const titans = titansResult.rows.map((row) => row.titan_name);
	const last = lastEpisodeResult.rows[0];
	const suggestion = last
		? { season_num: last.season_num, episode_num: last.episode_num + 1 }
		: { season_num: 1, episode_num: 1 };

	return (
		<main className={styles.wrap}>
			<EpisodeForm titans={titans} suggestion={suggestion} />
		</main>
	);
}
