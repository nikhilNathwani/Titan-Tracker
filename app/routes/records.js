const express = require("express");
const { submitQuery } = require("../utils/database");

const router = express.Router();

// WIN LOSS ROUTE (all titans combined)
// -Returns number of wins, ties, losses for the Titan overall
router.get("/winLoss", (req, res) => {
	const query = `
    WITH episode_sums AS (
		SELECT
			SUM(titan_score) AS total_titan_score,
			SUM(challenger_score) AS total_challenger_score
		FROM titan_rounds
		GROUP BY season_num, episode_num
	)
	SELECT
		COUNT(CASE WHEN total_titan_score > total_challenger_score THEN 1 END) AS num_win,
		COUNT(CASE WHEN total_titan_score = total_challenger_score THEN 1 END) AS num_tie,
		COUNT(CASE WHEN total_titan_score < total_challenger_score THEN 1 END) AS num_loss
	FROM episode_sums; 
  	`;

	submitQuery(query, res);
});

// TITAN RECORDS ROUTE (per titan)
// -Returns number of wins, ties, losses for each titan individually
router.get("/titanRecords", (req, res) => {
	const query = `
	WITH
	-- Step 1: Compute win/tie/loss counts per titan
	titan_records AS (
		SELECT
			titan_name,
			COUNT(CASE WHEN titan_score > challenger_score THEN 1 END) AS num_win,
			COUNT(CASE WHEN titan_score = challenger_score THEN 1 END) AS num_tie,
			COUNT(CASE WHEN titan_score < challenger_score THEN 1 END) AS num_loss
		FROM titan_rounds
		GROUP BY titan_name
	),
	
	-- Step 2: Calculate scores
	titan_scores AS (
		SELECT
			titan_name,
			num_win,
			num_tie,
			num_loss,
			CASE 
				WHEN (num_win + num_loss) = 0 THEN 0
				ELSE num_win::float / (num_win + num_loss)
			END AS score
		FROM titan_records
	),
	
	-- Step 3: Join with titans table to get is_retired
	titan_final AS (
		SELECT
			ts.titan_name,
			ts.num_win,
			ts.num_tie,
			ts.num_loss,
			ts.score,
			t.is_retired
		FROM titan_scores ts
		JOIN titans t ON ts.titan_name = t.titan_name
	)
	
	SELECT
		titan_name,
		num_win,
		num_tie,
		num_loss,
		score,
		is_retired
	FROM titan_final
	ORDER BY
		is_retired ASC,  -- active (false) first
		score DESC,      -- highest score
		titan_name ASC;  -- alphabetical
	`;

	submitQuery(query, res);
});

module.exports = router;
