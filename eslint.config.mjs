import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

// Next.js's recommended setup: core + Core Web Vitals rules, TypeScript
// rules, and eslint-config-prettier last so ESLint leaves formatting to
// Prettier.
export default defineConfig([
	...nextVitals,
	...nextTs,
	prettier,
	globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
