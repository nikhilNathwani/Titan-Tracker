const express = require("express");
const { submitQuery } = require("../utils/database");

const router = express.Router();

// AVG SCORE ROUTE
router.get("/avgScores", (req, res) => {
	//Counts Rd3 scores as 2 separate 10pt scores (so it has
	// twice the impact on the avg as Rd1 & Rd2 scores)
	const query = `
	SELECT
		titan_name,
		SUM(titan_score) / SUM(CAST(max_score AS float) / 10) AS avg_score
	FROM titan_rounds
	GROUP BY titan_name; 
  	`;

	submitQuery(query, res);
});

// BEST SCORE ROUTE
//Best score is defined as highest value of titan_score/max_score
//Ties are broken in this order:
// - Highest max_score (i.e. 20pt round counts more than 10pt round)
// - Lowest challenger_score (i.e. largest margin of victory)
// - Latest episode
router.get("/bestScores", (req, res) => {
	const query = `
	WITH ranked_scores AS (
		SELECT
			titan_name,
			titan_score,
			max_score,
			ingredient1,
			ingredient2,
			ROW_NUMBER() OVER (
				PARTITION BY titan_name
				ORDER BY 
					CAST(titan_score AS float) / max_score DESC,
					max_score DESC,
					challenger_score ASC,
					10^season_num + episode_num DESC
			) AS rank
		FROM titan_rounds
	)
	SELECT
		titan_name,
		titan_score,
		max_score,
		ingredient1,
		ingredient2
	FROM ranked_scores
	WHERE rank = 1;
  	`;

	submitQuery(query, res);
});

// PER-ROUND STATS ROUTE
router.get("/perRoundStats", (req, res) => {
	const query = `
	SELECT
		titan_name,
		round_num,
		COUNT(*) AS battle_count,
		AVG(titan_score) AS avg_score,
		AVG(titan_score - challenger_score) AS avg_margin
	FROM
		titan_rounds
	GROUP BY
		titan_name,
		round_num;
  	`;

	submitQuery(query, res);
});

module.exports = router;
