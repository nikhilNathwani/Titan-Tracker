import type { EpisodeInput } from "@/lib/admin/episode";
import NameInput from "./NameInput";
import shared from "./shared.module.css";

type EpisodeDetails = Pick<
	EpisodeInput,
	"season_num" | "episode_num" | "challenger_name" | "judge_name"
>;

interface EpisodeDetailsFieldsProps {
	value: EpisodeDetails;
	onChange: (patch: Partial<EpisodeDetails>) => void;
	disabled: boolean;
}

/** Season, episode, challenger and judge: the form's first fieldset. */
export default function EpisodeDetailsFields({
	value,
	onChange,
	disabled,
}: EpisodeDetailsFieldsProps) {
	return (
		<fieldset
			className={shared.fieldset}
			disabled={disabled}
			aria-label="Episode details"
		>
			<p className={shared.legend}>Episode details</p>
			<div className={shared.fieldRow}>
				<label className={shared.field}>
					<span className={shared.label}>Season</span>
					<input
						type="number"
						inputMode="numeric"
						min={1}
						value={value.season_num}
						onChange={(event) =>
							onChange({ season_num: event.target.value })
						}
						className={shared.input}
					/>
				</label>
				<label className={shared.field}>
					<span className={shared.label}>Episode</span>
					<input
						type="number"
						inputMode="numeric"
						min={1}
						value={value.episode_num}
						onChange={(event) =>
							onChange({
								episode_num: event.target.value,
							})
						}
						className={shared.input}
					/>
				</label>
			</div>

			<div className={shared.fieldRow}>
				<NameInput
					label="Challenger"
					value={value.challenger_name}
					onChange={(next) => onChange({ challenger_name: next })}
				/>
				<NameInput
					label="Judge"
					value={value.judge_name}
					onChange={(next) => onChange({ judge_name: next })}
				/>
			</div>
		</fieldset>
	);
}
