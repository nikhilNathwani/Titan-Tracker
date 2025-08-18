
INSERT INTO titan_rounds (season_num, episode_num, round_num, titan_name, ingredient1, ingredient2, max_score, titan_score, challenger_score)
VALUES 
    (3, 4, 1, 'Michael Voltaggio', 'Rack of Lamb', 'Mint', 10, 7, 7),
    (3, 4, 2, 'Tiffany Derry', 'Mussel', 'Fresno Chili', 10, 9, 6),
    (3, 4, 3, 'Brooke Williamson', 'Goat Leg', 'Tamarind', 20, 18, 16);



INSERT INTO titan_rounds (season_num, episode_num, round_num, titan_name, ingredient1, ingredient2, max_score, titan_score, challenger_score)
VALUES 
    (1, 1, 1, 'Ayesha Nurdjaja', 'Country Ham', 'Cheddar Cheese', 10, 7, 8);


DELETE FROM titan_rounds
WHERE titan_name = 'Ayesha Nurdjaja';