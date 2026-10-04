import type { TitanWithRankLabel, BestScore } from "@/lib/types";
import { formatAvgScore } from "@/lib/format";
import styles from "./TitanCard.module.css";

interface TitanStatsWidgetsProps {
	titan: TitanWithRankLabel;
	winPct: string;
	avgScore: number | undefined;
	bestScore: BestScore | undefined;
}

export default function TitanStatsWidgets({
	titan,
	winPct,
	avgScore,
	bestScore,
}: TitanStatsWidgetsProps) {
	return (
		<div className={styles.statsWidgets}>
			{/* Record + Win Rate */}
			<div className={styles.row}>
				<div className={`${styles.widget} ${styles.record}`}>
					<div className={styles.widgetTitle}>Win - Loss - Tie</div>
					<div className={styles.widgetContent}>
						<div className={styles.widgetValue}>
							{titan.num_win}
							<span className={styles.recordSep}> - </span>
							{titan.num_loss}
							<span className={styles.recordSep}> - </span>
							{titan.num_tie}
						</div>
					</div>
				</div>
				<div className={styles.widget}>
					<div className={styles.widgetTitle}>
						Win Rate<span className="footnote">*</span>
					</div>
					<div className={styles.widgetContent}>
						<div className={styles.widgetValue}>{winPct}</div>
					</div>
				</div>
			</div>

			{/* Avg Score + Best Score */}
			<div className={styles.row}>
				<div className={styles.widget}>
					<div className={styles.widgetTitle}>
						Avg Score
						<span className="footnote">
							<sup>†</sup>
						</span>
					</div>
					<div className={styles.widgetContent}>
						<div className={styles.widgetValue}>
							{formatAvgScore(avgScore)}
							<span className={styles.widgetValueSlash}>/</span>
							<span className={styles.widgetValueDenom}>10</span>
						</div>
					</div>
				</div>
				{bestScore && (
					<div className={styles.widget}>
						<div className={styles.widgetTitle}>Best Score</div>
						<div className={styles.widgetContent}>
							<div className={styles.widgetValue}>
								{bestScore.titan_score}
								<span className={styles.widgetValueSlash}>
									/
								</span>
								<span className={styles.widgetValueDenom}>
									{bestScore.max_score}
								</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
