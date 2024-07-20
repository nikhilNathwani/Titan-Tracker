fetch(`/api/winLossTeam`)
	.then((response) => response.json())
	.then((result) => {
		console.log(result.data);
		const num_win = parseInt(result.data.num_win, 10);
		const num_tie = parseInt(result.data.num_tie, 10);
		const num_loss = parseInt(result.data.num_loss, 10);
		makeWinLossTeamDiv(num_win, num_tie, num_loss);
	})
	.catch((error) => console.error("Error fetching data:", error));

fetch(`/api/winLossIndividual`)
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
			});
		});
		makeWinLossIndividualDivs(titanRecords);
	})
	.catch((error) => console.error("Error fetching data:", error));

function makeWinLossTeamDiv(num_win, num_tie, num_loss) {
	console.log("params:", num_win, num_tie, num_loss);
	// const value = document.querySelector(".teamStatValue");
	const caption = document.querySelector(".teamStatCaption");

	// value.textContent = `${num_win} - ${num_loss}${
	// 	num_tie > 0 ? ` - ${num_tie}` : ""
	// }`;

	const winElement = document.getElementById("numWin");
	winElement.textContent = `${num_win}`;

	const lossElement = document.getElementById("numLoss");
	lossElement.textContent = `${num_loss}`;

	const percentSuccess = (100 * num_win) / (num_win + num_tie + num_loss);
	caption.textContent = `The titans have won ${num_win} out of ${
		num_win + num_loss
	} battles, which is a ${percentSuccess.toPrecision(3)}% win rate.`;
}

function makeWinLossIndividualDivs(titanRecords) {
	//Sort titans from best record to worst
	//Wins worth 1 pt, ties worth 0.5 pts
	titanRecords.sort((titan1, titan2) => {
		const score1 = titan1.num_win + 0.5 * titan1.num_tie;
		const score2 = titan2.num_win + 0.5 * titan2.num_tie;
		return score2 - score1;
	});

	//Fill in the table rows
	var currScore = 0;
	var currRank = 0;
	titanRecords.forEach((titan, index) => {
		const score = titan.num_win + 0.5 * titan.num_tie;

		//Determine rank
		var rank = index + 1;
		var isTie = false;
		if (currScore == score) {
			isTie = true;
			rank = currRank;
		} else {
			currScore = score;
			currRank = rank;
		}

		//Populate table row
		const tableRow = document.querySelector(
			`table tr:nth-child(${index + 2})`
		); //adding 2 to skip over table header row

		const rankElement = tableRow.querySelector(".individualStatRank");
		rankElement.textContent = `${isTie ? "T-" : ""}${rank}${
			rank == 1 ? "st" : rank == 2 ? "nd" : "rd"
		}`;

		const name = tableRow.querySelector(".individualStatName");
		const [firstName, lastName] = titan.titan_name.split(" ");
		name.innerHTML = `<p>${firstName}</p><p>${lastName}</p>`;

		const value = tableRow.querySelector(".individualStatValue");
		value.textContent = `${titan.num_win}-${titan.num_loss}-${titan.num_tie}`;
	});
}
