import type { Metadata } from "next";

export const metadata: Metadata = {
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
