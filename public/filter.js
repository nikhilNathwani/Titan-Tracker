const outcomes = ["Win every game", "Lose every game"];
const seasons = [
	"2016-17",
	"2017-18",
	"2018-19",
	"2019-20",
	"2020-21",
	"2021-22",
];
const wagers = [];
for (let i = 1; i <= 20; i++) {
	wagers.push(i * 50);
}
const teamNames = [
	"Atlanta Hawks",
	"Boston Celtics",
	"Brooklyn Nets",
	"Charlotte Hornets",
	"Chicago Bulls",
	"Cleveland Cavaliers",
	"Dallas Mavericks",
	"Denver Nuggets",
	"Detroit Pistons",
	"Golden State Warriors",
	"Houston Rockets",
	"Indiana Pacers",
	"Los Angeles Clippers",
	"Los Angeles Lakers",
	"Memphis Grizzlies",
	"Miami Heat",
	"Milwaukee Bucks",
	"Minnesota Timberwolves",
	"New Orleans Pelicans",
	"New York Knicks",
	"Oklahoma City Thunder",
	"Orlando Magic",
	"Philadelphia 76ers",
	"Phoenix Suns",
	"Portland Trail Blazers",
	"Sacramento Kings",
	"San Antonio Spurs",
	"Toronto Raptors",
	"Utah Jazz",
	"Washington Wizards",
];

const teamSelect = document.getElementById("team-input");
const wagerSelect = document.getElementById("wager-input");
const outcomeSelect = document.getElementById("outcome-input");
const seasonSelect = document.getElementById("season-input");

// Populate team dropdown
teamNames.forEach((teamName) => {
	const option = document.createElement("option");
	option.value = teamName;
	option.textContent = teamName;
	teamSelect.appendChild(option);
});

// Populate wager dropdown
wagers.forEach((amount) => {
	const option = document.createElement("option");
	option.value = amount;
	option.textContent = "$" + amount;
	wagerSelect.appendChild(option);
});

// Populate outcome dropdown
outcomes.forEach((outcome) => {
	const option = document.createElement("option");
	option.value = outcome;
	option.textContent = outcome;
	outcomeSelect.appendChild(option);
});

// Populate season dropdown (and default to latest available season)
seasons.forEach((season) => {
	const option = document.createElement("option");
	option.value = Number(season.split("-")[0]);
	option.textContent = season;
	seasonSelect.appendChild(option);
});
seasonSelect.selectedIndex = seasons.length - 1;

function getFilterValues() {
	// Get the values of the Div filters
	const wager = document.getElementById("wager-input").value;
	const team = document.getElementById("team-input").value;
	const outcome =
		document.getElementById("outcome-input").value == "Win every game"
			? true
			: false;
	const seasonStartYear = document.getElementById("season-input").value;
	return {
		seasonStartYear: seasonStartYear,
		team: team,
		prediction: outcome,
		wager: wager,
	};
}
