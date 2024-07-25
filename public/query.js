/* ----------------------------------- */
/*                                     */
/*      WIN LOSS API CALL              */
/*                                     */
/* ----------------------------------- */
fetch(`/api/winLoss`)
	.then((response) => response.json())
	.then((result) => {
		result = result.data[0];
		const num_win = parseInt(result.num_win, 10);
		const num_tie = parseInt(result.num_tie, 10);
		const num_loss = parseInt(result.num_loss, 10);
		displayWinLoss(num_win, num_tie, num_loss);
	})
	.catch((error) => console.error("Error fetching data:", error));

/* ----------------------------------- */
/*                                     */
/*   TITAN RECORDS API CALL            */
/*                                     */
/* ----------------------------------- */
fetch(`/api/titanRecords`)
	.then((response) => response.json())
	.then((result) => {
		var titanRecords = [];
		result.data.forEach((titan) => {
			titanRecords.push({
				titan_name: titan.titan_name,
				num_win: parseInt(titan.num_win, 10),
				num_tie: parseInt(titan.num_tie, 10),
				num_loss: parseInt(titan.num_loss, 10),
				score: parseFloat(titan.score),
			});
		});
		displayTitanRecords(titanRecords);
	})
	.catch((error) => console.error("Error fetching data:", error));

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
		result.data.forEach((titan) => {
			roundDistributions.push({
				name: titan.titan_name,
				round1_count: titan.round1_count,
				round2_count: titan.round2_count,
				round3_count: titan.round3_count,
			});
		});
	})
	.catch((error) => console.error("Error fetching data:", error));
