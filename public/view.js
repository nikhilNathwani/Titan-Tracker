/* --------------------------- */
/*                             */
/*       WIN LOSS WIDGET       */
/*                             */
/* --------------------------- */
function makeWinLossSection(num_win, num_tie, num_loss) {
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
		//Select table row (skip over header row)
		const tableRow = `table tr:nth-child(${index + 2}) `;

		//Populate rank cell
		populateElement(
			tableRow + ".rank",
			rankStrings[index],
			`rank rank${ranks[index]}`
		);

		//Populate name cell
		const [firstName, lastName] = titan.titan_name.split(" ");
		populateElement(tableRow + ".titanFirstName", `${firstName}`);
		populateElement(tableRow + ".titanLastName", `${lastName}`);

		//Populate win-loss-tie cell
		populateElement(
			tableRow + ".statValue",
			`${titan.num_win} - ${titan.num_loss} - ${titan.num_tie}`
		);

		//Create titan card
		initTitanCard(
			index,
			titan.titan_name,
			ranks[index],
			rankStrings[index],
			titan.num_win,
			titan.num_loss,
			titan.num_tie
		);
	});
}

//Assign titan card to specific titan and populate the
//'Record' widget (so I don't have to query for record twice)
function initTitanCard(
	index,
	titan_name,
	rank,
	rankString,
	num_win,
	num_loss,
	num_tie
) {
	const titanNameID = titan_name.replace(" ", "-");

	//Assign titan name as id for index-th titan card
	const titanCard = document.querySelectorAll(`.titanCard`)[index];
	titanCard.id = titanNameID;

	//Set section title
	populateElement(
		`${titanNameID} .rank`,
		`${rankString}`,
		`.rank .rank${rank}`
	);
	populateElement(`${titanNameID} .section-title-name`, `${titan_name}`);

	//Populate record widget
	populateElement(
		`${titanNameID} .titanCard-record .widget-value`,
		`${num_win} - ${num_loss} - ${num_tie}`
	);
}

function setTitanCards(avgScores, bestScores, roundDistributions) {
	setTitanCards_avgScore(avgScores);
	setTitanCards_bestScore(bestScores);
	// setTitanCards_roundDistribution(roundDistributions);
}

function setTitanCards_avgScore(avgScores) {
	console.log("Avg scores:", avgScores);

	avgScores.forEach((titan) => {
		const titanNameID = titan.name.replace(" ", "-");

		populateElement(
			`${titanNameID} .titanCard-avgScore .widget-value`,
			`${titan.avg_score}`
		);
	});
}

function setTitanCards_bestScore(bestScores) {
	console.log("Best scores:", bestScores);

	bestScores.forEach((titan) => {
		const titanNameID = titan.name.replace(" ", "-");

		//Best score value
		populateElement(
			`${titanNameID} .titanCard-bestScore .widget-value`,
			`${titan.best_score}`
		);

		//Denominator ("out of __")
		populateElement(
			`${titanNameID} .titanCard-bestScore .denominator`,
			`${titan.max_score}`
		);

		//1st ingredient
		populateElement(
			`${titanNameID} .titanCard-ingredientList li:nth-child(1)`,
			`${titan.ingredient1}`
		);

		//2nd ingredient
		populateElement(
			`${titanNameID} .titanCard-ingredientList li:nth-child(2)`,
			`${titan.ingredient2}`
		);
	});
}

function setTitanCards_roundDistribution(roundDistributions) {
	console.log("Round Distributions", roundDistributions);

	roundDistributions.forEach((titan) => {
		const titanNameID = titan.name.replace(" ", "-");

		populateElement(
			`${titanNameID} .titanCard-roundDistribution .histogramCount:nth-child(1)`,
			`${titan.round1_count}`
		);

		populateElement(
			`${titanNameID} .titanCard-roundDistribution .histogramCount:nth-child(2)`,
			`${titan.round2_count}`
		);

		populateElement(
			`${titanNameID} .titanCard-roundDistribution .histogramCount:nth-child(3)`,
			`${titan.round3_count}`
		);
	});
}

/* --------------------------- */
/*                             */
/*      HELPER FUNCTIONS       */
/*                             */
/* --------------------------- */
function populateElement(query, content, className = null) {
	const element = document.querySelector(query);
	element.innerHTML = content;
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
