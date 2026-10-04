import { getTitans } from "@/lib/queries";
import type { TitanWithRankLabel } from "@/lib/types";
import SiteNav from "./SiteNav";

export default async function SiteHeader() {
	let activeTitans: TitanWithRankLabel[] = [];
	let inactiveTitans: TitanWithRankLabel[] = [];
	try {
		({ activeTitans, inactiveTitans } = await getTitans());
	} catch (err) {
		// DB unavailable (e.g. local dev without credentials): render an empty nav,
		// but log so a real failure in production isn't silent.
		console.error("SiteHeader: failed to load titan records", err);
	}

	return (
		<SiteNav activeTitans={activeTitans} inactiveTitans={inactiveTitans} />
	);
}
