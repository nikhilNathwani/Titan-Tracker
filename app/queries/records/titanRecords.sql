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

WITH
-- Step 1: Compute win/tie/loss counts per titan
titan_records AS (
	SELECT
		titan_name,
		COUNT(CASE WHEN titan_score > challenger_score THEN 1 END) AS num_win,
		COUNT(CASE WHEN titan_score = challenger_score THEN 1 END) AS num_tie,
		COUNT(CASE WHEN titan_score < challenger_score THEN 1 END) AS num_loss
	FROM titan_rounds
	GROUP BY titan_name
),

-- Step 2: Calculate scores
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
	FROM titan_records
),

-- Step 3: Join with titans table to get is_retired
titan_final AS (
	SELECT
		ts.titan_name,
		ts.num_win,
		ts.num_tie,
		ts.num_loss,
		ts.score,
		t.is_retired
	FROM titan_scores ts
	JOIN titans t ON ts.titan_name = t.titan_name
)

SELECT
	titan_name,
	num_win,
	num_tie,
	num_loss,
	score,
	is_retired
FROM titan_final
ORDER BY
	is_retired ASC,  -- active (false) first
	score DESC,      -- highest score
	titan_name ASC;  -- alphabetical
