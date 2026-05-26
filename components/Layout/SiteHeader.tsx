import { pool } from "@/lib/db";
import { titanRecordsQuery } from "@/lib/queries";
import { generateRankStrings } from "@/lib/ranking";
import type { TitanRecordRow, TitanRecord, TitanWithRank } from "@/lib/types";
import SiteNav from "./SiteNav";

export default async function SiteHeader() {
	let activeTitans: TitanWithRank[] = [];
	let inactiveTitans: TitanWithRank[] = [];
	try {
		const titanRecordsResult =
			await pool.query<TitanRecordRow>(titanRecordsQuery);
		const titanRecords: TitanRecord[] = titanRecordsResult.rows.map(
			(t) => ({
				titan_name: t.titan_name,
				num_win: parseInt(t.num_win, 10),
				num_tie: parseInt(t.num_tie, 10),
				num_loss: parseInt(t.num_loss, 10),
				rank: t.rank === null ? null : parseInt(t.rank, 10),
				is_active: t.is_active,
			}),
		);
		const rankStrings: string[] = generateRankStrings(
			titanRecords.map((t) => t.rank),
		);
		const titansWithRanks: TitanWithRank[] = titanRecords.map((t, i) => ({
			...t,
			rankString: rankStrings[i],
		}));
		activeTitans = titansWithRanks
			.filter((t) => t.rank !== null)
			.sort((a, b) => (a.rank as number) - (b.rank as number));
		inactiveTitans = titansWithRanks.filter((t) => t.rank === null);
	} catch {
		// DB unavailable (local dev without credentials)
	}

	return (
		<SiteNav activeTitans={activeTitans} inactiveTitans={inactiveTitans} />
	);
}
