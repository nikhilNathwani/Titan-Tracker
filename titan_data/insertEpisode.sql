
----------------------------------------------
--  Insert new episode into titan_episodes  --
----------------------------------------------
INSERT INTO titan_episodes (season_num, episode_num, challenger_name, judge_name)
VALUES 
(3, 4, 'Eric Adjepong', 'Chris Cheung');


----------------------------------------------
--  Delete episode from titan_episodes      --
----------------------------------------------
DELETE FROM titan_episodes
WHERE season_num = 3
AND episode_num = 4;        
