"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { motion } from "framer-motion";
import { Monitor, Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
	}

	const themes = [
		{ label: "light theme", value: "light", icon: Sun },
		{ label: "dark theme", value: "dark", icon: Moon },
		{ label: "system theme", value: "system", icon: Monitor },
	] as const;

	function getXPosition(themeValue?: string) {
		switch (themeValue) {
			case "light":
				return 0;
			case "dark":
				return "105%";
			case "system":
				return "210%";
			default:
				return 0;
		}
	}

	return (
		<div className="relative flex w-36 rounded-xl bg-gray-100 p-1 dark:bg-gray-700">
			<motion.div
				className="absolute inset-y-1 rounded-lg bg-white shadow-sm dark:bg-gray-600"
				initial={false}
				animate={{
					x: getXPosition(theme),
				}}
				transition={{ type: "spring", stiffness: 400, damping: 35 }}
				style={{ width: "30%" }}
			/>

			{themes.map(({ value, label, icon: Icon }) => (
				<button
					key={value}
					onClick={() => setTheme(value)}
					aria-label={label}
					className={cn(
						`relative z-10 flex flex-1 items-center justify-center py-1.5 transition-colors`,
						theme === value
							? "text-orange-600 dark:text-orange-400"
							: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200",
					)}
				>
					<Icon className="size-4" />
				</button>
			))}
		</div>
	);
}
