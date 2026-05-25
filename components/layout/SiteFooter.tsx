import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
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
				</div>
			</div>
		</div>
	);
}
