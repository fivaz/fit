import type { CapacitorConfig } from "@capacitor/cli";

import "dotenv/config";

const tunnelUrl = process.env.CAPACITOR_SERVER_URL?.trim();

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
			resize: "body",
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
