import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import storybook from "eslint-plugin-storybook";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = defineConfig(
	[
		...nextVitals,
		...nextTs,
		prettier,
		...storybook.configs["flat/recommended"],
		globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
	],
	{
		plugins: {
			"unused-imports": unusedImports,
			"simple-import-sort": simpleImportSort,
		},
		rules: {
			"@typescript-eslint/no-empty-object-type": "warn",

			// --- Unused Imports Logic ---
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": "off",
			"unused-imports/no-unused-imports": "error",
			"unused-imports/no-unused-vars": [
				"warn",
				{
					vars: "all",
					varsIgnorePattern: "^_",
					args: "after-used",
					argsIgnorePattern: "^_",
				},
			],

			// --- Custom Import Sorting ---
			"simple-import-sort/imports": [
				"error",
				{
					groups: [
						// 1. Style imports (Moved to top as requested)
						["^.+\\.s?css$"],
						// 2. Packages: react and next related packages
						["^react", "^next"],
						// 3. Other external packages
						["^@?\\w"],
						// 4. Internal aliases (@/)
						["^@/"],
						// 5. Side effect imports
						["^\\u0000"],
						// 6. Parent and relative imports
						["^\\.\\.(?!/?$)", "^\\.\\./?$", "^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
					],
				},
			],
			"simple-import-sort/exports": "error",
			"react/no-unescaped-entities": "off",
		},
	},
);

export default eslintConfig;
