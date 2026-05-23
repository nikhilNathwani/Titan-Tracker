import styles from "./Footer.module.css";

export default function Footer() {
	return (
		<div className={styles.footer} id="footer">
			<div className={styles.content}>
				<p>Made by a fan of the show.</p>
				<div className={styles.links}>
					<a
						href="https://nikhilnathwani.com"
						target="_blank"
						rel="noopener noreferrer"
						className={styles.link}
					>
						nikhilnathwani.com
					</a>
					<span className={styles.link} aria-hidden="true">|</span>
					<span className={styles.link}>© {new Date().getFullYear()}</span>
				</div>
			</div>
		</div>
	);
}
