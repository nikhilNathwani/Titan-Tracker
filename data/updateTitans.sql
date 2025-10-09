-- Table name: titans 
-- Schema:
--      titan_name      VARCHAR PRIMARY KEY
--      is_retired      BOOLEAN NOT NULL DEFAULT FALSE


-- Query 1: View all titans
SELECT * FROM titans ORDER BY titan_name;


-- Query 2: Add a new titan (not retired)
-- INSERT INTO titans (titan_name, is_retired)
-- VALUES ('New Titan Name', FALSE);


-- Query 3: Update existing titan to be retired
-- UPDATE titans 
-- SET is_retired = TRUE 
-- WHERE titan_name = 'Titan Name To Retire';


-- Query 4: Delete a titan 
-- (use with caution - will break things if titan has data in titan_rounds)
-- DELETE FROM titans 
-- WHERE titan_name = 'Titan Name To Delete';