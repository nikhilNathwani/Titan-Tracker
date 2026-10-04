import { describe, expect, it } from "vitest";
import {
	formatAvgMargin,
	formatAvgScore,
	formatWinPct,
	titanImageSrc,
	titanSlug,
} from "./format";

describe("formatAvgScore", () => {
	it("shows 3 significant digits", () => {
		expect(formatAvgScore(7.8542)).toBe("7.85");
		expect(formatAvgScore(16.4)).toBe("16.4");
	});

	it('shows "n/a" when there is no score', () => {
		expect(formatAvgScore(null)).toBe("n/a");
		expect(formatAvgScore(undefined)).toBe("n/a");
	});
});

describe("formatAvgMargin", () => {
	it("always shows a sign", () => {
		expect(formatAvgMargin(1.234)).toBe("+1.23");
		expect(formatAvgMargin(-0.5)).toBe("-0.50");
		expect(formatAvgMargin(0)).toBe("+0.00");
	});

	it('shows a tiny negative margin as "+0.00", not "+-0.00"', () => {
		expect(formatAvgMargin(-0.0033)).toBe("+0.00");
	});

	it('shows "n/a" when there is no margin', () => {
		expect(formatAvgMargin(null)).toBe("n/a");
	});
});

describe("formatWinPct", () => {
	it("excludes ties from the denominator", () => {
		expect(formatWinPct({ num_win: 2, num_loss: 1, num_tie: 5 })).toBe(
			"66.7%",
		);
	});

	it("shows a dash before any decided battles", () => {
		expect(formatWinPct({ num_win: 0, num_loss: 0, num_tie: 3 })).toBe("—");
	});
});

describe("titan name helpers", () => {
	it("turns a name into the card's anchor id, keeping capitals", () => {
		expect(titanSlug("Tiffani Faison")).toBe("Tiffani-Faison");
	});

	it("builds the lowercase image path", () => {
		expect(titanImageSrc("Tiffani Faison")).toBe(
			"/img/tiffani-faison-cropped.jpg",
		);
	});
});
