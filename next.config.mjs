import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
	// Pin the project root so Turbopack doesn't infer it from a stray lockfile
	// in a parent folder (e.g. ~/package-lock.json).
	turbopack: {
		root: import.meta.dirname,
		// Import .sql files as strings, so queries are built into the bundle
		// instead of being read from disk at runtime (see lib/queries.ts).
		rules: {
			"*.sql": {
				loaders: [
					path.join(
						import.meta.dirname,
						"lib/queries/sql-loader.cjs",
					),
				],
				as: "*.js",
			},
		},
	},
};

export default nextConfig;
