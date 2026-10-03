import type { TitanRecord, TitanWithRank } from "./types";

/**
 * Converts an array of rank integers (or null) to display strings.
 * e.g. [1, 1, 3, null] → ["T-1st", "T-1st", "3rd", "NR"]
 */
export function generateRankStrings(ranks: (number | null)[]): string[] {
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
 * Adds display rank strings to titanRecords.sql rows, and splits them into active (ranked) and inactive (unranked) lists.
 * Relies on titanRecords.sql's ORDER BY for ordering (active first, by rank).
 */
export function processTitanRecords(rows: TitanRecord[]): {
	titansWithRanks: TitanWithRank[];
	activeTitans: TitanWithRank[];
	inactiveTitans: TitanWithRank[];
} {
	const rankStrings = generateRankStrings(rows.map((t) => t.rank));
	const titansWithRanks: TitanWithRank[] = rows.map((t, i) => ({
		...t,
		rankString: rankStrings[i],
	}));
	return {
		titansWithRanks,
		activeTitans: titansWithRanks.filter((t) => t.rank !== null),
		inactiveTitans: titansWithRanks.filter((t) => t.rank === null),
	};
}
