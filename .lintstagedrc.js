// eslint-disable-next-line import/no-anonymous-default-export
export default {
	"*.{js,ts,jsx,tsx}": ["pnpm exec eslint --fix", "pnpm exec prettier --write"],
	"*.{json,css,scss,md}": ["pnpm exec prettier --write"],
};
