import {
	getWinLoss,
	getTitans,
	getAvgScores,
	getBestScores,
	getPerRoundStats,
} from "@/lib/queries";
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
		winLoss,
		{ allTitans, activeTitans, inactiveTitans },
		avgScoresMap,
		bestScoresMap,
		{ perRoundStatsMap, maxBattleCount },
	] = await Promise.all([
		getWinLoss(),
		getTitans(),
		getAvgScores(),
		getBestScores(),
		getPerRoundStats(),
	]);

	return (
		<>
			<SiteHeader />
			<HeroBanner />
			<Section title="Team Record" id="winLoss">
				<WinLoss {...winLoss} />
			</Section>
			<Section title="Titan Leaderboard" id="titanLeaderboard">
				<TitanLeaderboard titans={allTitans} />
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
