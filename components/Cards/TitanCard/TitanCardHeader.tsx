import Image from "next/image";
import type { TitanWithRankLabel } from "@/lib/types";
import { rankClasses } from "@/lib/ranking";
import { titanImageSrc } from "@/lib/format";
import styles from "./TitanCard.module.css";

interface TitanCardHeaderProps {
	titan: TitanWithRankLabel;
}

export default function TitanCardHeader({ titan }: TitanCardHeaderProps) {
	const { badge, border } = rankClasses(titan.rank);
	const [firstName, lastName] = titan.titan_name.split(" ");

	return (
		<div className={styles.header}>
			<div className={styles.avatarWrap}>
				<Image
					className={`${styles.avatar} ${border}`}
					src={titanImageSrc(titan.titan_name)}
					alt={titan.titan_name}
					width={88}
					height={88}
				/>
				<div className={badge}>{titan.rankLabel}</div>
			</div>
			<div className={styles.name}>
				<span className={styles.firstName}>{firstName}</span>
				<span className={styles.lastName}>{lastName}</span>
			</div>
		</div>
	);
}
