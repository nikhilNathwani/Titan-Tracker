"use client";

import { useState } from "react";

export default function ShareButton({ sectionId, sectionName }) {
	const [label, setLabel] = useState("Share ↗");
	const [disabled, setDisabled] = useState(false);

	async function handleShare() {
		const url = `${window.location.origin}/#${sectionId}`;

		if (typeof gtag === "function") {
			gtag("event", "share_card", {
				event_category: "engagement",
				event_label: sectionName,
			});
		}

		if (navigator.share) {
			try {
				await navigator.share({
					title: "Titan Tracker",
					text: `Check out ${sectionName} on Titan Tracker`,
					url,
				});
			} catch (e) {
				// user dismissed — no-op
			}
		} else {
			try {
				await navigator.clipboard.writeText(url);
				setLabel("✓ Copied!");
				setDisabled(true);
				setTimeout(() => {
					setLabel("Share ↗");
					setDisabled(false);
				}, 2000);
			} catch (e) {
				// clipboard unavailable — silent fail
			}
		}
	}

	return (
		<button
			className="section-share-btn"
			aria-label={`Share ${sectionName}`}
			onClick={handleShare}
			disabled={disabled}
		>
			{label}
		</button>
	);
}
