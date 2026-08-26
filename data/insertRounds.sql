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
SELECT *
FROM titan_rounds
ORDER BY season_num ASC, episode_num ASC, round_num ASC;


-- Query 2: Insert results into titan_rounds
-- INSERT INTO titan_rounds (
--     season_num, episode_num, round_num, titan_name, 
--     ingredient1, ingredient2, 
--     max_score, titan_score, challenger_score
-- )
-- VALUES 
--     (5, 1, 1, 'Brooke Williamson', 
--     'Sea Urchin', 'Cherry Tomato', 10, 8, 4),
--     (5, 1, 2, 'Michael Voltaggio', 
--     'Whole Chicken', 'Lemongrass', 10, 7, 6),
--     (5, 1, 3, 'Ayesha Nurdjaja', 
--     'Orange Blossom Water', 'Sicilian Pistachio', 20, 13, 19);


-- Query 3: Delete results from titan_rounds (use with caution)
-- DELETE FROM titan_rounds
-- WHERE season_num = 4 and episode_num = 5;
