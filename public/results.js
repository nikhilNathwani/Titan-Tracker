//
// RESULT CHOREO
//
function clearExistingResults() {
	const results = document.querySelectorAll(".result");
	results.forEach((result) => {
		result.classList.add("disappear");
	});
}

function fadeInResults() {
	const results = document.querySelectorAll(".result");
	results.forEach((result, index) => {
		setTimeout(() => {
			result.classList.remove("disappear");
		}, index * 500);
	});
}

//
// RESULT CONSTRUCTION
//

// 1. "You would have [won/lost] $XYZ"
function makeTotalProfitDiv(totalProfit) {
	const totalProfitBanner = document.getElementById("total-profit-banner");
	const totalProfitHeader = totalProfitBanner.querySelector("p");
	const totalProfitSpan = totalProfitBanner.querySelector("span");

	totalProfitHeader.textContent = `You would've ${
		totalProfit >= 0 ? "won" : "lost"
	}`;

	totalProfitSpan.className = `result-banner-${
		totalProfit >= 0 ? "positive" : "negative"
	}`;

	totalProfitSpan.textContent = `${
		totalProfit >= 0 ? "+" : ""
	}${formatCurrency(totalProfit)}`;
}

// 2. "That's a XX% return on investment"
function makeROIDiv(totalProfit, numGames, wager) {
	const roi = (totalProfit * 100) / (numGames * wager);

	//Make ROI div banner
	const roiBanner = document.getElementById("roi-banner");
	const roiSpan = roiBanner.querySelector("span");
	roiSpan.className = `result-banner-${
		totalProfit >= 0 ? "positive" : "negative"
	}`;
	roiSpan.textContent = `${formatPercent(roi)}`;

	//Make ROI div details
	const roiDetails = document.getElementById("roi-details");
	//
	const roiTotalWagered = roiDetails.querySelector("#totalWagered");
	roiTotalWagered.textContent = `${formatCurrency(numGames * wager)}`;
	//
	const roiTotalPayout = roiDetails.querySelector("#totalPayout");
	roiTotalPayout.textContent = `${formatCurrency(
		totalProfit + numGames * wager
	)}`;
	//
	const roiProfit = roiDetails.querySelector("#profit");
	roiProfit.className = `result-chip-value result-chip-value-${
		totalProfit >= 0 ? "positive" : "negative"
	}`;
	roiProfit.textContent = `${totalProfit >= 0 ? "+" : ""}${formatCurrency(
		totalProfit
	)}`;
	//
	const roiPercentReturn = roiDetails.querySelector("#percentReturn");
	roiPercentReturn.className = `result-chip-value result-chip-value-${
		totalProfit >= 0 ? "positive" : "negative"
	}`;
	roiPercentReturn.textContent = `${formatPercent(roi)}`;
}

// 3. "This comes from X [correct/incorrect] guesses"
function makeWinLossDiv(
	totalProfit,
	prediction,
	numUnderdogWins,
	numUnderdogLosses,
	numFavoriteWins,
	numFavoriteLosses,
	profitUnderdogWins,
	profitUnderdogLosses,
	profitFavoriteWins,
	profitFavoriteLosses
) {
	//Make win-loss banner
	const winLossBanner = document.getElementById("win-loss-banner");
	const winLossCount = winLossBanner.querySelector("span");
	winLossCount.textContent = prediction
		? totalProfit >= 0
			? numUnderdogWins + numFavoriteWins
			: numUnderdogLosses + numFavoriteLosses
		: totalProfit >= 0
		? numUnderdogLosses + numFavoriteLosses
		: numUnderdogWins + numFavoriteWins;
	winLossCount.className = `result-banner-${
		totalProfit >= 0 ? "positive" : "negative"
	}`;
	const winLossLabel = winLossBanner.querySelector("span:last-child");
	winLossLabel.textContent = `${
		totalProfit >= 0 ? "correct" : "incorrect"
	} bets.`;

	//Make win-loss details
	const chipValues = {
		"underdog-win-gameCount": numUnderdogWins,
		"underdog-loss-gameCount": numUnderdogLosses,
		"favorite-win-gameCount": numFavoriteWins,
		"favorite-loss-gameCount": numFavoriteLosses,
		"underdog-win-payout": profitUnderdogWins,
		"underdog-loss-payout": profitUnderdogLosses,
		"favorite-win-payout": profitFavoriteWins,
		"favorite-loss-payout": profitFavoriteLosses,
	};
	["underdog", "favorite"].forEach((teamState) => {
		["win", "loss"].forEach((outcome) => {
			const prefix = teamState + "-" + outcome + "-";

			const gameCount_chip = document.getElementById(
				prefix + "gameCount"
			);
			gameCount_chip.textContent =
				chipValues[prefix + "gameCount"] + " games";

			const payout_chip = document.getElementById(prefix + "payout");
			payout_chip.textContent = `${
				chipValues[prefix + "payout"] >= 0 ? "+" : ""
			}${formatCurrency(chipValues[prefix + "payout"])}`;
			payout_chip.className = `result-chip-value result-chip-value-${
				chipValues[prefix + "payout"] >= 0 ? "positive" : "negative"
			}`;
		});
	});
}

// 4. "Top 3 highest-earning bets"
function makeTopBetsDiv(prediction, wager, topThreeBets) {
	const topGamesResult = document.getElementById("top-bets-result");
	const gameChips = topGamesResult.querySelectorAll(".result-chip");

	gameChips.forEach((gameChip, index) => {
		const gameNumberDiv = gameChip.querySelector(".result-chip-title");
		gameNumberDiv.textContent = `Game #${topThreeBets[index].gameNumber}:`;

		const profitDiv = gameChip.querySelector(".result-chip-value");
		profitDiv.textContent = `+${formatCurrency(
			topThreeBets[index].profit
		)}`;

		const gameTable = gameChip.querySelector("table");

		const gameTableOutcome = gameTable.querySelector(
			"tr.result-chip-table-outcome"
		);

		gameTableOutcome.querySelector("td").textContent = prediction
			? "Win"
			: "Loss";

		const gameTableOdds = gameTable.querySelector(
			"tr.result-chip-table-odds"
		);
		gameTableOdds.querySelector("th").textContent = prediction
			? "Odds to Win"
			: "Odds to Lose";
		gameTableOdds.querySelector("td").textContent = `${
			topThreeBets[index].odds >= 0 ? "+" : ""
		}${topThreeBets[index].odds}`;

		const gameTableWager = gameTable.querySelector(
			"tr.result-chip-table-wager"
		);
		gameTableWager.querySelector("td").textContent = `-${formatCurrency(
			wager
		)}`;

		const gameTablePayout = gameTable.querySelector(
			"tr.result-chip-table-payout"
		);
		gameTablePayout.querySelector("td").textContent = `+${formatCurrency(
			parseFloat(wager) + parseFloat(topThreeBets[index].profit)
		)}`;
	});
}

//
// HELPER FUNCTIONS
//
function formatCurrency(number) {
	// Determine if the number has cents
	let hasCents = number % 1 !== 0;
	let options = {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: hasCents ? 2 : 0,
		maximumFractionDigits: hasCents ? 2 : 0,
	};

	let formatter = new Intl.NumberFormat("en-US", options);
	return formatter.format(number);
}

function formatPercent(number) {
	return `${number >= 0 ? "+" : ""}${number.toPrecision(3)}%`;

	// *The below version converts 0.805 to 0.81 instead of keeping 0.805
	// return `${number >= 0 ? "+" : ""}${Number(
	// 	Number(number.toPrecision(3)).toFixed(2)
	// )}%`;
}
