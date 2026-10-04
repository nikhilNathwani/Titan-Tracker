import { describe, expect, it } from "vitest";
import {
	generateRankLabels,
	processTitanRecords,
	rankClasses,
} from "./ranking";
import type { TitanRecord } from "./types";

describe("generateRankLabels", () => {
	it("adds ordinal suffixes", () => {
		expect(generateRankLabels([1, 2, 3, 4])).toEqual([
			"1st",
			"2nd",
			"3rd",
			"4th",
		]);
	});

	it('marks ties with "T-" and unranked titans as "NR"', () => {
		expect(generateRankLabels([1, 1, 3, null])).toEqual([
			"T-1st",
			"T-1st",
			"3rd",
			"NR",
		]);
	});
});

describe("processTitanRecords", () => {
	const row = (
		titan_name: string,
		rank: number | null,
		is_active = rank !== null,
	): TitanRecord => ({
		titan_name,
		is_active,
		rank,
		num_win: 1,
		num_tie: 0,
		num_loss: 1,
	});

	it("labels every titan and splits active from inactive, keeping order", () => {
		const { allTitans, activeTitans, inactiveTitans } = processTitanRecords(
			[row("A", 1), row("B", 2), row("C", 2), row("D", null)],
		);
		expect(allTitans.map((t) => t.rankLabel)).toEqual([
			"1st",
			"T-2nd",
			"T-2nd",
			"NR",
		]);
		expect(activeTitans.map((t) => t.titan_name)).toEqual(["A", "B", "C"]);
		expect(inactiveTitans.map((t) => t.titan_name)).toEqual(["D"]);
	});
});

describe("rankClasses", () => {
	it("returns the badge and border classes for a rank", () => {
		expect(rankClasses(2)).toEqual({
			badge: "rank rank2",
			border: "rank2",
		});
	});

	it('uses "NR" for unranked titans', () => {
		expect(rankClasses(null)).toEqual({
			badge: "rank rankNR",
			border: "rankNR",
		});
	});
});
