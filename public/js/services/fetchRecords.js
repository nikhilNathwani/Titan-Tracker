/* ----------------------------------- */
/*                                     */
/*      WIN LOSS API CALL              */
/*                                     */
/* ----------------------------------- */
fetch(`/api/winLoss`)
	.then((response) => response.json())
	.then((result) => {
		console.log("API result:", result); // 👈 check the structure here
		result = result.data[0];
		const num_win = parseInt(result.num_win, 10);
		const num_tie = parseInt(result.num_tie, 10);
		const num_loss = parseInt(result.num_loss, 10);
		displayWinLoss(num_win, num_tie, num_loss);
	})
	.catch((error) => console.error("Error fetching data:", error));

/* ----------------------------------- */
/*                                     */
/*   TITAN RECORDS API CALL            */
/*                                     */
/* ----------------------------------- */
fetch(`/api/titanRecords`)
	.then((response) => response.json())
	.then((result) => {
		const titanRecords = result.data.map((titan) => ({
			titan_name: titan.titan_name,
			num_win: parseInt(titan.num_win, 10),
			num_tie: parseInt(titan.num_tie, 10),
			num_loss: parseInt(titan.num_loss, 10),
			rank: parseInt(titan.rank, 10),
			is_retired: titan.is_retired,
		}));
		displayTitanRecords(titanRecords);
	})
	.catch((error) => console.error("Error fetching data:", error));
