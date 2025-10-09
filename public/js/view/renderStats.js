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
		"Ayesha Nurdjaja",
		"Tiffany Derry",
	];
	const roundNums = [1, 2, 3];
	var maxBattleCount = 0;

	titanNames.forEach((titanName) => {
		roundNums.forEach((roundNum) => {
			const titanNameID = titanName.replace(" ", "-");
			const battleCount = perRoundStats[titanName][roundNum].battle_count;
			const avgScore =
				perRoundStats[titanName][roundNum].avg_score == null
					? "n/a"
					: perRoundStats[titanName][roundNum].avg_score.toPrecision(
							3
					  );
			const avgMargin =
				perRoundStats[titanName][roundNum].avg_margin == null
					? "n/a"
					: Number(
							perRoundStats[titanName][
								roundNum
							].avg_margin.toPrecision(3)
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
	const histogram_maxWidth = 13.5;
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


