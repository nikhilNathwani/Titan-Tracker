const express = require("express");
const { submitQuery } = require("../utils/dbConfig");
const { winLossQuery, titanRecordsQuery } = require("../utils/parseSQL");

const router = express.Router();

// WIN LOSS ROUTE (all titans combined)
// -Returns number of wins, ties, losses for the Titan overall
router.get("/winLoss", (req, res) => {
	submitQuery(winLossQuery, res);
});

// TITAN RECORDS ROUTE (per titan)
// -Returns number of wins, ties, losses for each titan individually
router.get("/titanRecords", (req, res) => {
	submitQuery(titanRecordsQuery, res);
});

module.exports = router;
