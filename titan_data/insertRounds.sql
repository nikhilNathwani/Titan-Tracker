------------------------------------------
--  Insert results into titan_rounds    --
------------------------------------------

-- INSERT INTO titan_rounds (
--     season_num, episode_num, round_num, titan_name, 
--     ingredient1, ingredient2, 
--     max_score, titan_score, challenger_score
-- )
-- VALUES 
--     (4, 4, 1, 'Michael Voltaggio', 
--     'Pork Ribs', 'Molasses', 10, 6, 7),
--     (4, 4, 2, 'Brooke Williamson', 
--     'Piquillo Pepper', 'Goat Cheese', 10, 9, 10),
--     (4, 4, 3, 'Ayesha Nurdjaja', 
--     'Dungeness Crab', 'Sushi Rice', 20, 19, 10);


SELECT * FROM titan_rounds


------------------------------------------
--  Delete results from titan_rounds    --
------------------------------------------
-- DELETE FROM titan_rounds
-- WHERE titan_name = 'Ayesha Nurdjaja';



------------------------------------------
--  Testing for Ayesha Nudjaja          --
------------------------------------------
-- INSERT INTO titan_rounds (season_num, episode_num, round_num, titan_name, ingredient1, ingredient2, max_score, titan_score, challenger_score)
-- VALUES 
--     (1, 1, 1, 'Ayesha Nurdjaja', 'Country Ham', 'Cheddar Cheese', 10, 9, 8);