/* --------------------------- */
/*                             */
/*       WIN LOSS WIDGET       */
/*                             */
/* --------------------------- */
function makeWinLossTeamDiv(num_win, num_tie, num_loss) {
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
function makeWinLossIndividualDivs(titanRecords) {
	//Note: titanRecords are already sorted in descending order
	//      of win-loss-tie record when returned by api

	//Fill in the table rows, and accomodate ties
	var currScore = 0;
	var currRank = 0;
	titanRecords.forEach((titan, index) => {
		//Determine rank
		var rank = index + 1;
		var isTie = false;
		if (currScore == titan.score) {
			isTie = true;
			rank = currRank;
		} else {
			currScore = titan.score;
			currRank = rank;
		}

		//Select table row
		const tableRow = document.querySelector(
			`table tr:nth-child(${index + 2})`
		); //adding 2 to skip over table header row

		//Populate rank cell
		const rankElement = tableRow.querySelector(".rank");
		rankElement.textContent = `${isTie ? "T-" : ""}${rank}${
			rank == 1 ? "st" : rank == 2 ? "nd" : "rd"
		}`;
		rankElement.className = `rank rank${rank}`;

		//Populate name cell
		const name = tableRow.querySelector(".statTitan");
		const [firstName, lastName] = titan.titan_name.split(" ");
		name.innerHTML = `<p>${firstName}</p><p>${lastName}</p>`;

		//Populate win-loss-tie cell
		const value = tableRow.querySelector(".statValue");
		value.textContent = `${titan.num_win} - ${titan.num_loss} - ${titan.num_tie}`;
	});
}
