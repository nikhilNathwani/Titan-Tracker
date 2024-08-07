#!/bin/bash

# Step 1: Scrape Triple Threat Wiki to get latest data
#         and convert into SQL commands stored in txt files
python3 wikiScrape.py

# Step 2: Extract POSTGRES_URL from .env.development.local
POSTGRES_URL=$(grep 'POSTGRES_URL=' ../.env.development.local | sed -e 's/^POSTGRES_URL=//' -e 's/^"//' -e 's/"$//')


# Step 3: Open a new VS Code window and open the 2 sql files
/usr/local/bin/code insertEpisode.sql insertRounds.sql

# Step 4: Wait for user to review the files
echo "Please review the SQL commands in insertEpisode.txt and insertRounds.txt."
echo "Press Enter to continue..."
read

# Step 5: Open Terminal windows & submit INSERT EPISODE sql command
osascript -  "$POSTGRES_URL"  <<EOF
    on run argv -- argv is a list of strings
        tell application "Terminal"
            do script "cd '/Users/nikhilnathwani/Documents/Project Garden/Titan Tracker/script'"
            delay 1
            do script ("psql " & quoted form of item 1 of argv & " -f insertEpisode.sql -c 'SELECT * FROM titan_episodes'") in front window
        end tell
    end run
EOF
sleep 2

# Step 6: Open Terminal windows & submit INSERT ROUNDS sql command
osascript -  "$POSTGRES_URL"  <<EOF
    on run argv -- argv is a list of strings
        tell application "Terminal"
            do script "cd '/Users/nikhilnathwani/Documents/Project Garden/Titan Tracker/script'"
            delay 1
            do script ("psql " & quoted form of item 1 of argv & " -f insertRounds.sql -c 'SELECT * FROM titan_rounds'") in front window
        end tell
    end run
EOF

# Step 7: Open Titan Tracker in Chrome to review latest update
open -na "Google Chrome" --args --new-window \
 "https://triple-threat.vercel.app/"
#