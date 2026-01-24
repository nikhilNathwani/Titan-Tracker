-- Average Scores Query:
--      Counts Rd3 scores as 2 separate 10pt scores (so it has
--      twice the impact on the avg as Rd1 & Rd2 scores)
-- Returns:
--      titan_name, avg_score
--
-- Sample Output:
--      titan_name        | avg_score
--      ------------------|----------
--      Nyesha Arrington  |   7.8542
--      Brooke Williamson |   7.2167
--      Tiffani Faison    |   6.9231

SELECT
	titan_name,
	SUM(titan_score) / SUM(CAST(max_score AS float) / 10) AS avg_score
FROM titan_rounds
GROUP BY titan_name;
