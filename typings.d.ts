// Allow side-effect CSS imports (global stylesheets) in TypeScript files.
// CSS Modules (*.module.css) are handled by Next.js automatically.
declare module "*.css";

// .sql files are imported as their text (see the "*.sql" rule in next.config.mjs).
declare module "*.sql" {
	const sql: string;
	export default sql;
}
