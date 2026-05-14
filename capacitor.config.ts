import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
	appId: "com.fivaz.fittracker",
	appName: "Fit Tracker",
	webDir: ".next-static",
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
