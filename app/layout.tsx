import Script from "next/script";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "../public/css/variables.css";
import "../public/css/base.css";
import { pool } from "@/lib/db";
import { titanRecordsQuery } from "@/lib/queries";
import { generateRankStrings } from "@/lib/ranking";
import type { TitanRecordRow, TitanRecord, TitanWithRank } from "@/lib/types";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

config.autoAddCss = false;

export const metadata = {
	metadataBase: new URL("https://triple-threat.vercel.app"),
	title: "Titan Tracker | Bobby's Triple Threat Stats",
	description:
		"Tracking live stats for Bobby's Triple Threat on Food Network. Compare the performances of celebrity chefs Brooke Williamson, Michael Voltaggio, and Tiffany Derry, who were hand-picked by Bobby Flay to serve as the three culinary titans on this cooking competition show.",
	keywords: [
		"Bobby's Triple Threat",
		"Food Network",
		"Bobby Flay",
		"culinary competition",
		"cooking competition show",
		"Titan Tracker",
		"Brooke Williamson",
		"Michael Voltaggio",
		"Tiffany Derry",
		"Ayesha Nurdjaja",
		"titan stats",
		"chef competition stats",
	],
	authors: [{ name: "Nikhil Nathwani" }],
	alternates: {
		canonical: "https://triple-threat.vercel.app/",
	},
	robots: {
		index: true,
		follow: true,
	},
	verification: {
		google: "z7rSYAznpAdzXXxsZjWJLxmoNxAhZsogn8ZD82DhefA",
	},
	openGraph: {
		type: "website",
		url: "https://triple-threat.vercel.app/",
		title: "Titan Tracker | Bobby's Triple Threat Stats",
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
		title: "Titan Tracker | Bobby's Triple Threat Stats",
		description:
			"Fan-made stat tracker for Bobby's Triple Threat on Food Network. Compare performances of the three culinary titans.",
		images: ["https://triple-threat.vercel.app/og-image.png"],
	},
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const titanRecordsResult =
		await pool.query<TitanRecordRow>(titanRecordsQuery);
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
	const activeTitans: TitanWithRank[] = titansWithRanks
		.filter((t) => t.rank !== null)
		.sort((a, b) => (a.rank as number) - (b.rank as number));
	const inactiveTitans: TitanWithRank[] = titansWithRanks.filter(
		(t) => t.rank === null,
	);

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebApplication",
		name: "Titan Tracker",
		url: "https://triple-threat.vercel.app",
		description:
			"Fan-made stats tracker for Bobby's Triple Threat on Food Network. Track win rates, rankings, and battle stats for the culinary Titans.",
		applicationCategory: "Entertainment",
		operatingSystem: "All",
		author: {
			"@type": "Person",
			name: "Nikhil Nathwani",
		},
		about: {
			"@type": "TVSeries",
			name: "Bobby's Triple Threat",
			network: {
				"@type": "Organization",
				name: "Food Network",
			},
		},
	};

	return (
		<html lang="en">
			<head>
				<meta
					name="google-site-verification"
					content="z7rSYAznpAdzXXxsZjWJLxmoNxAhZsogn8ZD82DhefA"
				/>
			</head>
			<body>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
				/>
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
				<Footer />
			</body>
		</html>
	);
}
