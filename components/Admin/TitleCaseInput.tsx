"use client";

import { useState } from "react";
import { needsTitleCase, toTitleCase } from "@/lib/admin/titleCase";
import shared from "./shared.module.css";
import styles from "./TitleCaseInput.module.css";

interface TitleCaseInputProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
}

/**
 * Text input for proper-noun fields (chef names, ingredients). Shows a
 * non-blocking capitalization hint — with a one-click fix — once the field
 * loses focus.
 */
export default function TitleCaseInput({
	label,
	value,
	onChange,
}: TitleCaseInputProps) {
	const [focused, setFocused] = useState(false);
	const suggestion = needsTitleCase(value) ? toTitleCase(value) : null;

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
			{!focused && suggestion && (
				<span className={styles.fieldWarning}>
					Capitalization looks off — expected “{suggestion}”.{" "}
					<button
						type="button"
						className={styles.inlineFix}
						onClick={() => onChange(suggestion)}
					>
						Use it
					</button>
				</span>
			)}
		</label>
	);
}
