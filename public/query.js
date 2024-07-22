/* ----------------------------------- */
/*                                     */
/*      WIN LOSS API CALL              */
/*                                     */
/* ----------------------------------- */
fetch(`/api/winLoss`)
	.then((response) => response.json())
	.then((result) => {
		console.log(result.data, result.data);
		result = result.data[0];
		const num_win = parseInt(result.num_win, 10);
		const num_tie = parseInt(result.num_tie, 10);
		const num_loss = parseInt(result.num_loss, 10);
		makeWinLossSection(num_win, num_tie, num_loss);
	})
	.catch((error) => console.error("Error fetching data:", error));

/* ----------------------------------- */
/*                                     */
/*   TITAN RANKING API CALL            */
/*                                     */
/* ----------------------------------- */
fetch(`/api/titanRanking`)
	.then((response) => response.json())
	.then((result) => {
		console.log("Indiv data:", result.data);
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
		makeTitanRankingSection(titanRecords);
	})
	.catch((error) => console.error("Error fetching data:", error));

/* ----------------------------------- */
/*                                     */
/*     TITAN CARD API CALLS            */
/*                                     */
/* ----------------------------------- */
const avgScores = {};
const bestScores = [];
const roundDistributions = [];
makeTitanCards(avgScores, bestScores, roundDistributions);

/* ----------------------------------- */
/*   TITAN CARD - AVG SCORES           */
/* ----------------------------------- */
fetch(`/api/avgScores`)
	.then((response) => response.json())
	.then((result) => {
		result.data.forEach((titan) => {
			avgScores[titan.titan_name] = parseFloat(titan.avg_score);
		});
	})
	.catch((error) => console.error("Error fetching data:", error));

/* ----------------------------------- */
/*   TITAN CARD - BEST SCORES          */
/* ----------------------------------- */
fetch(`/api/bestScores`)
	.then((response) => response.json())
	.then((result) => {
		result.data.forEach((titan) => {
			bestScores[titan.titan_name] = {
				best_score: titan.best_score,
				max_score: titan.max_score,
				ingredient1: titan.ingredient1,
				ingredient2: titan.ingredient2,
			};
		});
	})
	.catch((error) => console.error("Error fetching data:", error));

/* ----------------------------------- */
/*   TITAN CARD - ROUND DISTRIBUTIONS  */
/* ----------------------------------- */
fetch(`/api/roundDistributions`)
	.then((response) => response.json())
	.then((result) => {
		result.data.forEach((titan) => {
			roundDistributions[titan.titan_name] = {
				round1_count: titan.round1_count,
				round2_count: titan.round2_count,
				round3_count: titan.round3_count,
			};
		});
	})
	.catch((error) => console.error("Error fetching data:", error));
