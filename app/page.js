import Image from "next/image";
import { pool } from "@/lib/db";
import {
	winLossQuery,
	titanRecordsQuery,
	avgScoresQuery,
	bestScoresQuery,
	perRoundStatsQuery,
} from "@/lib/queries";
import { generateRankStrings } from "@/lib/ranking";
import SiteHeader from "@/components/SiteHeader";
import WinLoss from "@/components/WinLoss";
import TitanLeaderboard from "@/components/TitanLeaderboard";
import TitanCard from "@/components/TitanCard";
import Footer from "@/components/Footer";
import pageStyles from "./page.module.css";

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
		pool.query(winLossQuery),
		pool.query(titanRecordsQuery),
		pool.query(avgScoresQuery),
		pool.query(bestScoresQuery),
		pool.query(perRoundStatsQuery),
	]);

	// ── Win-Loss ──────────────────────────────────────────────
	const winLoss = {
		num_win: parseInt(winLossResult.rows[0].num_win, 10),
		num_tie: parseInt(winLossResult.rows[0].num_tie, 10),
		num_loss: parseInt(winLossResult.rows[0].num_loss, 10),
	};

	// ── Titan Records ─────────────────────────────────────────
	const titanRecords = titanRecordsResult.rows.map((t) => ({
		titan_name: t.titan_name,
		num_win: parseInt(t.num_win, 10),
		num_tie: parseInt(t.num_tie, 10),
		num_loss: parseInt(t.num_loss, 10),
		rank: t.rank === null ? null : parseInt(t.rank, 10),
		is_active: t.is_active,
	}));

	const rankStrings = generateRankStrings(titanRecords.map((t) => t.rank));
	const titansWithRanks = titanRecords.map((t, i) => ({
		...t,
		rankString: rankStrings[i],
	}));

	// Active titans sorted by rank ascending; inactive titans after
	const activeTitans = titansWithRanks
		.filter((t) => t.rank !== null)
		.sort((a, b) => a.rank - b.rank);
	const inactiveTitans = titansWithRanks.filter((t) => t.rank === null);

	// ── Avg Scores ────────────────────────────────────────────
	const avgScoresMap = {};
	avgScoresResult.rows.forEach((row) => {
		avgScoresMap[row.titan_name] = parseFloat(row.avg_score);
	});

	// ── Best Scores ───────────────────────────────────────────
	const bestScoresMap = {};
	bestScoresResult.rows.forEach((row) => {
		bestScoresMap[row.titan_name] = {
			titan_score: row.titan_score,
			max_score: row.max_score,
			ingredient1: row.ingredient1,
			ingredient2: row.ingredient2,
		};
	});

	// ── Per-Round Stats ───────────────────────────────────────
	// Initialize all titans with empty rounds so components always get a
	// complete object even if the DB has no rows yet for that titan/round.
	const perRoundStatsMap = {};
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
			<SiteHeader
				activeTitans={activeTitans}
				inactiveTitans={inactiveTitans}
			/>
			<div id="heroSection" className={pageStyles.heroSection}>
				<Image
					src="/og-image.png"
					alt="Bobby's Triple Threat — Fan-made Stat Tracker"
					id="heroImage"
					className={pageStyles.heroImage}
					width={1200}
					height={630}
					priority
					sizes="(max-width: 680px) 96vw, 680px"
				/>
			</div>
			<WinLoss {...winLoss} />
			<TitanLeaderboard titans={titansWithRanks} />
			<p className="section-label" id="titansSectionLabel">
				Individual Titan Stats
			</p>
			<div className="titan-cards-group">
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
			</div>
			{inactiveTitans.length > 0 && (
				<>
					<p
						className="section-label"
						id="inactiveTitansSectionLabel"
					>
						Inactive Titans
					</p>
					<div className="titan-cards-group">
						{inactiveTitans.map((titan) => (
							<TitanCard
								key={titan.titan_name}
								titan={titan}
								avgScore={avgScoresMap[titan.titan_name]}
								bestScore={bestScoresMap[titan.titan_name]}
								perRoundStats={
									perRoundStatsMap[titan.titan_name]
								}
								maxBattleCount={maxBattleCount}
							/>
						))}
					</div>
				</>
			)}
			<div className="section" id="notesSection">
				<p className="section-label">Notes</p>
				<div className={`section-content ${pageStyles.notesContent}`}>
					<p>
						<span className="footnote">*</span> Win rate = wins
						&divide; (wins + losses); ties are not counted.
					</p>
					<p>
						<span className="footnote">
							<sup>†</sup>
						</span>{" "}
						When averaging, I count Round 3&apos;s 20-pt scores as
						two separate 10-pt scores. E.g. a 16/20 counts as two
						8/10&apos;s.
					</p>
				</div>
			</div>
			<Footer />
		</>
	);
}
