const fs = require("fs");
const path = require("path");

// Read SQL query files - Records
const winLossQuery = fs.readFileSync(
	path.join(__dirname, "../queries/records", "winLoss.sql"),
	"utf8",
);

const titanRecordsQuery = fs.readFileSync(
	path.join(__dirname, "../queries/records", "titanRecords.sql"),
	"utf8",
);

// Read SQL query files - Stats
const avgScoresQuery = fs.readFileSync(
	path.join(__dirname, "../queries/stats", "avgScores.sql"),
	"utf8",
);

const bestScoresQuery = fs.readFileSync(
	path.join(__dirname, "../queries/stats", "bestScores.sql"),
	"utf8",
);

const perRoundStatsQuery = fs.readFileSync(
	path.join(__dirname, "../queries/stats", "perRoundStats.sql"),
	"utf8",
);

module.exports = {
	winLossQuery,
	titanRecordsQuery,
	avgScoresQuery,
	bestScoresQuery,
	perRoundStatsQuery,
};
