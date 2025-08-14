const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

console.log("Connecting to Postgres:", process.env.POSTGRES_URL);

const pool = new Pool({
	connectionString: process.env.POSTGRES_URL,
});

/* ------------------------------ */
/*                                */
/*       WIN LOSS ROUTE           */
/*                                */
/* ------------------------------ */
app.get("/api/winLoss", (req, res) => {
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

/* ------------------------------ */
/*                                */
/*    TITAN RECORDS ROUTE         */
/*                                */
/* ------------------------------ */
app.get("/api/titanRecords", (req, res) => {
	const query = `
	WITH titan_scores AS (
		SELECT 
			titan_name,
			COUNT(CASE WHEN titan_score > challenger_score THEN 1 END) AS num_win,
			COUNT(CASE WHEN titan_score = challenger_score THEN 1 END) AS num_tie,
			COUNT(CASE WHEN titan_score < challenger_score THEN 1 END) AS num_loss
		FROM titan_rounds
		GROUP BY titan_name
	)
	SELECT 
		titan_name,
		num_win,
		num_tie,
		num_loss,
		(num_win + 0.5 * num_tie) AS score
	FROM titan_scores
	ORDER BY score DESC, titan_name ASC;
  	`;

	submitQuery(query, res);
});

/* ------------------------------ */
/*                                */
/*    AVG SCORE ROUTE             */
/*                                */
/* ------------------------------ */
app.get("/api/avgScores", (req, res) => {
	//Counts Rd3 scores as 2 separate 10pt scores (so it has
	// twice the impact on the avg as Rd1 & Rd2 scores)
	const query = `
	SELECT
		titan_name,
		SUM(titan_score) / SUM(CAST(max_score AS float) / 10) AS avg_score
	FROM titan_rounds
	GROUP BY titan_name; 
  	`;

	//Divides Rd3 scores in half before averaging them in
	// const queryOld = `
	// WITH adjusted_scores AS (
	// 	SELECT
	// 		titan_name,
	// 		CASE
	// 			WHEN max_score = 20 THEN titan_score / 2
	// 			ELSE titan_score
	// 		END AS adjusted_score
	// 	FROM titan_rounds
	// )
	// SELECT
	// 	titan_name,
	// 	AVG(adjusted_score) AS avg_score
	// FROM adjusted_scores
	// GROUP BY titan_name;
	// `;

	submitQuery(query, res);
});

/* ------------------------------ */
/*                                */
/*    BEST SCORE ROUTE            */
/*                                */
/* ------------------------------ */
//Best score is defined as highest value of titan_score/max_score
//Ties are broken in this order:
// - Highest max_score (i.e. 20pt round counts more than 10pt round)
// - Lowest challenger_score (i.e. largest margin of victory)
// - Latest episode
app.get("/api/bestScores", (req, res) => {
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

/* ------------------------------ */
/*                                */
/*    PER-ROUND STATS ROUTE       */
/*                                */
/* ------------------------------ */
app.get("/api/perRoundStats", (req, res) => {
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

// Serve static files from public directory (like css/js files)
app.use(express.static(path.join(__dirname, "public")));

// Fallback to serve index.html for any other route
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Export app so server.js can import it
module.exports = app;

//////////////////// Helper functions //////////////////////
function submitQuery(query, response) {
	pool.query(query, (err, result) => {
		if (err) {
			console.error("Error executing query:", err);
			response.status(500).json({ error: err.message });
			return;
		}
		response.json({
			message: "success",
			data: result.rows,
		});
	});
}
