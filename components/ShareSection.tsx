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
import SectionLabel from "./SectionLabel";

const SHARE_TITLE = "Titan Tracker";
const SHARE_TEXT =
	"Check out Titan Tracker — stats for Bobby's Triple Threat on Food Network";

export default function ShareSection() {
	const [copied, setCopied] = useState(false);

	function handleCopy() {
		// Update UI immediately — don't wait on clipboard permission
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);

		const url = window.location.origin;
		const text = `${SHARE_TEXT}\n${url}`;

		if (navigator.clipboard?.writeText) {
			navigator.clipboard
				.writeText(text)
				.catch(() => copyViaExecCommand(text));
		} else {
			copyViaExecCommand(text);
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
			<SectionLabel>Share</SectionLabel>
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
					<button
						onClick={handleEmail}
						className={styles.btn}
						aria-label="Share via email"
					>
						<FontAwesomeIcon icon={faEnvelope} />
					</button>
					<span className={styles.btnLabel}>Email</span>
				</div>
				<div className={styles.btnWrapper}>
					<button
						onClick={handleText}
						className={styles.btn}
						aria-label="Share via text message"
					>
						<FontAwesomeIcon icon={faComment} />
					</button>
					<span className={styles.btnLabel}>Text</span>
				</div>
			</div>
		</div>
	);
}
