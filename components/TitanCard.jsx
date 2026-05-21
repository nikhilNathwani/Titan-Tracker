import Image from "next/image";
import ShareButton from "./ShareButton";
import styles from "./TitanCard.module.css";

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
	const battles = titan.num_win + titan.num_loss;
	const winPct =
		battles > 0 ? ((titan.num_win / battles) * 100).toFixed(1) + "%" : "—";

	return (
		<div className="section titanCard" id={titanId}>
			<div className={`section-content ${styles.content}`}>
				<ShareButton
					sectionId={titanId}
					sectionName={titan.titan_name}
				/>
				{/* Header: avatar + rank badge + name + win rate */}
				<div className={styles.header}>
					<div className={styles.avatarWrap}>
						<Image
							className={`${styles.avatar} ${borderClass}`}
							src={`/img/${imgFilename}`}
							alt={titan.titan_name}
							width={88}
							height={88}
						/>
						<div className={rankClass}>{titan.rankString}</div>
					</div>
					<div className={styles.name}>
						<span className={styles.firstName}>{firstName}</span>
						<span className={styles.lastName}>{lastName}</span>
					</div>
				</div>

				{/* Record + Win Rate */}
				<div className="section-row">
					<div className={`widget ${styles.record}`}>
						<div className="widget-title">Wins - Losses - Ties</div>
						<div className="widget-content">
							<div className="widget-value">
								{titan.num_win}
								<span className={styles.recordSep}> - </span>
								{titan.num_loss}
								<span className={styles.recordSep}> - </span>
								{titan.num_tie}
							</div>
						</div>
					</div>
					<div className="widget">
						<div className="widget-title">
							Win Rate
							<span className="footnote">
								<sup>*</sup>
							</span>
						</div>
						<div className="widget-content">
							<div className="widget-value">{winPct}</div>
						</div>
					</div>
				</div>

				{/* Avg Score + Best Score */}
				<div className="section-row">
					<div className="widget">
						<div className="widget-title">
							Avg Score
							<span className="footnote">
								<sup>†</sup>
							</span>
						</div>
						<div className="widget-content">
							<div className="widget-value">
								{formatAvgScore(avgScore)}
								<span className="widget-value-slash">/</span>
								<span className="widget-value-denom">10</span>
							</div>
						</div>
					</div>
					{bestScore && (
						<div className="widget">
							<div className="widget-title">Best Score</div>
							<div className="widget-content">
								<div className="widget-value">
									{bestScore.titan_score}
									<span className="widget-value-slash">
										/
									</span>
									<span className="widget-value-denom">
										{bestScore.max_score}
									</span>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Per-Round Stats */}
				<div className={`widget widget-full ${styles.perRound}`}>
					<div className="widget-title">Per-Round Averages</div>
					<div className={styles.perRoundRows}>
						<div className={styles.perRoundHeaderRow}>
							<span />
							<span className={styles.perRoundColHeader}>
								# Battles
							</span>
							<span className={styles.perRoundColHeader}>
								Score
							</span>
							<span className={styles.perRoundColHeader}>
								Margin
							</span>
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
										? `${styles.perRoundMargin} ${styles.perRoundMarginPos}`
										: `${styles.perRoundMargin} ${styles.perRoundMarginNeg}`
									: styles.perRoundMargin;
							return (
								<div
									key={roundNum}
									className={styles.perRoundDataRow}
								>
									<span className={styles.perRoundRoundLabel}>
										Rd {roundNum}
									</span>
									<div className={styles.perRoundBarCell}>
										<div
											className={styles.perRoundBarTrack}
										>
											<div
												className={styles.perRoundBar}
												style={{ width: `${barPct}%` }}
											/>
										</div>
										<span className={styles.perRoundCount}>
											{round.battle_count}
										</span>
									</div>
									<span className={styles.perRoundAvg}>
										{formatAvgScore(round.avg_score)}
									</span>
									<span className={marginCls}>
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
