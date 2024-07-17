//Fetch data from db and pass results along to calcBetResults then makeResultDivs
function generateResults() {
	const { seasonStartYear, team, prediction, wager } = getFilterValues();
	fetch(`/api/games?seasonStart=${seasonStartYear}&team=${team}`)
		.then((response) => response.json())
		.then((games) => {
			const { betResults, topThreeBets } = calcBetResults(
				games.data,
				prediction,
				wager
			);
			makeResultDivs(betResults, topThreeBets, prediction, wager);
		})
		.catch((error) => console.error("Error fetching data:", error));
}

function makeResultDivs(betResults, topThreeBets, prediction, wager) {
	const {
		numUnderdogWins,
		numUnderdogLosses,
		numFavoriteWins,
		numFavoriteLosses,
		profitUnderdogWins,
		profitUnderdogLosses,
		profitFavoriteWins,
		profitFavoriteLosses,
	} = betResults;
	const numWins = numUnderdogWins + numFavoriteWins;
	const numLosses = numUnderdogLosses + numFavoriteLosses;
	const numGames = numWins + numLosses;
	const totalProfit =
		profitUnderdogWins +
		profitUnderdogLosses +
		profitFavoriteWins +
		profitFavoriteLosses;
	makeTotalProfitDiv(totalProfit);
	makeROIDiv(totalProfit, numGames, wager);
	makeWinLossDiv(
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
	);
	makeTopBetsDiv(prediction, wager, topThreeBets);
}

function calcBetResults(games, prediction, wager) {
	let betResults = {
		numUnderdogWins: 0,
		numUnderdogLosses: 0,
		numFavoriteWins: 0,
		numFavoriteLosses: 0,
		profitUnderdogWins: 0,
		profitUnderdogLosses: 0,
		profitFavoriteWins: 0,
		profitFavoriteLosses: 0,
	};
	let winningBets = [];

	games.forEach((game) => {
		const odds = prediction
			? parseFloat(game.winodds)
			: parseFloat(game.loseodds);

		let resultToUpdate = {
			gameCount:
				"num" +
				(prediction
					? odds >= 0
						? "Underdog"
						: "Favorite"
					: odds >= 0
					? "Favorite"
					: "Underdog") +
				(game.outcome ? "Wins" : "Losses"),
			profitSum:
				"profit" +
				(prediction
					? odds >= 0
						? "Underdog"
						: "Favorite"
					: odds >= 0
					? "Favorite"
					: "Underdog") +
				(game.outcome ? "Wins" : "Losses"),
		};
		const profit = calcProfit(prediction, game.outcome, odds, wager);
		betResults[resultToUpdate.profitSum] += profit;
		betResults[resultToUpdate.gameCount]++;

		if (game.outcome == prediction) {
			winningBets.push({
				gameNumber: game.gamenumber,
				odds: odds,
				profit: profit,
			});
		}
	});

	//Get top 3 highest-earning games
	const sortedByProfit = winningBets.sort((a, b) => b.profit - a.profit);
	const topThreeBets = sortedByProfit.slice(0, 3);

	return { betResults, topThreeBets };
}

//
//HELPER FUNCTIONS
//
//Calculates profit given odds, wager, and bet outcome
function calcProfit(prediction, outcome, odds, wager) {
	if (prediction !== outcome) {
		return wager * -1;
	} else {
		let profit = 0;
		if (odds > 0) {
			profit = odds * (wager / 100);
		} else {
			profit = (wager / odds) * -100;
		}
		return Math.floor(profit * 100) / 100; //truncate to 2 decimal places
	}
}
