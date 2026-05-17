import fs from "fs";
import path from "path";

export const winLossQuery = fs.readFileSync(
	path.join(process.cwd(), "app/queries/records", "winLoss.sql"),
	"utf8",
);

export const titanRecordsQuery = fs.readFileSync(
	path.join(process.cwd(), "app/queries/records", "titanRecords.sql"),
	"utf8",
);

export const avgScoresQuery = fs.readFileSync(
	path.join(process.cwd(), "app/queries/stats", "avgScores.sql"),
	"utf8",
);

export const bestScoresQuery = fs.readFileSync(
	path.join(process.cwd(), "app/queries/stats", "bestScores.sql"),
	"utf8",
);

export const perRoundStatsQuery = fs.readFileSync(
	path.join(process.cwd(), "app/queries/stats", "perRoundStats.sql"),
	"utf8",
);
