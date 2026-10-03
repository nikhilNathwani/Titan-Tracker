import type { TitanRecordRow, TitanWithRank } from "./types";

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
 * Converts raw titan_records rows into display-ready titans with rank strings,
 * and splits them into active (ranked) and inactive (unranked) lists.
 * Relies on titanRecords.sql's ORDER BY for ordering (active first, by rank).
 */
export function processTitanRecords(rows: TitanRecordRow[]): {
	titansWithRanks: TitanWithRank[];
	activeTitans: TitanWithRank[];
	inactiveTitans: TitanWithRank[];
} {
	const ranks = rows.map((t) =>
		t.rank === null ? null : parseInt(t.rank, 10),
	);
	const rankStrings = generateRankStrings(ranks);
	const titansWithRanks: TitanWithRank[] = rows.map((t, i) => ({
		titan_name: t.titan_name,
		num_win: parseInt(t.num_win, 10),
		num_tie: parseInt(t.num_tie, 10),
		num_loss: parseInt(t.num_loss, 10),
		rank: ranks[i],
		is_active: t.is_active,
		rankString: rankStrings[i],
	}));
	return {
		titansWithRanks,
		activeTitans: titansWithRanks.filter((t) => t.rank !== null),
		inactiveTitans: titansWithRanks.filter((t) => t.rank === null),
	};
}
