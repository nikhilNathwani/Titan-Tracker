import type {
	TitanWithRankLabel,
	BestScore,
	RoundNum,
	RoundStats,
} from "@/lib/types";
import { formatWinPct, titanSlug } from "@/lib/format";
import TitanCardHeader from "./TitanCardHeader";
import TitanStatsWidgets from "./TitanStatsWidgets";
import TitanPerRoundStats from "./TitanPerRoundStats";
import styles from "./TitanCard.module.css";

interface TitanCardProps {
	titan: TitanWithRankLabel;
	avgScore: number | undefined;
	bestScore: BestScore | undefined;
	perRoundStats: Record<RoundNum, RoundStats> | undefined;
	maxBattleCount: number;
}

export default function TitanCard({
	titan,
	avgScore,
	bestScore,
	perRoundStats,
	maxBattleCount,
}: TitanCardProps) {
	const titanId = titanSlug(titan.titan_name);
	const winPct = formatWinPct(titan);

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
