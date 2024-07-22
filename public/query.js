fetch(`/api/winLossTeam`)
	.then((response) => response.json())
	.then((result) => {
		console.log(result.data, result.data);
		result = result.data[0];
		const num_win = parseInt(result.num_win, 10);
		const num_tie = parseInt(result.num_tie, 10);
		const num_loss = parseInt(result.num_loss, 10);
		makeWinLossTeamDiv(num_win, num_tie, num_loss);
	})
	.catch((error) => console.error("Error fetching data:", error));

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
		makeWinLossIndividualDivs(titanRecords);
	})
	.catch((error) => console.error("Error fetching data:", error));
