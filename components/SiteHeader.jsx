"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faBars } from "@fortawesome/free-solid-svg-icons";
import styles from "./SiteHeader.module.css";

export default function SiteHeader({ activeTitans, inactiveTitans }) {
	const [navOpen, setNavOpen] = useState(false);

	const closeNav = () => setNavOpen(false);

	return (
		<>
			<header id="siteHeader" className={styles.header}>
				<button
					id="hamburgerBtn"
					className={styles.hamburgerBtn}
					aria-label="Open navigation"
					aria-expanded={String(navOpen)}
					aria-controls="siteNav"
					onClick={() => setNavOpen((prev) => !prev)}
				>
					<FontAwesomeIcon icon={faBars} aria-hidden={true} />
				</button>
				<span id="siteHeaderTitle" className={styles.title}>
					Titan Tracker
				</span>
				<a
					href="https://buymeacoffee.com/nikhilnathwani"
					target="_blank"
					rel="noopener noreferrer"
					id="bmcBtn"
					className={styles.bmcBtn}
				>
					☕ Buy me a coffee?
				</a>
			</header>
			<nav
				id="siteNav"
				aria-label="Page sections"
				className={`${styles.nav}${navOpen ? ` ${styles.navOpen}` : ""}`}
			>
				<a href="#winLoss" onClick={closeNav}>
					Team Record
				</a>
				<a href="#titanLeaderboard" onClick={closeNav}>
					Titan Leaderboard
				</a>
				{activeTitans.length > 0 && (
					<>
						<span className={styles.navGroupLabel}>
							Individual Titan Stats
						</span>
						{activeTitans.map((titan) => (
							<a
								key={titan.titan_name}
								href={`#${titan.titan_name.replace(/ /g, "-")}`}
								className={styles.navIndented}
								onClick={closeNav}
							>
								{titan.titan_name}
							</a>
						))}
					</>
				)}
				{inactiveTitans.length > 0 && (
					<>
						<span className={styles.navGroupLabel}>
							Inactive Titans
						</span>
						{inactiveTitans.map((titan) => (
							<a
								key={titan.titan_name}
								href={`#${titan.titan_name.replace(/ /g, "-")}`}
								className={styles.navIndented}
								onClick={closeNav}
							>
								{titan.titan_name}
							</a>
						))}
					</>
				)}
				<a href="#notesSection" onClick={closeNav}>
					Notes
				</a>
				<hr className={styles.navDivider} />
				<a href="mailto:nnathwani36@gmail.com" onClick={closeNav}>
					<FontAwesomeIcon icon={faEnvelope} aria-hidden={true} />{" "}
					Contact me
				</a>
			</nav>
			{navOpen && (
				<div
					id="navOverlay"
					className={styles.overlay}
					onClick={closeNav}
					aria-hidden="true"
				/>
			)}
		</>
	);
}
