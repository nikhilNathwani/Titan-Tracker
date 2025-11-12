-- Table name: titan_episodes 
-- Schema:
--      season_num          INTEGER NOT NULL
--      episode_num         INTEGER NOT NULL
--      challenger_name     VARCHAR NOT NULL
--      judge_name          VARCHAR NOT NULL
--      PRIMARY KEY         (season_num, episode_num)


-- Query 1: View all episodes
SELECT *
FROM titan_episodes
ORDER BY season_num ASC, episode_num ASC;


-- Query 2: Insert new episode into titan_episodes
-- INSERT INTO titan_episodes (season_num, episode_num, challenger_name, judge_name)
-- VALUES 
-- (4, 10, 'Karen Akunowicz', 'Scott Conant');


-- Query 3: Delete episode from titan_episodes (use with caution)
-- DELETE FROM titan_episodes
-- WHERE season_num = 3
-- AND episode_num = 4;        
