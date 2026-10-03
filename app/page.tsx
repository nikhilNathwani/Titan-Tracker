import { pool } from "@/lib/db";
import {
	winLossQuery,
	titanRecordsQuery,
	avgScoresQuery,
	bestScoresQuery,
	perRoundStatsQuery,
} from "@/lib/queries";
import { processTitanRecords } from "@/lib/ranking";
import type {
	TitanName,
	TitanRecord,
	BestScore,
	RoundStats,
	WinLossTie,
	AvgScoresMap,
	BestScoresMap,
	PerRoundStatsMap,
} from "@/lib/types";
import WinLoss from "@/components/Cards/WinLoss";
import TitanLeaderboard from "@/components/Cards/TitanLeaderboard";
import TitanCard from "@/components/Cards/TitanCard";
import Notes from "@/components/Cards/Notes";
import ShareButtons from "@/components/ShareButtons";
import HeroBanner from "@/components/HeroBanner";
import Section from "@/components/Section";
// SiteHeader/SiteFooter are rendered here rather than in the root layout: this is
// the only public page, and keeping them out of the root layout means /admin does
// not inherit SiteHeader's DB query / lib/queries .sql reads into its bundle.
import SiteHeader from "@/components/Layout/SiteHeader";
import SiteFooter from "@/components/Layout/SiteFooter";

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
		pool.query<WinLossTie>(winLossQuery),
		pool.query<TitanRecord>(titanRecordsQuery),
		pool.query<{ titan_name: TitanName; avg_score: number }>(
			avgScoresQuery,
		),
		pool.query<{ titan_name: TitanName } & BestScore>(bestScoresQuery),
		pool.query<{ titan_name: TitanName; round_num: number } & RoundStats>(
			perRoundStatsQuery,
		),
	]);

	// ── Win-Loss ──────────────────────────────────────────────
	const winLoss: WinLossTie = winLossResult.rows[0];

	// ── Titan Records ─────────────────────────────────────────
	const { titansWithRanks, activeTitans, inactiveTitans } =
		processTitanRecords(titanRecordsResult.rows);

	// ── Avg Scores ────────────────────────────────────────────
	const avgScoresMap: AvgScoresMap = {};
	avgScoresResult.rows.forEach((row) => {
		avgScoresMap[row.titan_name] = row.avg_score;
	});

	// ── Best Scores ───────────────────────────────────────────
	const bestScoresMap: BestScoresMap = {};
	bestScoresResult.rows.forEach(({ titan_name, ...bestScore }) => {
		bestScoresMap[titan_name] = bestScore;
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
	perRoundStatsResult.rows.forEach(({ titan_name, round_num, ...stats }) => {
		if (perRoundStatsMap[titan_name]) {
			perRoundStatsMap[titan_name][round_num] = stats;
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
			<SiteHeader />
			<HeroBanner />
			<Section title="Team Record" id="winLoss">
				<WinLoss {...winLoss} />
			</Section>
			<Section title="Titan Leaderboard" id="titanLeaderboard">
				<TitanLeaderboard titans={titansWithRanks} />
			</Section>
			<Section title="Individual Titan Stats" id="titansSectionLabel">
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
			</Section>
			{inactiveTitans.length > 0 && (
				<Section
					title="Inactive Titans"
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
				</Section>
			)}
			<Section title="Notes" id="notesSection">
				<Notes />
			</Section>
			<Section title="Share" id="shareSection">
				<ShareButtons />
			</Section>
			<SiteFooter />
		</>
	);
}
