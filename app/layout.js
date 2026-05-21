import Script from "next/script";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "../public/css/variables.css";
import "../public/css/base.css";
import { pool } from "@/lib/db";
import { titanRecordsQuery } from "@/lib/queries";
import { generateRankStrings } from "@/lib/ranking";
import SiteHeader from "@/components/SiteHeader";

config.autoAddCss = false;

export const metadata = {
	title: "Bobby's Triple Threat - Stats",
	description:
		"Tracking live stats for Bobby's Triple Threat on Food Network. Compare the performances of celebrity chefs Brooke Williamson, Michael Voltaggio, and Tiffany Derry, who were hand-picked by Bobby Flay to serve as the three culinary titans on this cooking competition show.",
	openGraph: {
		type: "website",
		url: "https://triple-threat.vercel.app/",
		title: "Titan Tracker",
		description:
			"Fan-made stat tracker for Bobby's Triple Threat on Food Network. Compare performances of the three culinary titans.",
		images: [
			{
				url: "https://triple-threat.vercel.app/og-image.png",
				width: 1200,
				height: 630,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		images: ["https://triple-threat.vercel.app/og-image.png"],
	},
};

export default async function RootLayout({ children }) {
	const titanRecordsResult = await pool.query(titanRecordsQuery);
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
	const activeTitans = titansWithRanks
		.filter((t) => t.rank !== null)
		.sort((a, b) => a.rank - b.rank);
	const inactiveTitans = titansWithRanks.filter((t) => t.rank === null);

	return (
		<html lang="en">
			<body>
				<Script
					src="https://www.googletagmanager.com/gtag/js?id=G-M9MMZFVNHC"
					strategy="afterInteractive"
				/>
				<Script id="google-analytics" strategy="afterInteractive">
					{`
						window.dataLayer = window.dataLayer || [];
						function gtag(){dataLayer.push(arguments);}
						gtag('js', new Date());
						gtag('config', 'G-M9MMZFVNHC');
					`}
				</Script>
				<SiteHeader
					activeTitans={activeTitans}
					inactiveTitans={inactiveTitans}
				/>
				{children}
			</body>
		</html>
	);
}
