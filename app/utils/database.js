const { Pool } = require("pg");

console.log("Connecting to Postgres:", process.env.POSTGRES_URL);

const pool = new Pool({
	connectionString: process.env.POSTGRES_URL,
});

// Generic function to submit queries and handle responses
function submitQuery(query, res) {
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

module.exports = { pool, submitQuery };
