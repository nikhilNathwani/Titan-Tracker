import { defineConfig } from "vitest/config";

export default defineConfig({
	// Match the "@/..." import alias from tsconfig.json.
	resolve: { alias: { "@": import.meta.dirname } },
	test: { include: ["lib/**/*.test.ts"] },
});
