import Script from "next/script";
import "../public/css/variables.css";
import "../public/css/base.css";

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

export default function RootLayout({ children }) {
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
				{children}
			</body>
		</html>
	);
}
