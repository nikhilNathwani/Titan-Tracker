-- Table name: titan_rounds 
-- Schema:
--      season_num          INTEGER NOT NULL
--      episode_num         INTEGER NOT NULL
--      round_num           INTEGER NOT NULL (1, 2, or 3)
--      titan_name          VARCHAR NOT NULL (REFERENCES titans.titan_name)
--      ingredient1         VARCHAR NOT NULL
--      ingredient2         VARCHAR NOT NULL
--      max_score           INTEGER NOT NULL (10 for rounds 1&2, 20 for round 3)
--      titan_score         INTEGER NOT NULL
--      challenger_score    INTEGER NOT NULL
--      PRIMARY KEY         (season_num, episode_num, round_num)


-- Query 1: View all rounds
SELECT * FROM titan_rounds;


-- Query 2: Insert results into titan_rounds
-- INSERT INTO titan_rounds (
--     season_num, episode_num, round_num, titan_name, 
--     ingredient1, ingredient2, 
--     max_score, titan_score, challenger_score
-- )
-- VALUES 
--     (4, 6, 1, 'Michael Voltaggio', 
--     'Sweet Potato', 'Lime', 10, 7, 7),
--     (4, 6, 2, 'Ayesha Nurdjaja', 
--     'Lobster', 'Ossetra Caviar', 10, 8, 7),
--     (4, 6, 3, 'Brooke Williamson', 
--     'Suya Spice', 'Gooseberry', 20, 16, 18);


-- Query 3: Delete results from titan_rounds (use with caution)
-- DELETE FROM titan_rounds
-- WHERE season_num = 4 and episode_num = 5;