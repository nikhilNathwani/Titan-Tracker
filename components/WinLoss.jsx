import Image from "next/image";
import allTitansImg from "@/public/img/all-titans.jpg";
import ShareButton from "./ShareButton";
import styles from "./WinLoss.module.css";

export default function WinLoss({ num_win, num_tie, num_loss }) {
	const total = num_win + num_tie + num_loss;
	const percentSuccess = ((100 * num_win) / total).toPrecision(3);

	return (
		<div className="section" id="winLoss">
			<p className="section-label">Team Record</p>
			<div className={`section-content ${styles.content}`}>
				<ShareButton sectionId="winLoss" sectionName="Team Record" />
				<div className={styles.banner}>
					<Image
						className={styles.bannerImg}
						src={allTitansImg}
						alt="The Titans"
						fill
						priority
						placeholder="blur"
						sizes="100vw"
					/>
				</div>
				<div className={styles.caption}>
					<p className={styles.rate}>
						<span className={styles.rateStat}>
							{percentSuccess}%
						</span>
						<span className={styles.rateLabel}>win rate</span>
					</p>
					<p className={styles.sentence}>
						The titans have won {num_win} out of{" "}
						{num_win + num_loss} battles
						{num_tie > 0 && (
							<>
								, with {num_tie} tie{num_tie > 1 ? "s" : ""}
							</>
						)}
						.
					</p>
				</div>
			</div>
		</div>
	);
}
