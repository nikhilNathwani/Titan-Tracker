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
	const total = titan.num_win + titan.num_loss + titan.num_tie;
	const winPct = total > 0 ? ((titan.num_win / total) * 100).toFixed(1) + "%" : "—";

	return (
		<div className="section titanCard" id={titanId}>
			<div className="section-content">
				{/* Header: avatar + rank badge + name + win rate */}
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
					<div className="titanCard-header-winrate">
						<span className="titanCard-header-winrate-value">{winPct}</span>
						<span className="titanCard-header-winrate-label">win rate</span>
					</div>
				</div>

				{/* W-L-T Record */}
				<div className="titanCard-record-row">
					<div className="titanCard-record-stat">
						<span className="titanCard-record-stat-value">{titan.num_win}</span>
						<span className="titanCard-record-stat-label">W</span>
					</div>
					<div className="titanCard-record-stat">
						<span className="titanCard-record-stat-value">{titan.num_loss}</span>
						<span className="titanCard-record-stat-label">L</span>
					</div>
					<div className="titanCard-record-stat">
						<span className="titanCard-record-stat-value">{titan.num_tie}</span>
						<span className="titanCard-record-stat-label">T</span>
					</div>
				</div>

				{/* Avg Score + Best Score */}
				<div className="section-row">
					<div className="widget titanCard-avgScore">
						<div className="widget-title">Avg Score</div>
						<div className="widget-content">
							<div className="widget-value">{formatAvgScore(avgScore)}</div>
							<em className="widget-caption">
								10-pt scale
								<span className="footnote">
									<sup>†</sup>
								</span>
							</em>
						</div>
					</div>
					{bestScore && (
						<div className="widget titanCard-bestScore">
							<div className="widget-title">Best Score</div>
							<div className="widget-content">
								<div className="widget-value">{bestScore.titan_score}</div>
								<em className="widget-caption">out of {bestScore.max_score}</em>
							</div>
						</div>
					)}
				</div>

				{/* Per-Round Stats */}
				<div className="widget widget-full titanCard-perRound">
					<div className="widget-title">Per-Round Stats</div>
					<div className="titanCard-perRound-cols">
						{ROUNDS.map((roundNum) => {
							const round = perRoundStats?.[roundNum] ?? {
								battle_count: 0,
								avg_score: null,
								avg_margin: null,
							};
							const barPct =
								maxBattleCount > 0
									? (round.battle_count / maxBattleCount) * 100
									: 0;
							const marginVal =
								round.avg_margin != null
									? parseFloat(round.avg_margin)
									: null;
							const marginCls =
								marginVal != null
									? marginVal >= 0
										? "perRound-margin--pos"
										: "perRound-margin--neg"
									: "";
							return (
								<div
									key={roundNum}
									className="titanCard-perRound-col"
								>
									<span className="perRound-label">Rd {roundNum}</span>
									<div className="perRound-bar-track">
										<div
											className="perRound-bar"
											style={{ width: `${barPct}%` }}
										/>
									</div>
									<span className="perRound-count">{round.battle_count}</span>
									<span className="perRound-avg-score">
										{formatAvgScore(round.avg_score)}
									</span>
									<span className="perRound-avg-label">avg score</span>
									<span className={`perRound-margin ${marginCls}`}>
										{formatAvgMargin(round.avg_margin)}
									</span>
									<span className="perRound-margin-label">avg margin</span>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
