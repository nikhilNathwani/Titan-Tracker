------------------------------------------
--  Insert results into titan_rounds    --
------------------------------------------
-- INSERT INTO titan_rounds (season_num, episode_num, round_num, titan_name, ingredient1, ingredient2, max_score, titan_score, challenger_score)
-- VALUES 
--     (3, 4, 1, 'Michael Voltaggio', 'Rack of Lamb', 'Mint', 10, 7, 7),
--     (3, 4, 2, 'Tiffany Derry', 'Mussel', 'Fresno Chili', 10, 9, 6),
--     (3, 4, 3, 'Brooke Williamson', 'Goat Leg', 'Tamarind', 20, 18, 16);


-- INSERT INTO titan_rounds (season_num, episode_num, round_num, titan_name, ingredient1, ingredient2, max_score, titan_score, challenger_score)
-- VALUES 
--     (4, 1, 1, 'Brooke Williamson', 'Crawfish', 'Beef Tenderloin', 10, 8, 6),
--     (4, 1, 2, 'Michael Voltaggio', 'Black Kale', 'Wild Mushroom', 10, 9, 8),
--     (4, 1, 3, 'Ayesha Nurdjaja', 'Pork Shoulder', 'Rice Flour', 20, 15, 16);


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