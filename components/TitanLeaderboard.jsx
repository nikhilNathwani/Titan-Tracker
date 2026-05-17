export default function TitanLeaderboard({ titans }) {
	return (
		<div className="section" id="titanLeaderboard">
			<p className="section-label">Titan Leaderboard</p>
			<div className="section-content">
				<div className="leaderboard">
					{titans.map((titan) => {
						const imgFilename =
							titan.titan_name.toLowerCase().replace(/ /g, "-") +
							"-cropped.jpg";
						const [firstName, lastName] =
							titan.titan_name.split(" ");
						const rankKey = titan.rank === null ? "NR" : titan.rank;
						const rankClass = `rank rank${rankKey}`;
						const borderClass = `rank${rankKey}-border`;
const battles =
						titan.num_win + titan.num_loss;
					const winPct =
						battles > 0
							? `${((titan.num_win / battles) * 100).toFixed(1)}%`
								: "\u2014";

						return (
							<div
								key={titan.titan_name}
								className="leaderboard-row"
							>
								<div className="leaderboard-rank-col">
									<div className={rankClass}>
										{titan.rankString}
									</div>
								</div>
								<img
									src={`/img/${imgFilename}`}
									alt={titan.titan_name}
									className={`titan-mini-avatar ${borderClass}`}
								/>
								<div className="leaderboard-name">
									<span className="leaderboard-firstname">
										{firstName}
									</span>
									<span className="leaderboard-lastname">
										{lastName}
									</span>
								</div>
								<div className="leaderboard-record">
									<span className="leaderboard-record-label">
										Win Rate
									</span>
									<span>{winPct}</span>
								</div>
							</div>
						);
					})}
				</div>
				<p id="titanRankingCaption">NR = Not Ranked (inactive titan)</p>
			</div>
		</div>
	);
}
