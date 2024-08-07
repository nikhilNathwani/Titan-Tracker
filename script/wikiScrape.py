import requests
from bs4 import BeautifulSoup

# Episode Schema:
# td[0]: Contestant	- e.g. "Kevin Lee"
# td[1]: Judge - e.g. "Lucinda Scala Quinn"
# td[2]: R1 Ingredients	- e.g. "scallops&ginger" (after text strip)
# td[3]: R1 Titan - e.g. "Tiffany Derry"	
# td[4]: R1 Result - e.g. "W; 8-5" (after text strip)	
# td[5]: R2 Ingredients	
# td[6]: R2 Titan	
# td[7]: R2 Result	
# td[8]: R3 Ingredients	
# td[9]: R3 Titan	
# td[10]: R3 Result	
# td[11]: Final Result - e.g. "L; 28-29" (after text strip)


#Returns season_num, episode_num, episode_data
def getLatestTripleThreatData(url):
    response = requests.get(url)
    soup= BeautifulSoup(response.content, "html.parser")

    # Find all tables tracking episode outcomes
    # (one table per season, in chronological order)
    seasons = soup.find_all("table", class_="wikitable")

    if not seasons:
        print("No seasons with class 'wikitable' found.")
        return None, None, None
    else:
        season_num = len(seasons)
        curr_season_data = seasons[-1]

        # Find all tr elements in the last wikitable
        # (ignore first tr since it's the table header)
        episides = curr_season_data.find_all("tr")[1:]

        if not episides:
            print("No episode tr elements found in the last wikitable.")
            return season_num, None, None
        else:
            episode_num = len(episides)
            curr_episode = episides[-1]

            # Get all td elements in the final tr row
            return season_num, episode_num, curr_episode.find_all("td")

def constructEpisodeCommand(season_num, episode_num, episode_data):
    if len(episode_data) < 11:
        print("Not enough episode data to construct the round command.")
        return None
    else: 
        challenger_name= episode_data[0].get_text(strip=True)
        judge_name= episode_data[1].get_text(strip=True)
        return f"""
                INSERT INTO titan_episodes (season_num, episode_num, challenger_name, judge_name)
                VALUES 
                ({season_num}, {episode_num}, '{challenger_name}', '{judge_name}');
                """

def constructRoundsCommand(season_num, episode_num, episode_data):
    if len(episode_data) < 11:
        print("Not enough episode data to construct the round command.")
        return None
    else: 
        #Round 1 data
        r1_ingredient1, r1_ingredient2 = episode_data[2].get_text(strip=True).split('&')
        r1_titan_name= episode_data[3].get_text(strip=True)
        r1_challenger_score, r1_titan_score= (
            episode_data[4].get_text(strip=True)
            .split('; ')[1]
            .split("-")
        )
        r1_challenger_score= int(r1_challenger_score)
        r1_titan_score= int(r1_titan_score)

        #Round 2 data
        r2_ingredient1, r2_ingredient2 = episode_data[5].get_text(strip=True).split('&')
        r2_titan_name= episode_data[6].get_text(strip=True)
        r2_challenger_score, r2_titan_score= (
            episode_data[7].get_text(strip=True)
            .split('; ')[1]
            .split("-")
        )
        r2_challenger_score= int(r2_challenger_score)
        r2_titan_score= int(r2_titan_score)

        #Round 3 data
        r3_ingredient1, r3_ingredient2 = episode_data[8].get_text(strip=True).split('&')
        r3_titan_name= episode_data[9].get_text(strip=True)
        r3_challenger_score, r3_titan_score= (
            episode_data[10].get_text(strip=True)
            .split('; ')[1]
            .split("-")
        )
        r3_challenger_score= int(r3_challenger_score)
        r3_titan_score= int(r3_titan_score)

        return f"""
            INSERT INTO titan_rounds (season_num, episode_num, round_num, titan_name, ingredient1, ingredient2, max_score, titan_score, challenger_score)
            VALUES 
                ({season_num}, {episode_num}, 1, '{r1_titan_name}', '{r1_ingredient1}', '{r1_ingredient2}', 10, {r1_titan_score}, {r1_challenger_score}),
                ({season_num}, {episode_num}, 2, '{r2_titan_name}', '{r2_ingredient1}', '{r2_ingredient2}', 10, {r2_titan_score}, {r2_challenger_score}),
                ({season_num}, {episode_num}, 3, '{r3_titan_name}', '{r3_ingredient1}', '{r3_ingredient2}', 20, {r3_titan_score}, {r3_challenger_score});
            """

def write_to_file(filename, content):
    with open(filename, 'w') as file:
        file.write(content)


#Main
url= "https://en.wikipedia.org/wiki/Bobby%27s_Triple_Threat";
season_num, episode_num, episode_data= getLatestTripleThreatData(url)

episode_command= constructEpisodeCommand(season_num, episode_num, episode_data)
if episode_command:
    write_to_file('insertEpisode.sql', episode_command)

rounds_command= constructRoundsCommand(season_num, episode_num, episode_data)
if rounds_command:
    write_to_file('insertRounds.sql', rounds_command)