import { pool } from "@/lib/db";
import { titanRecordsQuery } from "@/lib/queries";
import { processTitanRecords } from "@/lib/ranking";
import type { TitanRecord, TitanWithRankLabel } from "@/lib/types";
import SiteNav from "./SiteNav";

export default async function SiteHeader() {
	let activeTitans: TitanWithRankLabel[] = [];
	let inactiveTitans: TitanWithRankLabel[] = [];
	try {
		const titanRecordsResult =
			await pool.query<TitanRecord>(titanRecordsQuery);
		({ activeTitans, inactiveTitans } = processTitanRecords(
			titanRecordsResult.rows,
		));
	} catch (err) {
		// DB unavailable (e.g. local dev without credentials): render an empty nav,
		// but log so a real failure in production isn't silent.
		console.error("SiteHeader: failed to load titan records", err);
	}

	return (
		<SiteNav activeTitans={activeTitans} inactiveTitans={inactiveTitans} />
	);
}
