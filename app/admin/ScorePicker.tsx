"use client";

import styles from "./admin.module.css";

interface ScorePickerProps {
	label: string;
	/** Highest score for this round (10 for rounds 1-2, 20 for round 3). */
	max: number;
	value: string;
	onChange: (value: string) => void;
	disabled: boolean;
}

export default function ScorePicker({
	label,
	max,
	value,
	onChange,
	disabled,
}: ScorePickerProps) {
	// Highest first — titans usually score near the top of the range.
	const scores = Array.from({ length: max + 1 }, (_, i) => max - i);

	return (
		<div className={styles.field}>
			<span className={styles.label}>{label}</span>
			<div className={styles.scoreGrid} role="group" aria-label={label}>
				{scores.map((score) => {
					const selected = value === String(score);
					return (
						<button
							type="button"
							key={score}
							className={`${styles.scoreCell}${
								selected ? ` ${styles.scoreCellSelected}` : ""
							}`}
							aria-pressed={selected}
							disabled={disabled}
							onClick={() => onChange(selected ? "" : String(score))}
						>
							{score}
						</button>
					);
				})}
			</div>
		</div>
	);
}
