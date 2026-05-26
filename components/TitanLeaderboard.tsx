import Image from "next/image";
import styles from "./TitanLeaderboard.module.css";
import type { TitanWithRank } from "@/lib/types";

export default function TitanLeaderboard({ titans }: { titans: TitanWithRank[] }) {
	return (
		<div className={`section-content ${styles.content}`}>
				<div className={styles.leaderboard}>
					{titans.map((titan) => {
						const imgFilename =
							titan.titan_name.toLowerCase().replace(/ /g, "-") +
							"-cropped.jpg";
						const [firstName, lastName] =
							titan.titan_name.split(" ");
						const rankKey = titan.rank === null ? "NR" : titan.rank;
						const rankClass = `rank rank${rankKey}`;
						const borderClass = `rank${rankKey}`;
						const battles = titan.num_win + titan.num_loss;
						const winPct =
							battles > 0
								? `${((titan.num_win / battles) * 100).toFixed(1)}%`
								: "\u2014";

						return (
							<div key={titan.titan_name} className={styles.row}>
								<div className={styles.rankCol}>
									<div className={rankClass}>
										{titan.rankString}
									</div>
								</div>
								<Image
									src={`/img/${imgFilename}`}
									alt={titan.titan_name}
									className={`${styles.miniAvatar} ${borderClass}`}
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
				<p className={styles.caption}>
					NR = Not Ranked (inactive titan)
				</p>
		</div>
	);
}
