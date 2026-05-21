"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCopy,
	faCheck,
	faEnvelope,
	faComment,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./ShareSection.module.css";

const SHARE_TITLE = "Titan Tracker";
const SHARE_TEXT =
	"Check out Titan Tracker — stats for Bobby's Triple Threat on Food Network";

export default function ShareSection() {
	const [copied, setCopied] = useState(false);

	async function handleCopy() {
		const url = window.location.origin;
		try {
			await navigator.clipboard.writeText(`${SHARE_TEXT}\n${url}`);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (_) {}
	}

	function handleEmail() {
		const url = window.location.origin;
		const subject = encodeURIComponent(SHARE_TITLE);
		const body = encodeURIComponent(`${SHARE_TEXT}\n${url}`);
		window.location.href = `mailto:?subject=${subject}&body=${body}`;
	}

	function handleText() {
		const url = window.location.origin;
		const body = encodeURIComponent(`${SHARE_TEXT}\n${url}`);
		window.location.href = `sms:?&body=${body}`;
	}

	return (
		<div className="section" id="shareSection">
			<p className="section-label">Share</p>
			<div className={`section-content ${styles.content}`}>
				<div className={styles.buttons}>
					<button
						onClick={handleCopy}
						className={`${styles.btn} ${copied ? styles.btnCopied : ""}`}
						disabled={copied}
					>
						<FontAwesomeIcon icon={copied ? faCheck : faCopy} />
						{copied ? "Copied!" : "Copy link"}
					</button>
					<button onClick={handleEmail} className={styles.btn}>
						<FontAwesomeIcon icon={faEnvelope} />
						Email
					</button>
					<button onClick={handleText} className={styles.btn}>
						<FontAwesomeIcon icon={faComment} />
						Text
					</button>
				</div>
			</div>
		</div>
	);
}
