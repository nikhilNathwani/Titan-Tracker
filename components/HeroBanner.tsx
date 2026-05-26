import Image from "next/image";
import heroImg from "@/public/og-image.png";
import styles from "./HeroBanner.module.css";

export default function HeroBanner() {
	return (
		<div id="heroBanner" className={styles.heroBanner}>
			<Image
				src={heroImg}
				alt="Bobby's Triple Threat — Fan-made Stat Tracker"
				id="heroImage"
				className={styles.heroImage}
				priority
				placeholder="blur"
				sizes="(max-width: 680px) 96vw, 680px"
			/>
		</div>
	);
}
