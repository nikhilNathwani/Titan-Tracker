import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./styles/variables.css";
import "./styles/base.css";

// Root layout, shared by every route: the public site (app/(public)/) and the
// admin portal (app/admin/). Keep it to what both need; public-only things
// (header, footer, site metadata, analytics) live in app/(public)/layout.tsx.

config.autoAddCss = false;

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
