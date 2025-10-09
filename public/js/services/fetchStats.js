/* ----------------------------------- */
/*                                     */
/*   AVG SCORE API CALL                */
/*                                     */
/* ----------------------------------- */
fetch(`/api/avgScores`)
	.then((response) => response.json())
	.then((result) => {
		result.data.forEach((titan) => {
			displayAvgScore(titan.titan_name, parseFloat(titan.avg_score));
		});
	})
	.catch((error) => console.error("Error fetching data:", error));

/* ----------------------------------- */
/*                                     */
/*   BEST SCORE API CALL               */
/*                                     */
/* ----------------------------------- */
fetch(`/api/bestScores`)
	.then((response) => response.json())
	.then((result) => {
		result.data.forEach((titan) => {
			displayBestScore(
				titan.titan_name,
				titan.titan_score,
				titan.max_score,
				titan.ingredient1,
				titan.ingredient2
			);
		});
	})
	.catch((error) => console.error("Error fetching data:", error));

/* ----------------------------------- */
/*                                     */
/*   PER-ROUND STATS API CALL          */
/*                                     */
/* ----------------------------------- */
fetch(`/api/perRoundStats`)
	.then((response) => response.json())
	.then((result) => {
		var perRoundStats = {
			"Brooke Williamson": { 1: {}, 2: {}, 3: {} },
			"Michael Voltaggio": { 1: {}, 2: {}, 3: {} },
			"Tiffany Derry": { 1: {}, 2: {}, 3: {} },
			"Ayesha Nurdjaja": {
				1: {
					battle_count: 0,
					avg_score: null,
					avg_margin: null,
				},
				2: {
					battle_count: 0,
					avg_score: null,
					avg_margin: null,
				},
				3: {
					battle_count: 0,
					avg_score: null,
					avg_margin: null,
				},
			},
		};
		result.data.forEach((row) => {
			perRoundStats[row.titan_name][row.round_num] = {
				battle_count: parseInt(row.battle_count, 10),
				avg_score: parseFloat(row.avg_score),
				avg_margin: parseFloat(row.avg_margin),
			};
		});
		displayPerRoundStats(perRoundStats);
	})
	.catch((error) => console.error("Error fetching data:", error));
