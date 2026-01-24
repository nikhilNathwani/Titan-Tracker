-- Win Loss Query:
--      Returns number of wins, ties, losses for the Titan overall (all titans combined)
-- Returns:
--      num_win, num_tie, num_loss
--
-- Sample Output:
--      num_win | num_tie | num_loss
--      --------|---------|----------
--         42   |    3    |    18

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
