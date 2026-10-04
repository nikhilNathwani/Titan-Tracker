import Image from "next/image";
import styles from "./TitanLeaderboard.module.css";
import type { TitanWithRankLabel } from "@/lib/types";
import { formatWinPct, titanImageSrc } from "@/lib/format";
import { rankClasses } from "@/lib/ranking";

export default function TitanLeaderboard({
	titans,
}: {
	titans: TitanWithRankLabel[];
}) {
	return (
		<div className={`section-content ${styles.content}`}>
			<div className={styles.leaderboard}>
				{titans.map((titan) => {
					const [firstName, lastName] = titan.titan_name.split(" ");
					const { badge, border } = rankClasses(titan.rank);
					const winPct = formatWinPct(titan);

					return (
						<div key={titan.titan_name} className={styles.row}>
							<div className={styles.rankCol}>
								<div className={badge}>{titan.rankLabel}</div>
							</div>
							<Image
								src={titanImageSrc(titan.titan_name)}
								alt={titan.titan_name}
								className={`${styles.miniAvatar} ${border}`}
								width={40}
								height={40}
							/>
							<div className={styles.name}>
								<span className={styles.firstName}>
									{firstName}
								</span>
								<span className={styles.lastName}>
									{lastName}
								</span>
							</div>
							<div className={styles.record}>
								<span className={styles.recordLabel}>
									Win Rate
								</span>
								<span>{winPct}</span>
							</div>
						</div>
					);
				})}
			</div>
			<p className={styles.caption}>NR = Not Ranked (inactive titan)</p>
		</div>
	);
}
