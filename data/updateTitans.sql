-- Table name: titans 
-- Schema:
--      titan_name      VARCHAR PRIMARY KEY
--      is_active       BOOLEAN NOT NULL DEFAULT TRUE

-- Query 1: View all titans
SELECT * FROM titans ORDER BY titan_name;


-- Query 2: Add a new titan (active by default)
-- INSERT INTO titans (titan_name, is_active)
-- VALUES ('New Titan Name', TRUE);


-- Query 3: Update existing titan to be inactive
-- UPDATE titans 
-- SET is_active = FALSE 
-- WHERE titan_name = 'Titan Name To Deactivate';


-- Query 4: Delete a titan 
-- (use with caution - will break things if titan has data in titan_rounds)
-- DELETE FROM titans 
-- WHERE titan_name = 'Titan Name To Delete';
