import { ROUND_NUMS, type RoundNum, type RoundStats } from "@/lib/types";
import { formatAvgScore, formatAvgMargin } from "@/lib/format";
import styles from "./TitanCard.module.css";

interface TitanPerRoundStatsProps {
	perRoundStats: Record<RoundNum, RoundStats> | undefined;
	maxBattleCount: number;
}

export default function TitanPerRoundStats({
	perRoundStats,
	maxBattleCount,
}: TitanPerRoundStatsProps) {
	return (
		<div
			className={`${styles.widget} ${styles.widgetFull} ${styles.perRound}`}
		>
			<div className={styles.perRoundRows}>
				<div className={styles.perRoundHeaderRow}>
					<span />
					<span className={styles.perRoundColHeader}># Battles</span>
					<span className={styles.perRoundColHeader}>Avg Score</span>
					<span className={styles.perRoundColHeader}>Avg Margin</span>
				</div>
				{ROUND_NUMS.map((roundNum) => {
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
						round.avg_margin != null ? round.avg_margin : null;
					const marginCls =
						marginVal != null && marginVal < 0
							? `${styles.perRoundMargin} ${styles.perRoundMarginNeg}`
							: styles.perRoundMargin;
					return (
						<div key={roundNum} className={styles.perRoundDataRow}>
							<span className={styles.perRoundRoundLabel}>
								Rd {roundNum}
							</span>
							<div className={styles.perRoundBarCell}>
								<div className={styles.perRoundBarTrack}>
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
	);
}
