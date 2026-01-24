-- Best Score Query:
--      Best score is defined as highest value of titan_score/max_score
--      Ties are broken in this order:
--          - Highest max_score (i.e. 20pt round counts more than 10pt round)
--          - Lowest challenger_score (i.e. largest margin of victory)
--          - Latest episode
-- Returns:
--      titan_name, titan_score, max_score, ingredient1, ingredient2
--
-- Sample Output:
--      titan_name        | titan_score | max_score | ingredient1  | ingredient2
--      ------------------|-------------|-----------|--------------|-------------
--      Nyesha Arrington  |      10     |     10    | Pork Chops   | Apples
--      Brooke Williamson |      20     |     20    | Lamb         | Figs
--      Tiffani Faison    |       9     |     10    | Chicken      | Mushrooms

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
