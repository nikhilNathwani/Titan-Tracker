import { pool } from "@/lib/db";
import {
	winLossQuery,
	titanRecordsQuery,
	avgScoresQuery,
	bestScoresQuery,
	perRoundStatsQuery,
} from "@/lib/queries";
import { generateRankStrings } from "@/lib/ranking";
import type {
	WinLossRow,
	TitanRecordRow,
	AvgScoreRow,
	BestScoreRow,
	PerRoundStatsRow,
	TitanRecord,
	TitanWithRank,
	WinLossData,
	AvgScoresMap,
	BestScoresMap,
	PerRoundStatsMap,
} from "@/lib/types";
import WinLoss from "@/components/WinLoss";
import TitanLeaderboard from "@/components/TitanLeaderboard";
import TitanCard from "@/components/TitanCard";
import TitanGroup from "@/components/TitanGroup";
import Notes from "@/components/Notes";
import ShareSection from "@/components/ShareSection";
import HeroSection from "@/components/HeroSection";

// Render this page as static HTML at build time (SSG).
// Re-deploy to pick up new data.
export const dynamic = "force-static";

export default async function Home() {
	// Fetch all data in parallel at build time
	const [
		winLossResult,
		titanRecordsResult,
		avgScoresResult,
		bestScoresResult,
		perRoundStatsResult,
	] = await Promise.all([
		pool.query<WinLossRow>(winLossQuery),
		pool.query<TitanRecordRow>(titanRecordsQuery),
		pool.query<AvgScoreRow>(avgScoresQuery),
		pool.query<BestScoreRow>(bestScoresQuery),
		pool.query<PerRoundStatsRow>(perRoundStatsQuery),
	]);

	// ── Win-Loss ──────────────────────────────────────────────
	const winLoss: WinLossData = {
		num_win: parseInt(winLossResult.rows[0].num_win, 10),
		num_tie: parseInt(winLossResult.rows[0].num_tie, 10),
		num_loss: parseInt(winLossResult.rows[0].num_loss, 10),
	};

	// ── Titan Records ─────────────────────────────────────────
	const titanRecords: TitanRecord[] = titanRecordsResult.rows.map((t) => ({
		titan_name: t.titan_name,
		num_win: parseInt(t.num_win, 10),
		num_tie: parseInt(t.num_tie, 10),
		num_loss: parseInt(t.num_loss, 10),
		rank: t.rank === null ? null : parseInt(t.rank, 10),
		is_active: t.is_active,
	}));

	const rankStrings: string[] = generateRankStrings(
		titanRecords.map((t) => t.rank),
	);
	const titansWithRanks: TitanWithRank[] = titanRecords.map((t, i) => ({
		...t,
		rankString: rankStrings[i],
	}));

	// Active titans sorted by rank ascending; inactive titans after
	const activeTitans: TitanWithRank[] = titansWithRanks
		.filter((t) => t.rank !== null)
		.sort((a, b) => (a.rank as number) - (b.rank as number));
	const inactiveTitans: TitanWithRank[] = titansWithRanks.filter(
		(t) => t.rank === null,
	);

	// ── Avg Scores ────────────────────────────────────────────
	const avgScoresMap: AvgScoresMap = {};
	avgScoresResult.rows.forEach((row) => {
		avgScoresMap[row.titan_name] = parseFloat(row.avg_score);
	});

	// ── Best Scores ───────────────────────────────────────────
	const bestScoresMap: BestScoresMap = {};
	bestScoresResult.rows.forEach((row) => {
		bestScoresMap[row.titan_name] = {
			titan_score: parseFloat(row.titan_score),
			max_score: parseFloat(row.max_score),
			ingredient1: row.ingredient1,
			ingredient2: row.ingredient2,
		};
	});

	// ── Per-Round Stats ───────────────────────────────────────
	// Initialize all titans with empty rounds so components always get a
	// complete object even if the DB has no rows yet for that titan/round.
	const perRoundStatsMap: PerRoundStatsMap = {};
	for (const t of titansWithRanks) {
		perRoundStatsMap[t.titan_name] = {
			1: { battle_count: 0, avg_score: null, avg_margin: null },
			2: { battle_count: 0, avg_score: null, avg_margin: null },
			3: { battle_count: 0, avg_score: null, avg_margin: null },
		};
	}
	perRoundStatsResult.rows.forEach((row) => {
		if (perRoundStatsMap[row.titan_name]) {
			perRoundStatsMap[row.titan_name][row.round_num] = {
				battle_count: parseInt(row.battle_count, 10),
				avg_score: row.avg_score ? parseFloat(row.avg_score) : null,
				avg_margin: row.avg_margin ? parseFloat(row.avg_margin) : null,
			};
		}
	});

	// Max battle count across all titans (for histogram bar scaling)
	let maxBattleCount = 1; // minimum 1 to avoid divide-by-zero
	Object.values(perRoundStatsMap).forEach((rounds) => {
		Object.values(rounds).forEach((round) => {
			if (round.battle_count > maxBattleCount) {
				maxBattleCount = round.battle_count;
			}
		});
	});

	return (
		<>
			<HeroSection />
			<WinLoss {...winLoss} />
			<TitanLeaderboard titans={titansWithRanks} />
			<TitanGroup label="Individual Titan Stats" id="titansSectionLabel">
				{activeTitans.map((titan) => (
					<TitanCard
						key={titan.titan_name}
						titan={titan}
						avgScore={avgScoresMap[titan.titan_name]}
						bestScore={bestScoresMap[titan.titan_name]}
						perRoundStats={perRoundStatsMap[titan.titan_name]}
						maxBattleCount={maxBattleCount}
					/>
				))}
			</TitanGroup>
			{inactiveTitans.length > 0 && (
				<TitanGroup
					label="Inactive Titans"
					id="inactiveTitansSectionLabel"
				>
					{inactiveTitans.map((titan) => (
						<TitanCard
							key={titan.titan_name}
							titan={titan}
							avgScore={avgScoresMap[titan.titan_name]}
							bestScore={bestScoresMap[titan.titan_name]}
							perRoundStats={perRoundStatsMap[titan.titan_name]}
							maxBattleCount={maxBattleCount}
						/>
					))}
				</TitanGroup>
			)}
			<Notes />
			<ShareSection />
		</>
	);
}
