// Proper-noun / title-case normalization for chef names and ingredients.
//
// Conservative on purpose: a word that is *already* mixed-case (McDonald,
// d'Artagnan, iSi) is left untouched — only all-lowercase or ALL-CAPS words get
// corrected. Whitespace is always trimmed and collapsed.

const LOWERCASE_WORDS = new Set([
	"a",
	"an",
	"and",
	"as",
	"at",
	"but",
	"by",
	"for",
	"from",
	"in",
	"of",
	"on",
	"or",
	"the",
	"to",
	"with",
	"de",
	"del",
	"la",
	"le",
	"les",
	"du",
	"van",
	"von",
]);

function capitalizeSegment(segment: string): string {
	if (!segment) return segment;
	const isAllLower = segment === segment.toLowerCase();
	const isAllUpper = segment === segment.toUpperCase();
	if (!isAllLower && !isAllUpper) return segment; // deliberately-cased, leave it
	return segment[0].toUpperCase() + segment.slice(1).toLowerCase();
}

function capitalizeWord(word: string): string {
	// Split on hyphens and apostrophes, keeping the separators.
	const tokens = word.split(/([-'])/);
	return tokens
		.map((token, i) => {
			if (token === "-" || token === "'") return token;
			// After an apostrophe, only capitalize when the prefix is short
			// (O'Brien, d'Artagnan) — not "Shepherd's".
			if (tokens[i - 1] === "'" && (tokens[i - 2]?.length ?? 99) > 2) {
				return token;
			}
			return capitalizeSegment(token);
		})
		.join("");
}

export function toTitleCase(value: string): string {
	const words = value.trim().split(/\s+/).filter(Boolean);
	return words
		.map((word, i) => {
			const lower = word.toLowerCase();
			if (i !== 0 && LOWERCASE_WORDS.has(lower)) return lower;
			return capitalizeWord(word);
		})
		.join(" ");
}

/** True when title-casing would actually change the (trimmed) value. */
export function needsTitleCase(value: string): boolean {
	return value.trim() !== "" && toTitleCase(value) !== value.trim();
}
