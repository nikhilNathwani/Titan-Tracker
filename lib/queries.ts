// NOTE: these queries are read from disk with fs.readFileSync at module load.
// That is only safe because every route that imports this module is statically
// prerendered (app/page.tsx is `force-static`), so the reads happen at build
// time where the .sql files exist — not in a Vercel serverless function, whose
// bundle would not reliably include them (Next's file tracer can't follow a
// process.cwd()-based path). If you ever make the homepage (or anything else in
// its tree) dynamic, switch this file to importing the .sql files instead:
//   next.config.mjs:  webpack: (c) => { c.module.rules.push({ test: /\.sql$/, type: "asset/source" }); return c; }
//   here:             import winLossQuery from "./queries/records/winLoss.sql";
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
