"use client";

import { useState } from "react";

export default function SiteHeader({ activeTitans, inactiveTitans }) {
	const [navOpen, setNavOpen] = useState(false);

	const closeNav = () => setNavOpen(false);

	return (
		<>
			<header id="siteHeader">
				<button
					id="hamburgerBtn"
					aria-label="Open navigation"
					aria-expanded={String(navOpen)}
					aria-controls="siteNav"
					onClick={() => setNavOpen((prev) => !prev)}
				>
					<span></span>
					<span></span>
					<span></span>
				</button>
				<span id="siteHeaderTitle">Titan Tracker</span>
				<a
					href="https://buymeacoffee.com/nikhilnathwani"
					target="_blank"
					rel="noopener noreferrer"
					id="bmcBtn"
				>
					☕ Buy me a coffee?
				</a>
			</header>
			<nav
				id="siteNav"
				aria-label="Page sections"
				className={navOpen ? "open" : undefined}
			>
				<a href="#winLoss" onClick={closeNav}>
					Team Record
				</a>
				<a href="#titanLeaderboard" onClick={closeNav}>
					Titan Leaderboard
				</a>
				{activeTitans.length > 0 && (
					<>
						<span className="nav-group-label">
							Individual Titan Stats
						</span>
						{activeTitans.map((titan) => (
							<a
								key={titan.titan_name}
								href={`#${titan.titan_name.replace(/ /g, "-")}`}
								className="nav-indented"
								onClick={closeNav}
							>
								{titan.titan_name}
							</a>
						))}
					</>
				)}
				{inactiveTitans.length > 0 && (
					<>
						<span className="nav-group-label">Inactive Titans</span>
						{inactiveTitans.map((titan) => (
							<a
								key={titan.titan_name}
								href={`#${titan.titan_name.replace(/ /g, "-")}`}
								className="nav-indented"
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
				<hr className="nav-divider" />
				<a
					href="mailto:nnathwani36@gmail.com"
					className="nav-contact"
					onClick={closeNav}
				>
					✉️ Contact me
				</a>
			</nav>
			{navOpen && (
				<div id="navOverlay" onClick={closeNav} aria-hidden="true" />
			)}
		</>
	);
}
