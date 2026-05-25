import type { TitanWithRank, BestScore } from "@/lib/types";
import styles from "./TitanCard.module.css";

function formatAvgScore(val: number | null | undefined): string {
	return val == null ? "n/a" : parseFloat(String(val)).toPrecision(3);
}

function formatAvgMargin(val: number | null): string {
	if (val == null) return "n/a";
	const formatted = Number(val.toPrecision(3)).toFixed(2);
	return `${parseFloat(formatted) >= 0 ? "+" : ""}${formatted}`;
}

interface TitanStatsWidgetsProps {
	titan: TitanWithRank;
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
			<div className="section-row">
				<div className={`widget ${styles.record}`}>
					<div className="widget-title">Win - Loss - Tie</div>
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
						Win Rate<span className="footnote">*</span>
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
								<span className="widget-value-slash">/</span>
								<span className="widget-value-denom">
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
