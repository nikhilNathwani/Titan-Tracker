import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const TITLE = `${SITE_NAME} | Bobby's Triple Threat Stats`;

export const jsonLd = {
	"@context": "https://schema.org",
	"@type": "WebApplication",
	name: SITE_NAME,
	url: SITE_URL,
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

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: TITLE,
	description:
		"Tracking live stats for Bobby's Triple Threat on Food Network. Compare the performances of celebrity chefs Brooke Williamson, Michael Voltaggio, and Tiffany Derry, who were hand-picked by Bobby Flay to serve as the three culinary titans on this cooking competition show.",
	keywords: [
		"Bobby's Triple Threat",
		"Food Network",
		"Bobby Flay",
		"culinary competition",
		"cooking competition show",
		SITE_NAME,
		"Brooke Williamson",
		"Michael Voltaggio",
		"Tiffany Derry",
		"Ayesha Nurdjaja",
		"titan stats",
		"chef competition stats",
	],
	authors: [{ name: "Nikhil Nathwani" }],
	alternates: {
		canonical: `${SITE_URL}/`,
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
		url: `${SITE_URL}/`,
		title: TITLE,
		description:
			"Fan-made stat tracker for Bobby's Triple Threat on Food Network. Compare performances of the three culinary titans.",
		images: [
			{
				url: `${SITE_URL}/og-image.png`,
				width: 1200,
				height: 630,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: TITLE,
		description:
			"Fan-made stat tracker for Bobby's Triple Threat on Food Network. Compare performances of the three culinary titans.",
		images: [`${SITE_URL}/og-image.png`],
	},
};
