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
	const winPct =
		total > 0 ? ((titan.num_win / total) * 100).toFixed(1) + "%" : "—";

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
				</div>

				{/* Record + Win Rate */}
				<div className="section-row">
					<div className="widget titanCard-record">
						<div className="widget-title">Record</div>
						<div className="widget-content titanCard-record-content">
							<div className="titanCard-record-stat">
								<span className="titanCard-record-stat-label">
									Wins
								</span>
								<span className="titanCard-record-stat-value">
									{titan.num_win}
								</span>
							</div>
							<div className="titanCard-record-stat">
								<span className="titanCard-record-stat-label">
									Losses
								</span>
								<span className="titanCard-record-stat-value">
									{titan.num_loss}
								</span>
							</div>
							<div className="titanCard-record-stat">
								<span className="titanCard-record-stat-label">
									Ties
								</span>
								<span className="titanCard-record-stat-value">
									{titan.num_tie}
								</span>
							</div>
						</div>
					</div>
					<div className="widget titanCard-winrate">
						<div className="widget-title">Win Rate</div>
						<div className="widget-content">
							<div className="widget-value">{winPct}</div>
						</div>
					</div>
				</div>

				{/* Avg Score + Best Score */}
				<div className="section-row">
					<div className="widget titanCard-avgScore">
						<div className="widget-title">
							Avg Score
							<span className="footnote">
								<sup>†</sup>
							</span>
						</div>
						<div className="widget-content">
							<div className="widget-value">
								{formatAvgScore(avgScore)}
								<span className="widget-value-denom">/10</span>
							</div>
						</div>
					</div>
					{bestScore && (
						<div className="widget titanCard-bestScore">
							<div className="widget-title">Best Score</div>
							<div className="widget-content">
								<div className="widget-value">
									{bestScore.titan_score}
									<span className="widget-value-denom">
										/{bestScore.max_score}
									</span>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Per-Round Stats */}
				<div className="widget widget-full titanCard-perRound">
					<div className="widget-title">Per-Round Averages</div>
					<div className="titanCard-perRound-rows">
						<div className="perRound-header-row">
							<span />
							<span className="perRound-col-header">
								# Battles
							</span>
							<span className="perRound-col-header">Score</span>
							<span className="perRound-col-header">Margin</span>
						</div>
						{ROUNDS.map((roundNum) => {
							const round = perRoundStats?.[roundNum] ?? {
								battle_count: 0,
								avg_score: null,
								avg_margin: null,
							};
							const barPct =
								maxBattleCount > 0
									? (round.battle_count / maxBattleCount) *
										100
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
									className="perRound-data-row"
								>
									<span className="perRound-round-label">
										Rd {roundNum}
									</span>
									<div className="perRound-bar-cell">
										<div className="perRound-bar-track">
											<div
												className="perRound-bar"
												style={{ width: `${barPct}%` }}
											/>
										</div>
										<span className="perRound-count">
											{round.battle_count}
										</span>
									</div>
									<span className="perRound-avg">
										{formatAvgScore(round.avg_score)}
									</span>
									<span
										className={`perRound-margin ${marginCls}`}
									>
										{formatAvgMargin(round.avg_margin)}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
