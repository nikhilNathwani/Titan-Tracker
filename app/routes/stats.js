const express = require("express");
const { submitQuery } = require("../utils/dbConfig");
const {
	avgScoresQuery,
	bestScoresQuery,
	perRoundStatsQuery,
} = require("../utils/parseSQL");

const router = express.Router();

// AVG SCORE ROUTE
router.get("/avgScores", (req, res) => {
	//Counts Rd3 scores as 2 separate 10pt scores (so it has
	// twice the impact on the avg as Rd1 & Rd2 scores)
	submitQuery(avgScoresQuery, res);
});

// BEST SCORE ROUTE
//Best score is defined as highest value of titan_score/max_score
//Ties are broken in this order:
// - Highest max_score (i.e. 20pt round counts more than 10pt round)
// - Lowest challenger_score (i.e. largest margin of victory)
// - Latest episode
router.get("/bestScores", (req, res) => {
	submitQuery(bestScoresQuery, res);
});

// PER-ROUND STATS ROUTE
router.get("/perRoundStats", (req, res) => {
	submitQuery(perRoundStatsQuery, res);
});

module.exports = router;
