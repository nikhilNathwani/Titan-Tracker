------------------------------------------
--  Insert results into titan_rounds    --
------------------------------------------

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


SELECT * FROM titan_rounds


------------------------------------------
--  Delete results from titan_rounds    --
------------------------------------------
-- DELETE FROM titan_rounds
-- WHERE season_num = 4 and episode_num = 5;



------------------------------------------
--  Testing for Ayesha Nudjaja          --
------------------------------------------
-- INSERT INTO titan_rounds (season_num, episode_num, round_num, titan_name, ingredient1, ingredient2, max_score, titan_score, challenger_score)
-- VALUES 
--     (1, 1, 1, 'Ayesha Nurdjaja', 'Country Ham', 'Cheddar Cheese', 10, 9, 8);