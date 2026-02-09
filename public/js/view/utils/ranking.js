/* --------------------------- */
/*                             */
/*    TITAN RANKING LOGIC      */
/*                             */
/* --------------------------- */

// Generate display strings for titan ranks
// Returns array of rank strings ("1st", "T-2nd", "NR", etc.)
function generateRankStrings(ranks) {
	// Helper to get ordinal suffix (st, nd, rd, th)
	function getRankSuffix(rank) {
		if (rank === 1) return "st";
		if (rank === 2) return "nd";
		if (rank === 3) return "rd";
		return "th";
	}

	return ranks.map((rank) => {
		if (rank === null) return "NR";

		// Count how many titans have this rank to determine if it's tied
		const rankCount = ranks.filter((r) => r === rank).length;

		if (rankCount > 1) {
			// Tied rank
			return `T-${rank}${getRankSuffix(rank)}`;
		} else {
			// Solo rank
			return `${rank}${getRankSuffix(rank)}`;
		}
	});
}
