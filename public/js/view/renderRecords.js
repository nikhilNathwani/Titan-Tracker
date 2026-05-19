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
	const winLossCaption = document.getElementById("winLossCaption");
	winLossCaption.innerHTML = `The titans have won ${num_win} out of ${
		num_win + num_loss
	} battles, which is a <b>${percentSuccess.toPrecision(3)}%</b> win rate.`;

	// Share button
	document
		.querySelector("#winLoss .section-content")
		.appendChild(createShareButton("winLoss", "Team Record"));
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
	const rankStrings = generateRankStrings(
		titanRecords.map((titan) => titan.rank),
	);

	//Populate (A) Titan Leaderboard and (B) Titan Cards
	//With (1) Rank, (2) Titan Name, (3) Win-Loss-Tie Record

	// Share button on leaderboard card
	document
		.querySelector("#titanLeaderboard .section-content")
		.appendChild(
			createShareButton("titanLeaderboard", "Titan Leaderboard"),
		);

	titanRecords.forEach((titan, index) => {
		//(A) Select table row of Titan Leaderboard
		const tableRow = `#titanLeaderboard table tr:nth-child(${index + 2})`; //(+2 to skip over header row)
		//(B) Select Titan Card for current titan
		const titanNameID = titan.titan_name.replace(" ", "-");

		//
		// (1) RANK
		//
		// (A) Populate rank cell of Titan Leaderboard table
		populateElement(
			`${tableRow} .rank`,
			rankStrings[index],
			`rank rank${titan.rank == null ? "NR" : titan.rank}`,
		);
		// (B) Populate rank element of Titan Card title
		populateElement(
			`#${titanNameID} .rank`,
			rankStrings[index],
			`rank rank${titan.rank == null ? "NR" : titan.rank}`,
		);

		//
		// (2) NAME
		//
		// (A) Populate name cell of Titan Leaderboard table
		const [firstName, lastName] = titan.titan_name.split(" ");
		populateElement(`${tableRow} .titanFirstName`, `${firstName}`);
		populateElement(`${tableRow} .titanLastName`, `${lastName}`);
		// (B) Populate name element of Titan Card title
		populateElement(
			`#${titanNameID} .section-title-name`,
			`${titan.titan_name}`,
		);

		//
		// (3) WIN-LOSS-TIE RECORD
		//
		// (A) Populate win-loss-tie cell of Titan Leaderboard table
		populateElement(
			`${tableRow} .statValue`,
			`${titan.num_win} - ${titan.num_loss} - ${titan.num_tie}`,
		);
		// (B) Populate win-loss-tie element of Titan Card
		populateElement(
			`#${titanNameID} .titanCard-record .widget-value`,
			`${formattedRecordString(
				titan.num_win,
				titan.num_loss,
				titan.num_tie,
			)}`,
		);

		//
		// (4) SHARE BUTTON
		//
		document
			.querySelector(`#${titanNameID} .section-content`)
			.appendChild(createShareButton(titanNameID, titan.titan_name));

		// Move Titan Card to proper place in rank order
		const body = document.body;
		body.appendChild(document.getElementById(titanNameID));
	});
	// Return footer & script tags to bottom of body
	document.body.appendChild(document.getElementById("footer"));
	document.querySelectorAll("script").forEach((script) => {
		document.body.appendChild(script);
	});
}

/* --------------------------- */
/*                             */
/*     CREATE SHARE BUTTON     */
/*                             */
/* --------------------------- */
function createShareButton(sectionId, sectionName) {
	const btn = document.createElement("button");
	btn.className = "section-share-btn";
	btn.textContent = "Share ↗";
	btn.setAttribute("aria-label", `Share ${sectionName}`);
	btn.addEventListener("click", () =>
		handleShare(sectionId, sectionName, btn),
	);
	return btn;
}

/* --------------------------- */
/*                             */
/*      SHARE HANDLER          */
/*                             */
/* --------------------------- */
async function handleShare(sectionId, sectionName, btn) {
	const url = `${window.location.origin}/#${sectionId}`;
	const url = `${window.location.origin}/#${titanId}`;

	if (typeof gtag === "function") {
		gtag("event", "share_card", {
			event_category: "engagement",
			event_label: sectionName,
		});
	}

	if (navigator.share) {
		try {
			await navigator.share({
				title: "Titan Tracker",
				text: `Check out ${sectionName} on Titan Tracker`,
				url,
			});
		} catch (e) {
			// user dismissed — no-op
		}
	} else {
		try {
			await navigator.clipboard.writeText(url);
			const original = btn.textContent;
			btn.textContent = "✓ Copied!";
			btn.disabled = true;
			setTimeout(() => {
				btn.textContent = original;
				btn.disabled = false;
			}, 2000);
		} catch (e) {
			// clipboard unavailable — silent fail
		}
	}
}

/* --------------------------- */
/*                             */
/*      HELPER FUNCTIONS       */
/*                             */
/* --------------------------- */

function formattedRecordString(num_win, num_loss, num_tie) {
	// Helper function to check if a number has at least two digits
	const isTwoDigit = (num) => Math.abs(num) >= 10;

	// Count how many of the arguments are at least two digits
	const count = [num_win, num_loss, num_tie].filter(isTwoDigit).length;

	// Check if at least two arguments are at least two digits
	if (count >= 2) {
		return `${num_win}-${num_loss}-${num_tie}`;
	} else {
		return `${num_win} - ${num_loss} - ${num_tie}`;
	}
}
