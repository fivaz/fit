import path from "node:path";

import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv({ path: path.resolve(import.meta.dirname, "../../.env") });
loadEnv({ path: path.resolve(import.meta.dirname, "../../.env.local") });

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
		seed: "tsx ./src/prisma/seed.ts",
	},
	datasource: {
		url: process.env["DATABASE_URL"],
	},
});
