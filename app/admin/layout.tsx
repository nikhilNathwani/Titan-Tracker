import type { Metadata } from "next";
import styles from "./admin.module.css";

export const metadata: Metadata = {
	title: "Admin · Titan Tracker",
	// Keep the portal out of search results and crawlers.
	robots: { index: false, follow: false },
};

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// base.css pads the <body> top by 80px to clear the fixed site header. The
	// admin portal has no header (it doesn't render SiteHeader), so cancel it.
	return <div className={styles.shell}>{children}</div>;
}
