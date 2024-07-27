/* --------------------------- */
/*                             */
/*   WIN LOSS DISPLAY          */
/*                             */
/* --------------------------- */
function displayWinLoss(num_win, num_tie, num_loss) {
	populateElement("#numWin", `${num_win}`);
	populateElement("#numLoss", `${num_loss}`);

	// Caption ("won N of M battles, X% win rate")
	const percentSuccess = (100 * num_win) / (num_win + num_tie + num_loss);
	populateElement(
		"#winLossCaption",
		`The titans have won ${num_win} out of ${
			num_win + num_loss
		} battles, which is a ${percentSuccess.toPrecision(3)}% win rate.`
	);
}

/* --------------------------- */
/*                             */
/*   TITAN RECORDS DISPLAY     */
/*                             */
/* --------------------------- */
function displayTitanRecords(titanRecords) {
	//Note: titanRecords are already sorted in descending order
	//      of win-loss-tie record when returned by api

	//Determine titan ranks
	const { ranks, rankStrings } = calcRanks(
		titanRecords.map((titan) => titan.score)
	);

	//Populate (A) Titan Ranking and (B) Titan Cards
	//With (1) Rank, (2) Titan Name, (3) Win-Loss-Tie Record
	titanRecords.forEach((titan, index) => {
		//(A) Select table row of Titan Ranking
		const tableRow = `table tr:nth-child(${index + 2})`; //(+2 to skip over header row)
		//(B) Select Titan Card for current titan
		const titanNameID = titan.titan_name.replace(" ", "-");

		//
		// (1) RANK
		//
		// (A) Populate rank cell of Titan Rankings table
		populateElement(
			`${tableRow} .rank`,
			rankStrings[index],
			`rank rank${ranks[index]}`
		);
		// (B) Populate rank element of Titan Card title
		populateElement(
			`#${titanNameID} .rank`,
			`${rankStrings[index]}`,
			`rank rank${ranks[index]}`
		);

		//
		// (2) NAME
		//
		// (A) Populate name cell of Titan Rankings table
		const [firstName, lastName] = titan.titan_name.split(" ");
		populateElement(`${tableRow} .titanFirstName`, `${firstName}`);
		populateElement(`${tableRow} .titanLastName`, `${lastName}`);
		// (B) Populate name element of Titan Card title
		populateElement(
			`#${titanNameID} .section-title-name`,
			`${titan.titan_name}`
		);

		//
		// (3) WIN-LOSS-TIE RECORD
		//
		// (A) Populate win-loss-tie cell of Titan Rankings table
		populateElement(
			`${tableRow} .statValue`,
			`${titan.num_win} - ${titan.num_loss} - ${titan.num_tie}`
		);
		// (B) Populate win-loss-tie element of Titan Card
		populateElement(
			`#${titanNameID} .titanCard-record .widget-value`,
			`${titan.num_win} - ${titan.num_loss} - ${titan.num_tie}`
		);

		// Move Titan Card to proper place in rank order
		const body = document.body;
		body.appendChild(document.getElementById(titanNameID));
	});
	// Return footer to bottom of body
	document.body.appendChild(document.getElementById("footer"));
}

/* --------------------------- */
/*                             */
/*   AVERAGE SCORE DISPLAY     */
/*                             */
/* --------------------------- */
function displayAvgScore(titanName, avgScore) {
	const titanNameID = titanName.replace(" ", "-");
	populateElement(
		`#${titanNameID} .titanCard-avgScore .widget-value`,
		`${avgScore.toPrecision(3)}`
	);
}

/* --------------------------- */
/*                             */
/*   BEST SCORE DISPLAY        */
/*                             */
/* --------------------------- */
function displayBestScore(
	titanName,
	bestScore,
	maxScore,
	ingredient1,
	ingredient2
) {
	const titanNameID = titanName.replace(" ", "-");

	//Best Score value
	populateElement(
		`#${titanNameID} .titanCard-bestScore .widget-value`,
		`${bestScore}`
	);
	//Denominator (i.e. "max score" in "[best score] out of [max score]")
	populateElement(
		`#${titanNameID} .titanCard-bestScore .denominator`,
		`${maxScore}`
	);
	//1st ingredient
	populateElement(
		`#${titanNameID} .titanCard-ingredientList li:nth-child(1)`,
		`- ${ingredient1}`
	);
	//2nd ingredient
	populateElement(
		`#${titanNameID} .titanCard-ingredientList li:nth-child(2)`,
		`- ${ingredient2}`
	);
}

/* --------------------------- */
/*                             */
/*   PER-ROUND STATS DISPLAY   */
/*                             */
/* --------------------------- */
function displayPerRoundStats(perRoundStats) {
	const titanNames = [
		"Brooke Williamson",
		"Michael Voltaggio",
		"Tiffany Derry",
	];
	const roundNums = [1, 2, 3];
	var maxBattleCount = 0;

	titanNames.forEach((titanName) => {
		roundNums.forEach((roundNum) => {
			const titanNameID = titanName.replace(" ", "-");
			const battleCount = perRoundStats[titanName][roundNum].battle_count;
			const avgScore =
				perRoundStats[titanName][roundNum].avg_score.toPrecision(3);
			const avgMargin = Number(
				perRoundStats[titanName][roundNum].avg_margin.toPrecision(3)
			).toFixed(2);

			if (battleCount > maxBattleCount) {
				maxBattleCount = battleCount;
			}

			//# Battles
			populateElement(
				`#${titanNameID} tr:nth-child(${roundNum + 1}) .histogramCount`,
				`${battleCount}`
			);

			//Avg Score
			populateElement(
				`#${titanNameID} tr:nth-child(${
					roundNum + 1
				}) .histogramAvgScore`,
				`${avgScore}`
			);

			//Avg Margin (3 digits max)
			populateElement(
				`#${titanNameID} tr:nth-child(${
					roundNum + 1
				}) .histogramAvgMargin`,
				`${avgMargin >= 0 ? "+" : ""}${avgMargin}`
			);
		});
	});

	//Set width of "# Battles" histogram
	const histogram_minWidth = 2;
	const histogram_maxWidth = 15;
	titanNames.forEach((titanName) => {
		roundNums.forEach((roundNum) => {
			const titanNameID = titanName.replace(" ", "-");
			const battleCount = document.querySelector(
				`#${titanNameID} tr:nth-child(${roundNum + 1}) .histogramCount`
			);
			battleCount.style.width = `${
				histogram_minWidth +
				histogram_maxWidth *
					(perRoundStats[titanName][roundNum].battle_count /
						maxBattleCount)
			}ch`;
		});
	});
}

/* --------------------------- */
/*                             */
/*      HELPER FUNCTIONS       */
/*                             */
/* --------------------------- */
function populateElement(query, content, className = null) {
	const element = document.querySelector(query);
	element.textContent = content;
	if (className) {
		element.className = className;
	}
}

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
	return { ranks, rankStrings };
}
