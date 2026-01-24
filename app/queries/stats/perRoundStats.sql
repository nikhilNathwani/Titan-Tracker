-- Per-Round Stats Query:
--      Returns statistics broken down by round number for each titan
-- Returns:
--      titan_name, round_num, battle_count, avg_score, avg_margin
--
-- Sample Output:
--      titan_name        | round_num | battle_count | avg_score | avg_margin
--      ------------------|-----------|--------------|-----------|------------
--      Nyesha Arrington  |     1     |      20      |   7.85    |    2.15
--      Nyesha Arrington  |     2     |      20      |   7.40    |    1.85
--      Nyesha Arrington  |     3     |      20      |   15.80   |    4.20
--      Brooke Williamson |     1     |      15      |   7.20    |    1.67

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
	round_num
ORDER BY
	titan_name ASC,
	round_num ASC;
