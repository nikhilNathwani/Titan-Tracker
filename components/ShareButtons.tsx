"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCopy,
	faCheck,
	faEnvelope,
	faComment,
} from "@fortawesome/free-solid-svg-icons";
import { SITE_URL } from "@/lib/site";
import styles from "./ShareButtons.module.css";

const SHARE_TITLE = "Titan Tracker";
const SHARE_TEXT =
	"Check out Titan Tracker — stats for Bobby's Triple Threat on Food Network";
const SHARE_MESSAGE = `${SHARE_TEXT}\n${SITE_URL}`;

// Email and text are plain links (they work before the page's JavaScript
// loads); only Copy needs JavaScript, for the clipboard.
const EMAIL_HREF = `mailto:?subject=${encodeURIComponent(SHARE_TITLE)}&body=${encodeURIComponent(SHARE_MESSAGE)}`;
const TEXT_HREF = `sms:?&body=${encodeURIComponent(SHARE_MESSAGE)}`;

export default function ShareSection() {
	const [copied, setCopied] = useState(false);

	function handleCopy() {
		// Update UI immediately — don't wait on clipboard permission
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);

		if (navigator.clipboard?.writeText) {
			navigator.clipboard
				.writeText(SHARE_MESSAGE)
				.catch(() => copyViaExecCommand(SHARE_MESSAGE));
		} else {
			copyViaExecCommand(SHARE_MESSAGE);
		}
	}

	function copyViaExecCommand(text: string) {
		const ta = document.createElement("textarea");
		ta.value = text;
		ta.style.cssText =
			"position:fixed;top:0;left:0;opacity:0;pointer-events:none";
		document.body.appendChild(ta);
		ta.focus();
		ta.select();
		try {
			document.execCommand("copy");
		} catch {}
		document.body.removeChild(ta);
	}

	return (
		<div className={styles.buttons}>
			<div className={styles.btnWrapper}>
				<button
					onClick={handleCopy}
					className={`${styles.btn} ${copied ? styles.btnCopied : ""}`}
					disabled={copied}
					aria-label="Copy link"
				>
					<FontAwesomeIcon icon={copied ? faCheck : faCopy} />
				</button>
				<span className={styles.btnLabel}>
					{copied ? "Copied!" : "Copy"}
				</span>
			</div>
			<div className={styles.btnWrapper}>
				<a
					href={EMAIL_HREF}
					className={styles.btn}
					aria-label="Share via email"
				>
					<FontAwesomeIcon icon={faEnvelope} />
				</a>
				<span className={styles.btnLabel}>Email</span>
			</div>
			<div className={styles.btnWrapper}>
				<a
					href={TEXT_HREF}
					className={styles.btn}
					aria-label="Share via text message"
				>
					<FontAwesomeIcon icon={faComment} />
				</a>
				<span className={styles.btnLabel}>Text</span>
			</div>
		</div>
	);
}
