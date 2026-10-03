import { Pool, types } from "pg";

// By default pg returns bigint (e.g. COUNT, RANK) and numeric (e.g. AVG)
// values as strings, since they can exceed JS number precision. Our values
// (counts, score averages) are nowhere near those limits, so parse them as
// numbers once here instead of casting in every query or converting in code.
types.setTypeParser(types.builtins.INT8, (v) => parseInt(v, 10));
types.setTypeParser(types.builtins.NUMERIC, (v) => parseFloat(v));

const pool = new Pool({
	connectionString: process.env.POSTGRES_URL,
});

export { pool };
