import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier/flat";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

export default defineConfig(
	js.configs.recommended,
	...tseslint.configs.recommended,
	prettier,
	globalIgnores(["dist/**", "src/generated/**"]),
	{
		plugins: {
			"unused-imports": unusedImports,
			"simple-import-sort": simpleImportSort,
		},
		rules: {
			"@typescript-eslint/no-empty-object-type": "warn",
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
			"simple-import-sort/imports": [
				"error",
				{
					groups: [
						["^\\u0000"],
						["^node:"],
						["^@nestjs", "^@?\\w"],
						["^@/"],
						["^\\.\\.(?!/?$)", "^\\.\\./?$", "^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
					],
				},
			],
			"simple-import-sort/exports": "error",
		},
	},
);
