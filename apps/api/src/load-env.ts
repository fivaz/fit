import path from "node:path";
import { fileURLToPath } from "node:url";

import { config as loadEnv } from "dotenv";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

// Load .env files if they exist (local development)
// In production (Azure), secrets come from Key Vault via environment variables
loadEnv({ path: path.join(repoRoot, ".env"), override: false });
loadEnv({ path: path.join(repoRoot, ".env.local"), override: false });
