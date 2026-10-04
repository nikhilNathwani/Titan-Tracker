"use client";

import { useState } from "react";
import { looksMiscapitalized } from "@/lib/admin/episode";
import shared from "./shared.module.css";
import styles from "./NameInput.module.css";

interface NameInputProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
}

/**
 * Text input for names and ingredients. Once the field loses focus, shows a
 * non-blocking warning if the text is all lowercase or ALL CAPS.
 */
export default function NameInput({ label, value, onChange }: NameInputProps) {
	const [focused, setFocused] = useState(false);
	const showWarning = !focused && looksMiscapitalized(value);
	const isUpper = value === value.toUpperCase();

	return (
		<label className={shared.field}>
			<span className={shared.label}>{label}</span>
			<input
				type="text"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
				className={shared.input}
				autoComplete="off"
			/>
			{showWarning && (
				<span className={styles.fieldWarning}>
					This is all {isUpper ? "caps" : "lowercase"}. Check the
					capitalization.
				</span>
			)}
		</label>
	);
}
