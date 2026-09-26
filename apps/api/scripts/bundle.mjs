/**
 * Compiles the API into one JavaScript file (dist/main.js) so production starts with plain `node`
 * instead of compiling TypeScript with tsx on every cold start. npm packages (Prisma, NestJS,
 * @fit/shared, ...) stay external and load from node_modules as before.
 *
 * esbuild is what tsx uses under the hood, so the compiled output behaves like the code that ran
 * before (legacy decorators from tsconfig, no emitted decorator metadata).
 */
import { build } from "esbuild";

await build({
	entryPoints: ["src/main.ts"],
	outfile: "dist/main.js",
	bundle: true,
	platform: "node",
	format: "esm",
	target: "node24",
	// Resolves the "@/*" path alias and the decorator settings from tsconfig.json.
	tsconfig: "tsconfig.json",
	packages: "external",
	sourcemap: true,
	logLevel: "info",
});
