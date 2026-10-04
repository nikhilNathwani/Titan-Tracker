"use client";

import type { RoundNum, TitanName } from "@/lib/types";
import { maxScoreForRound, type RoundInput } from "@/lib/admin/episode";
import ScorePicker from "./ScorePicker";
import NameInput from "./NameInput";
import shared from "./shared.module.css";
import styles from "./RoundFields.module.css";

interface RoundFieldsProps {
	roundNum: RoundNum;
	value: RoundInput;
	roster: TitanName[];
	/** Titans locked to another round — not selectable here. */
	disabledTitans: TitanName[];
	/** This round's titan was auto-filled (the other two rounds are set). */
	isTitanAuto: boolean;
	onSelectTitan: (titanName: TitanName) => void;
	onChange: (patch: Partial<RoundInput>) => void;
	disabled: boolean;
}

export default function RoundFields({
	roundNum,
	value,
	roster,
	disabledTitans,
	isTitanAuto,
	onSelectTitan,
	onChange,
	disabled,
}: RoundFieldsProps) {
	const maxScore = maxScoreForRound(roundNum);

	// Show just first names on the buttons when they're unambiguous; the stored
	// value stays the full name.
	const firstNames = roster.map((name) => name.split(" ")[0]);
	const useFirstNames = new Set(firstNames).size === roster.length;

	return (
		<fieldset
			className={shared.fieldset}
			disabled={disabled}
			aria-label={`Round ${roundNum}`}
		>
			<p className={shared.legend}>
				Round {roundNum}
				<span className={styles.legendNote}>
					scored out of {maxScore}
				</span>
			</p>

			<div className={shared.field}>
				<span className={shared.label}>
					Titan
					{isTitanAuto && (
						<span className={styles.autoTag}>auto</span>
					)}
				</span>
				<div
					className={styles.titanChoices}
					role="group"
					aria-label={`Round ${roundNum} titan`}
				>
					{roster.map((name, i) => {
						const selected = value.titan_name === name;
						return (
							<button
								type="button"
								key={name}
								className={`${styles.titanChoice}${
									selected
										? ` ${styles.titanChoiceSelected}`
										: ""
								}`}
								aria-pressed={selected}
								aria-label={name}
								title={name}
								disabled={
									isTitanAuto ||
									(!selected && disabledTitans.includes(name))
								}
								onClick={() => onSelectTitan(name)}
							>
								{useFirstNames ? firstNames[i] : name}
							</button>
						);
					})}
				</div>
			</div>

			<div className={shared.fieldRow}>
				<NameInput
					label="Ingredient 1"
					value={value.ingredient1}
					onChange={(next) => onChange({ ingredient1: next })}
				/>
				<NameInput
					label="Ingredient 2"
					value={value.ingredient2}
					onChange={(next) => onChange({ ingredient2: next })}
				/>
			</div>

			<ScorePicker
				label="Titan score"
				max={maxScore}
				value={value.titan_score}
				onChange={(next) => onChange({ titan_score: next })}
				disabled={disabled}
			/>
			<ScorePicker
				label="Challenger score"
				max={maxScore}
				value={value.challenger_score}
				onChange={(next) => onChange({ challenger_score: next })}
				disabled={disabled}
			/>
		</fieldset>
	);
}
