/** @type {import('next').NextConfig} */
const nextConfig = {
	// Pin the project root so Turbopack doesn't infer it from a stray lockfile
	// in a parent folder (e.g. ~/package-lock.json).
	turbopack: {
		root: import.meta.dirname,
	},
};

export default nextConfig;
