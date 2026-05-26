import type { TitanWithRank, BestScore, RoundStats } from "@/lib/types";
import TitanCardHeader from "./TitanCardHeader";
import TitanStatsWidgets from "./TitanStatsWidgets";
import TitanPerRoundStats from "./TitanPerRoundStats";
import styles from "./TitanCard.module.css";

interface TitanCardProps {
	titan: TitanWithRank;
	avgScore: number | undefined;
	bestScore: BestScore | undefined;
	perRoundStats: Record<number, RoundStats> | undefined;
	maxBattleCount: number;
}

export default function TitanCard({
	titan,
	avgScore,
	bestScore,
	perRoundStats,
	maxBattleCount,
}: TitanCardProps) {
	const titanId = titan.titan_name.replace(/ /g, "-");
	const battles = titan.num_win + titan.num_loss;
	const winPct =
		battles > 0 ? ((titan.num_win / battles) * 100).toFixed(1) + "%" : "—";

	return (
		<div className="section titanCard" id={titanId}>
			<div className={`section-content ${styles.content}`}>
				<TitanCardHeader titan={titan} />

				<hr className={styles.divider} />

				<TitanStatsWidgets
					titan={titan}
					winPct={winPct}
					avgScore={avgScore}
					bestScore={bestScore}
				/>

				<TitanPerRoundStats
					perRoundStats={perRoundStats}
					maxBattleCount={maxBattleCount}
				/>
			</div>
		</div>
	);
}
