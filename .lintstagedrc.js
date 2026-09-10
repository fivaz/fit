export default {
	"apps/web/**/*.{js,ts,jsx,tsx}": [
		"pnpm --filter @fit/web exec eslint --fix",
		"pnpm exec prettier --write",
	],
	"apps/api/**/*.{js,ts}": ["pnpm --filter @fit/api exec eslint --fix", "pnpm exec prettier --write"],
	"packages/shared/**/*.ts": ["pnpm exec prettier --write"],
	"*.{js,ts,jsx,tsx}": ["pnpm exec prettier --write"],
	"*.{json,css,scss,md}": ["pnpm exec prettier --write"],
};
