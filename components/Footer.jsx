import styles from "./Footer.module.css";

export default function Footer() {
	return (
		<div className={styles.footer} id="footer">
			<div className={styles.content}>
				<p>Made by fan of the show, Nikhil N.</p>
				<div className={styles.links}>
					<a
						href="https://nikhilnathwani.com"
						target="_blank"
						rel="noopener noreferrer"
						className={styles.link}
					>
						nikhilnathwani.com
					</a>
				</div>
			</div>
		</div>
	);
}
