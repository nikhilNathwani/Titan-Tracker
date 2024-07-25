/* --------------------------- */
/*                             */
/*       WIN LOSS WIDGET       */
/*                             */
/* --------------------------- */
function makeWinLossSection(num_win, num_tie, num_loss) {
	const winElement = document.getElementById("numWin");
	winElement.textContent = `${num_win}`;

	const lossElement = document.getElementById("numLoss");
	lossElement.textContent = `${num_loss}`;

	// Caption ("won N of M battles, X% win rate")
	const percentSuccess = (100 * num_win) / (num_win + num_tie + num_loss);
	const caption = document.getElementById("winLossCaption");
	caption.textContent = `The titans have won ${num_win} out of ${
		num_win + num_loss
	} battles, which is a ${percentSuccess.toPrecision(3)}% win rate.`;
}

/* --------------------------- */
/*                             */
/*    TITAN RANKING WIDGET     */
/*                             */
/* --------------------------- */
function makeTitanRankingSection(titanRecords) {
	//Note: titanRecords are already sorted in descending order
	//      of win-loss-tie record when returned by api

	//Determine titan ranks
	const { ranks, rankStrings } = calcRanks(
		titanRecords.map((titan) => titan.score)
	);

	titanRecords.forEach((titan, index) => {
		//Select table row
		const tableRow = document.querySelector(
			`table tr:nth-child(${index + 2})`
		); //adding 2 to skip over table header row

		//Populate rank cell
		const rankElement = tableRow.querySelector(".rank");
		rankElement.textContent = rankStrings[index];
		rankElement.className = `rank rank${ranks[index]}`;

		//Populate name cell
		const name = tableRow.querySelector(".statTitan");
		const [firstName, lastName] = titan.titan_name.split(" ");
		name.innerHTML = `<p>${firstName}</p><p>${lastName}</p>`;

		//Populate win-loss-tie cell
		const value = tableRow.querySelector(".statValue");
		value.textContent = `${titan.num_win} - ${titan.num_loss} - ${titan.num_tie}`;
	});
}

function makeTitanCards(avgScores, bestScores, roundDistributions) {
	// makeTitanCards_record();
	// ^called within fetch(`/api/titanRanking`) to save an api call
	makeTitanCards_avgScore(avgScores);
	makeTitanCards_bestScore(bestScores);
	makeTitanCards_roundDistribution(roundDistributions);
}

function makeTitanCards_record() {
	return;
}

function makeTitanCards_avgScore(avgScores) {
	console.log("Avg scores:", avgScores);
}

function makeTitanCards_bestScore(bestScores) {
	console.log("Best scores:", bestScores);
}

function makeTitanCards_roundDistribution(roundDistributions) {
	console.log("Round Distributions", roundDistributions);
}

/* --------------------------- */
/*                             */
/*      HELPER FUNCTIONS       */
/*                             */
/* --------------------------- */

// 'scores' is already sorted in descending order
function calcRanks(scores) {
	var ranks = [];
	var rankStrings = [];
	if (scores[0] == scores[2]) {
		ranks = [1, 1, 1];
		rankStrings = ["T-1st", "T-1st", "T-1st"];
	} else if (scores[0] == scores[1]) {
		ranks = [1, 1, 3];
		rankStrings = ["T-1st", "T-1st", "3rd"];
	} else if (scores[1] == scores[2]) {
		ranks = [1, 2, 2];
		rankStrings = ["1st", "T-2nd", "T-2nd"];
	} else {
		ranks = [1, 2, 3];
		rankStrings = ["1st", "2nd", "3rd"];
	}
	return { ranks, rankstrings };
}
