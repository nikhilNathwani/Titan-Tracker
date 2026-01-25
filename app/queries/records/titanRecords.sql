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
),
titan_scores AS (
	SELECT
		titan_name,
		num_win,
		num_tie,
		num_loss,
		CASE 
			WHEN (num_win + num_loss) = 0 THEN 0
			ELSE num_win::float / (num_win + num_loss)
		END AS score
	FROM titan_stats
)
SELECT
	ts.titan_name,
	t.is_retired,
	RANK() OVER (
		PARTITION BY t.is_retired
		ORDER BY
			ts.score DESC
	) AS rank,
	ts.num_win,
	ts.num_tie,
	ts.num_loss
FROM titan_scores ts
JOIN titans t ON ts.titan_name = t.titan_name
ORDER BY
	t.is_retired ASC,  -- active (false) first
	rank ASC,          -- highest score
	titan_name ASC;    -- alphabetical