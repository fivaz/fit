import "./globals.css";

import { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { ConfirmProvider } from "@/hooks/confirm/confirm-provider";
import { APP_NAME } from "@/lib/consts";
import { CapacitorSplashDismiss } from "@/lib/mobile/capacitor-splash-dismiss";
import { cn } from "@/lib/utils";

const APP_DEFAULT_TITLE = APP_NAME;
const APP_TITLE_TEMPLATE = `%s - ${APP_NAME}`;
const APP_DESCRIPTION = "Track your workouts and monitor your progress.";

export const metadata: Metadata = {
	applicationName: APP_NAME,
	title: {
		default: APP_DEFAULT_TITLE,
		template: APP_TITLE_TEMPLATE,
	},
	description: APP_DESCRIPTION,
	generator: "Next.js",
	manifest: "/manifest.json",
	keywords: ["nextjs", "next14", "pwa", "next-pwa"],
	icons: [
		{ rel: "icon", url: "/pwa-64x64.png", sizes: "64x64" },
		{ rel: "icon", url: "/pwa-192x192.png", sizes: "192x192" },
		{ rel: "icon", url: "/pwa-512x512.png", sizes: "512x512" },
		{ rel: "apple-touch-icon", url: "/pwa-192x192.png" },
	],
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: APP_DEFAULT_TITLE,
	},
	formatDetection: {
		telephone: false,
	},
	openGraph: {
		type: "website",
		siteName: APP_NAME,
		title: {
			default: APP_DEFAULT_TITLE,
			template: APP_TITLE_TEMPLATE,
		},
		description: APP_DESCRIPTION,
	},
	twitter: {
		card: "summary",
		title: {
			default: APP_DEFAULT_TITLE,
			template: APP_TITLE_TEMPLATE,
		},
		description: APP_DESCRIPTION,
	},
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "oklch(85.2% 0.199 91.936)" },
		{ media: "(prefers-color-scheme: dark)", color: "oklch(82.8% 0.189 84.429)" },
	],
};

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={cn(geistSans.variable, geistMono.variable, "antialiased")}>
				<CapacitorSplashDismiss />
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<ConfirmProvider>
						<div className="mx-auto min-h-svh max-w-md border bg-gray-50 dark:bg-gray-900">
							{/* Main Content Area */}
							<div className="absolute right-0 p-5">
								<ModeToggle />
							</div>
							{children}
						</div>
					</ConfirmProvider>
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
