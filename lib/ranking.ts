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
