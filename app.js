const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
	connectionString: process.env.POSTGRES_URL,
});

/* --------------------------- */
/*                             */
/*       WIN LOSS ROUTE        */
/*                             */
/* --------------------------- */
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

	submitQuery(query, req, res);
});

/* --------------------------- */
/*                             */
/*    TITAN RANKING ROUTE      */
/*                             */
/* --------------------------- */
app.get("/api/titanRanking", (req, res) => {
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

	submitQuery(query, req, res);
});

// Serve static files from public directory (like css/js files)
app.use(express.static(path.join(__dirname, "public")));

// Fallback to serve index.html for any other route
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

//////////////////// Helper functions //////////////////////
function submitQuery(query, req, res) {
	pool.query(query, (err, result) => {
		if (err) {
			console.error("Error executing query:", err);
			res.status(500).json({ error: err.message });
			return;
		}
		res.json({
			message: "success",
			data: result.rows,
		});
	});
}
