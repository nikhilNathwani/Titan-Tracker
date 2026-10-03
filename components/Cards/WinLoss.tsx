import Image from "next/image";
import allTitansImg from "@/public/img/all-titans.jpg";
import styles from "./WinLoss.module.css";
import type { WinLossTie } from "@/lib/types";
import { formatWinPct } from "@/lib/format";

export default function WinLoss({ num_win, num_tie, num_loss }: WinLossTie) {
	const winPct = formatWinPct({ num_win, num_tie, num_loss });

	return (
		<div className={`section-content ${styles.content}`}>
			<div className={styles.banner}>
				<Image
					className={styles.bannerImg}
					src={allTitansImg}
					alt="The Titans"
					fill
					priority
					placeholder="blur"
					sizes="(max-width: 480px) 100vw, 480px"
				/>
			</div>
			<div className={styles.caption}>
				<p className={styles.rate}>
					<span className={styles.rateLabel}>Win Rate</span>
					<span className={styles.rateStat}>{winPct}</span>
				</p>
				<p className={styles.sentence}>
					The titans won {num_win} out of {num_win + num_loss} battles
					{num_tie > 0 && (
						<>
							, with {num_tie} tie{num_tie > 1 ? "s" : ""}
						</>
					)}
					.
				</p>
			</div>
		</div>
	);
}
