import type { Metadata } from "next";

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
	return children;
}
