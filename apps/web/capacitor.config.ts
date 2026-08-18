import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize } from "@capacitor/keyboard";
import { config as loadEnv } from "dotenv";
import path from "node:path";

import { resolveCapacitorServerUrl } from "./lib/env/mobile-dev-url";

loadEnv({ path: path.resolve(__dirname, "../../.env") });
loadEnv({ path: path.resolve(__dirname, "../../.env.local") });

const tunnelUrl = resolveCapacitorServerUrl();

const config: CapacitorConfig = {
	appId: "com.fivaz.fittracker",
	appName: "Fit Tracker",
	webDir: ".next-static",
	...(tunnelUrl
		? {
				server: {
					url: tunnelUrl,
					cleartext: true,
				},
			}
		: {}),
	plugins: {
		Keyboard: {
			resize: KeyboardResize.Body,
		},
		SplashScreen: {
			backgroundColor: "#ffffff",
			launchAutoHide: true,
			showSpinner: false,
		},
		StatusBar: {
			style: "DEFAULT",
		},
	},
};

export default config;
