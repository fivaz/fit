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
	webDir: "out",
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
		SocialLogin: {
			// Only bundle the SDKs we actually use (keeps the Facebook SDK and its privacy footprint out).
			providers: {
				google: true,
				apple: true,
				facebook: false,
				twitter: false,
			},
		},
	},
};

export default config;
