import { isAuthenticated } from "@/lib/admin/auth";
import {
	getActiveTitanNames,
	getNextEpisodeSuggestion,
} from "@/lib/admin/episodes";
import LoginForm from "@/components/Admin/LoginForm";
import EpisodeForm from "@/components/Admin/EpisodeForm";
import styles from "./admin.module.css";

// Never cache the admin page — the session check must run on every request.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
	if (!(await isAuthenticated())) {
		return (
			<main className={styles.wrap}>
				<LoginForm />
			</main>
		);
	}

	const [titans, suggestion] = await Promise.all([
		getActiveTitanNames(),
		getNextEpisodeSuggestion(),
	]);

	return (
		<main className={styles.wrap}>
			<EpisodeForm titans={titans} suggestion={suggestion} />
		</main>
	);
}
