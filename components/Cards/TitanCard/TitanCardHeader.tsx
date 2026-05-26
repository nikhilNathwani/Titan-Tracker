import Image from "next/image";
import type { TitanWithRank } from "@/lib/types";
import styles from "./TitanCard.module.css";

interface TitanCardHeaderProps {
	titan: TitanWithRank;
}

export default function TitanCardHeader({ titan }: TitanCardHeaderProps) {
	const imgFilename =
		titan.titan_name.toLowerCase().replace(/ /g, "-") + "-cropped.jpg";
	const rankKey = titan.rank === null ? "NR" : titan.rank;
	const rankClass = `rank rank${rankKey}`;
	const borderClass = `rank${rankKey}`;
	const [firstName, lastName] = titan.titan_name.split(" ");

	return (
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
	);
}
