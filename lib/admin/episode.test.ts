import { describe, expect, it } from "vitest";
import {
	emptyEpisodeInput,
	isComplete,
	looksMiscapitalized,
	maxScoreForRound,
	pickTitan,
	resolveTitanAssignments,
	titansLockedElsewhere,
	type EpisodeInput,
} from "./episode";
import { isPristine } from "./draft";

const filledEpisode = (): EpisodeInput => ({
	season_num: "5",
	episode_num: "7",
	challenger_name: "Test Chef",
	judge_name: "Test Judge",
	rounds: ["A", "B", "C"].map((titan_name) => ({
		titan_name,
		ingredient1: "Corn",
		ingredient2: "Lamb",
		titan_score: "8",
		challenger_score: "7",
	})),
});

describe("maxScoreForRound", () => {
	it("is 10 for rounds 1-2 and 20 for round 3", () => {
		expect([1, 2, 3].map((r) => maxScoreForRound(r as 1 | 2 | 3))).toEqual([
			10, 10, 20,
		]);
	});
});

describe("looksMiscapitalized", () => {
	it("flags text that is all lowercase or ALL CAPS", () => {
		expect(looksMiscapitalized("sea urchin")).toBe(true);
		expect(looksMiscapitalized("SEA URCHIN")).toBe(true);
		expect(looksMiscapitalized("  giada de laurentiis ")).toBe(true);
	});

	it("trusts deliberate mixed case", () => {
		for (const value of [
			"Sea Urchin",
			"Giada De Laurentiis",
			"Estratto di Pomodoro",
			"NY Strip Steak",
			"Hen-of-the-woods Mushroom",
		]) {
			expect(looksMiscapitalized(value)).toBe(false);
		}
	});

	it("ignores empty input and text without letters", () => {
		expect(looksMiscapitalized("")).toBe(false);
		expect(looksMiscapitalized("   ")).toBe(false);
		expect(looksMiscapitalized("100")).toBe(false);
	});
});

describe("isComplete", () => {
	it("is true when every field is filled", () => {
		expect(isComplete(filledEpisode())).toBe(true);
	});

	it("is false when any field is blank", () => {
		const blankJudge = { ...filledEpisode(), judge_name: "  " };
		expect(isComplete(blankJudge)).toBe(false);

		const blankScore = filledEpisode();
		blankScore.rounds[2].challenger_score = "";
		expect(isComplete(blankScore)).toBe(false);
	});

	it('treats a score of "0" as filled', () => {
		const zero = filledEpisode();
		zero.rounds[0].titan_score = "0";
		expect(isComplete(zero)).toBe(true);
	});
});

describe("resolveTitanAssignments", () => {
	const roster = ["A", "B", "C"];

	it("auto-fills the last round once the other two are picked", () => {
		expect(resolveTitanAssignments(["A", "", "C"], roster)).toEqual({
			titans: ["A", "B", "C"],
			autoIndex: 1,
		});
	});

	it("does nothing until two rounds are picked", () => {
		expect(resolveTitanAssignments(["A", "", ""], roster)).toEqual({
			titans: ["A", "", ""],
			autoIndex: null,
		});
	});

	it("does nothing when the roster isn't one titan per round", () => {
		expect(resolveTitanAssignments(["A", "B", ""], ["A", "B"])).toEqual({
			titans: ["A", "B", ""],
			autoIndex: null,
		});
	});
});

describe("pickTitan", () => {
	const roster = ["A", "B", "C"];

	it("picks a titan for a round", () => {
		expect(pickTitan(["", "", ""], null, 0, "A", roster)).toEqual({
			titans: ["A", "", ""],
			autoIndex: null,
		});
	});

	it("auto-fills the last round when the second titan is picked", () => {
		expect(pickTitan(["A", "", ""], null, 1, "B", roster)).toEqual({
			titans: ["A", "B", "C"],
			autoIndex: 2,
		});
	});

	it("clears a round when its selected titan is clicked again", () => {
		expect(pickTitan(["A", "", ""], null, 0, "A", roster)).toEqual({
			titans: ["", "", ""],
			autoIndex: null,
		});
	});

	it("re-swaps the auto-filled round when an earlier pick changes", () => {
		expect(pickTitan(["A", "B", "C"], 2, 0, "C", roster)).toEqual({
			titans: ["C", "B", "A"],
			autoIndex: 2,
		});
	});

	it("drops the auto-fill when a manual pick is cleared", () => {
		expect(pickTitan(["A", "B", "C"], 2, 1, "B", roster)).toEqual({
			titans: ["A", "", ""],
			autoIndex: null,
		});
	});
});

describe("titansLockedElsewhere", () => {
	const rounds = filledEpisode().rounds;

	it("lists titans picked for the other rounds", () => {
		expect(titansLockedElsewhere(rounds, 0, null)).toEqual(["B", "C"]);
	});

	it("doesn't lock the auto-filled round's titan", () => {
		expect(titansLockedElsewhere(rounds, 0, 2)).toEqual(["B"]);
	});
});

describe("isPristine (draft autosave)", () => {
	it("is true for a fresh form, so it isn't saved as a draft", () => {
		expect(
			isPristine(emptyEpisodeInput({ season_num: 5, episode_num: 7 })),
		).toBe(true);
	});

	it("is false once anything is entered", () => {
		const input = emptyEpisodeInput({ season_num: 5, episode_num: 7 });
		input.rounds[1].ingredient1 = "Corn";
		expect(isPristine(input)).toBe(false);
	});
});
