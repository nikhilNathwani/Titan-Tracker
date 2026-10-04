import type { TitanRecord, TitanWithRankLabel } from "./types";

/**
 * Converts an array of rank integers (or null) to display strings.
 * e.g. [1, 1, 3, null] → ["T-1st", "T-1st", "3rd", "NR"]
 */
export function generateRankLabels(ranks: (number | null)[]): string[] {
	function getRankSuffix(rank: number): string {
		if (rank === 1) return "st";
		if (rank === 2) return "nd";
		if (rank === 3) return "rd";
		return "th";
	}

	const rankCounts: Record<number, number> = {};
	ranks.forEach((r) => {
		if (r !== null) rankCounts[r] = (rankCounts[r] || 0) + 1;
	});

	return ranks.map((rank) => {
		if (rank === null) return "NR";
		const isTied = rankCounts[rank] > 1;
		return `${isTied ? "T-" : ""}${rank}${getRankSuffix(rank)}`;
	});
}

/**
 * Adds display rank labels to titanRecords.sql rows, and splits them into active (ranked) and inactive (unranked) lists.
 * Relies on titanRecords.sql's ORDER BY for ordering (active first, by rank).
 */
export function processTitanRecords(rows: TitanRecord[]): {
	allTitans: TitanWithRankLabel[];
	activeTitans: TitanWithRankLabel[];
	inactiveTitans: TitanWithRankLabel[];
} {
	const rankLabels = generateRankLabels(rows.map((t) => t.rank));
	const allTitans: TitanWithRankLabel[] = rows.map((t, i) => ({
		...t,
		rankLabel: rankLabels[i],
	}));
	return {
		allTitans,
		activeTitans: allTitans.filter((t) => t.is_active),
		inactiveTitans: allTitans.filter((t) => !t.is_active),
	};
}

/** CSS classes that color a rank: badge "rank rank1", border "rank1"; "NR" if unranked. */
export function rankClasses(rank: number | null): {
	badge: string;
	border: string;
} {
	const key = rank === null ? "NR" : rank;
	return { badge: `rank rank${key}`, border: `rank${key}` };
}
