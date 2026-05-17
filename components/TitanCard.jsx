import { formatRecord } from "@/lib/ranking";

const HISTOGRAM_MIN_WIDTH = 2;
const HISTOGRAM_MAX_WIDTH = 13.5;
const ROUNDS = [1, 2, 3];

function formatAvgScore(val) {
	return val == null ? "n/a" : parseFloat(val).toPrecision(3);
}

function formatAvgMargin(val) {
	if (val == null) return "n/a";
	const formatted = Number(parseFloat(val).toPrecision(3)).toFixed(2);
	return `${parseFloat(formatted) >= 0 ? "+" : ""}${formatted}`;
}

export default function TitanCard({
	titan,
	avgScore,
	bestScore,
	perRoundStats,
	maxBattleCount,
}) {
	const titanId = titan.titan_name.replace(/ /g, "-");
	const imgFilename =
		titan.titan_name.toLowerCase().replace(/ /g, "-") + "-cropped.jpg";
	const rankKey = titan.rank === null ? "NR" : titan.rank;
	const rankClass = `rank rank${rankKey}`;
	const borderClass = `rank${rankKey}-border`;
	const [firstName, lastName] = titan.titan_name.split(" ");

	return (
		<div className="section titanCard" id={titanId}>
			<div className="section-content">
				{/* Header: avatar + rank badge + name */}
				<div className="titanCard-header">
					<div className="titan-avatar-wrap">
						<img
							className={`titan-avatar ${borderClass}`}
							src={`/img/${imgFilename}`}
							alt={titan.titan_name}
						/>
						<div className={rankClass}>{titan.rankString}</div>
					</div>
					<div className="titanCard-name">
						<span className="titanCard-firstname">{firstName}</span>
						<span className="titanCard-lastname">{lastName}</span>
					</div>
				</div>

				{/* Record + Avg Score */}
				<div className="section-row">
					<div className="widget titanCard-record">
						<div className="widget-title">Record</div>
						<div className="widget-content">
							<div className="widget-value">
								{formatRecord(
									titan.num_win,
									titan.num_loss,
									titan.num_tie,
								)}
							</div>
							<em className="widget-caption">Win-Loss-Tie</em>
						</div>
					</div>
					<div className="widget titanCard-avgScore">
						<div className="widget-title">Avg Score</div>
						<div className="widget-content">
							<div className="widget-value">
								{avgScore != null
									? parseFloat(avgScore).toPrecision(3)
									: "n/a"}
							</div>
							<em className="widget-caption">
								10-pt scale
								<span className="footnote">
									<sup>†</sup>
								</span>
							</em>
						</div>
					</div>
				</div>

				{/* Best Score */}
				{bestScore && (
					<div className="widget widget-full titanCard-bestScore">
						<div className="widget-title">Best Score</div>
						<div className="widget-row">
							<div className="widget-content">
								<div className="widget-value">
									{bestScore.titan_score}
								</div>
								<em className="widget-caption">
									out of{" "}
									<span className="denominator">
										{bestScore.max_score}
									</span>
								</em>
							</div>
							<div className="widget-content">
								<div className="widget-value titanCard-ingredientList">
									<b>Ingredients:</b>
									<ul>
										<li>- {bestScore.ingredient1}</li>
										<li>- {bestScore.ingredient2}</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Per-Round Stats */}
				<div className="widget widget-full titanCard-perRound">
					<div className="widget-title">Per-Round Stats</div>
					<div className="widget-content">
						<table className="titanCard-histogram">
							<tbody>
								<tr>
									<th></th>
									<th># Battles</th>
									<th>Avg Score</th>
									<th>Avg Margin</th>
								</tr>
								{ROUNDS.map((roundNum) => {
									const round = perRoundStats?.[roundNum] ?? {
										battle_count: 0,
										avg_score: null,
										avg_margin: null,
									};
									const barWidth = `${
										HISTOGRAM_MIN_WIDTH +
										HISTOGRAM_MAX_WIDTH *
											(round.battle_count /
												maxBattleCount)
									}ch`;

									return (
										<tr key={roundNum}>
											<td className="histogramRoundNum">
												Rd {roundNum}:
											</td>
											<td>
												<div
													className="histogramCount"
													style={{ width: barWidth }}
												>
													{round.battle_count}
												</div>
											</td>
											<td className="histogramAvgScore">
												{formatAvgScore(
													round.avg_score,
												)}
											</td>
											<td className="histogramAvgMargin">
												{formatAvgMargin(
													round.avg_margin,
												)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
}
