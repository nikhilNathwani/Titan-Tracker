import Script from "next/script";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "../public/css/variables.css";
import "../public/css/base.css";
import { jsonLd } from "./metadata";
import SiteHeader from "@/components/Layout/SiteHeader";
import SiteFooter from "@/components/Layout/SiteFooter";

config.autoAddCss = false;

export { metadata } from "./metadata";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
					}}
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
				<SiteHeader />
				{children}
				<SiteFooter />
			</body>
		</html>
	);
}
