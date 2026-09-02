/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		// SiteHeader (root layout) pulls in lib/queries.ts, which reads the .sql
		// files via fs.readFileSync(process.cwd() + …). Next's file tracer follows
		// that for the statically-prerendered pages but misses it for the dynamic
		// /admin route, so its serverless bundle shipped without the .sql files
		// and every request 500'd with ENOENT. Force them into the trace.
		outputFileTracingIncludes: {
			"/admin": ["./lib/queries/**/*.sql"],
		},
	},
};

export default nextConfig;
