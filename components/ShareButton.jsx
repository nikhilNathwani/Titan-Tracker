"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpFromBracket } from "@fortawesome/free-solid-svg-icons";

const SHOW_CONTEXT = "Bobby's Triple Threat on Food Network";

export default function ShareButton({ sectionId, sectionName, shareText }) {
	const [copied, setCopied] = useState(false);

	async function handleShare() {
		const url = `${window.location.origin}/#${sectionId}`;
		const baseText =
			shareText ?? `Check out ${sectionName} on Titan Tracker`;
		const fullText = `${baseText} (${SHOW_CONTEXT})`;

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
					text: fullText,
					url,
				});
			} catch (e) {
				// user dismissed — no-op
			}
		} else {
			try {
				await navigator.clipboard.writeText(`${fullText}\n${url}`);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
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
			disabled={copied}
		>
			{copied ? (
				"✓ Copied!"
			) : (
				<>
					<FontAwesomeIcon
						icon={faArrowUpFromBracket}
						aria-hidden={true}
					/>{" "}
					Share
				</>
			)}
		</button>
	);
}
