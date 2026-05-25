"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpFromBracket } from "@fortawesome/free-solid-svg-icons";

const SHOW_CONTEXT = "Bobby's Triple Threat on Food Network";

interface ShareButtonProps {
	sectionId: string;
	sectionName: string;
	shareText?: string;
}

export default function ShareButton({
	sectionId,
	sectionName,
	shareText,
}: ShareButtonProps) {
	const [copied, setCopied] = useState(false);

	async function handleShare() {
		const url = `${window.location.origin}/#${sectionId}`;
		const text =
			shareText ?? `Check out ${sectionName} for ${SHOW_CONTEXT}`;

		if (typeof gtag === "function") {
			gtag("event", "share_card", {
				event_category: "engagement",
				event_label: sectionName,
			});
		}

		const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
		if (navigator.share && isTouchDevice) {
			try {
				await navigator.share({
					title: "Titan Tracker",
					text,
					url,
				});
			} catch (e) {
				// user dismissed — no-op
			}
		} else {
			try {
				await navigator.clipboard.writeText(`${text}\n${url}`);
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
