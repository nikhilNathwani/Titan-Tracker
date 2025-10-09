/* --------------------------- */
/*                             */
/*    TITAN RANKING LOGIC      */
/*                             */
/* --------------------------- */

// Calculate numerical ranks for titans based on their win-loss records
// Returns array of ranks (1, 2, 3, or null for retired titans)
function calculateTitanRanks(titanRecords) {
	// Separate into active and retired arrays
	const activeTitans = titanRecords.filter((t) => !t.is_retired);
	const retiredTitans = titanRecords.filter((t) => t.is_retired);

	// Extract scores from active titans (guaranteed length = 3)
	const scores = activeTitans.map((t) => t.score);

	var ranks = [];
	if (scores[0] == scores[2]) {
		ranks = [1, 1, 1];
	} else if (scores[0] == scores[1]) {
		ranks = [1, 1, 3];
	} else if (scores[1] == scores[2]) {
		ranks = [1, 2, 2];
	} else {
		ranks = [1, 2, 3];
	}

	// Append nulls for retired titans
	for (let i = 0; i < retiredTitans.length; i++) {
		ranks.push(null);
	}

	return ranks;
}

// Generate display strings for titan ranks
// Returns array of rank strings ("1st", "T-2nd", "NR", etc.)
function generateRankStrings(ranks) {
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

// Helper to get ordinal suffix (st, nd, rd, th)
function getRankSuffix(rank) {
	if (rank === 1) return "st";
	if (rank === 2) return "nd";
	if (rank === 3) return "rd";
	return "th";
}
