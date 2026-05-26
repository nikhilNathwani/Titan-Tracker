import fs from "fs";
import path from "path";

export const winLossQuery: string = fs.readFileSync(
	path.join(process.cwd(), "lib/queries/records", "winLoss.sql"),
	"utf8",
);

export const titanRecordsQuery: string = fs.readFileSync(
	path.join(process.cwd(), "lib/queries/records", "titanRecords.sql"),
	"utf8",
);

export const avgScoresQuery: string = fs.readFileSync(
	path.join(process.cwd(), "lib/queries/stats", "avgScores.sql"),
	"utf8",
);

export const bestScoresQuery: string = fs.readFileSync(
	path.join(process.cwd(), "lib/queries/stats", "bestScores.sql"),
	"utf8",
);

export const perRoundStatsQuery: string = fs.readFileSync(
	path.join(process.cwd(), "lib/queries/stats", "perRoundStats.sql"),
	"utf8",
);
