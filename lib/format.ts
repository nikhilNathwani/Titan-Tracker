import type { WinLossTie } from "./types";

/** Formats an average score to 3 significant digits, e.g. 7.854 → "7.85". */
export function formatAvgScore(val: number | null | undefined): string {
	return val == null ? "n/a" : val.toPrecision(3);
}

/** Formats an average margin with an explicit sign, e.g. "+1.23", "-0.50". */
export function formatAvgMargin(val: number | null): string {
	if (val == null) return "n/a";
	// A tiny negative like -0.0033 rounds to -0. -0 >= 0 is true, and
	// (-0).toFixed(2) is "0.00", so it shows as "+0.00" rather than "+-0.00".
	const rounded = Number(Number(val.toPrecision(3)).toFixed(2));
	return `${rounded >= 0 ? "+" : ""}${rounded.toFixed(2)}`;
}

/** Win percentage excluding ties, e.g. "66.7%"; "—" if no wins or losses yet. */
export function formatWinPct({ num_win, num_loss }: WinLossTie): string {
	const battles = num_win + num_loss;
	return battles > 0 ? `${((num_win / battles) * 100).toFixed(1)}%` : "—";
}
