-- Titan Records Query:
--      Returns number of wins, ties, losses for each titan individually
-- Returns:
--      titan_name, num_win, num_tie, num_loss, score, is_retired
--
-- Sample Output:
--      titan_name        | num_win | num_tie | num_loss | score | is_retired
--      ------------------|---------|---------|----------|-------|------------
--      Nyesha Arrington  |   15    |    1    |    4     | 0.789 |   false
--      Brooke Williamson |   12    |    0    |    3     | 0.800 |   false
--      Tiffani Faison    |    8    |    1    |    6     | 0.571 |   true

WITH titan_stats AS (
	SELECT
		titan_name,
		COUNT(CASE WHEN titan_score > challenger_score THEN 1 END) AS num_win,
		COUNT(CASE WHEN titan_score = challenger_score THEN 1 END) AS num_tie,
		COUNT(CASE WHEN titan_score < challenger_score THEN 1 END) AS num_loss
	FROM titan_rounds
	GROUP BY titan_name
)
SELECT
	ts.titan_name,
	ts.num_win,
	ts.num_tie,
	ts.num_loss,
	CASE 
		WHEN (ts.num_win + ts.num_loss) = 0 THEN 0
		ELSE ts.num_win::float / (ts.num_win + ts.num_loss)
	END AS score,
	t.is_retired
FROM titan_stats ts
JOIN titans t ON ts.titan_name = t.titan_name
ORDER BY
	t.is_retired ASC,  -- active (false) first
	score DESC,        -- highest score
	ts.titan_name ASC; -- alphabetical
