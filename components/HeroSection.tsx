import Image from "next/image";
import heroImg from "@/public/og-image.png";
import styles from "./HeroSection.module.css";

export default function HeroSection() {
	return (
		<div id="heroSection" className={styles.heroSection}>
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
