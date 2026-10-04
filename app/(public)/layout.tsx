import Script from "next/script";
import { jsonLd } from "../metadata";
import SiteHeader from "@/components/Layout/SiteHeader";
import SiteFooter from "@/components/Layout/SiteFooter";

// Layout for the public site: everything in app/(public)/. The parentheses
// keep "(public)" out of the URL, so app/(public)/page.tsx is still "/".
// /admin lives outside this group, so it gets none of this: no header/footer
// (and their database query), no site metadata, no analytics.

export { metadata } from "../metadata";

export default function PublicLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
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
		</>
	);
}
