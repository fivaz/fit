"use client";

import { CSSProperties } from "react";
import { useTheme } from "next-themes";

import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

// Keeps toasts below the status bar / Dynamic Island; Sonner's own offset ignores the safe area.
const SAFE_TOP_OFFSET = "calc(env(safe-area-inset-top) + 8px)";

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			position="top-right"
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			offset={{ top: SAFE_TOP_OFFSET }}
			mobileOffset={{ top: SAFE_TOP_OFFSET }}
			icons={{
				success: <CircleCheckIcon className="size-4" />,
				info: <InfoIcon className="size-4" />,
				warning: <TriangleAlertIcon className="size-4" />,
				error: <OctagonXIcon className="size-4" />,
				loading: <Loader2Icon className="size-4 animate-spin" />,
			}}
			style={
				{
					"--normal-bg": "var(--popover)",
					"--normal-text": "var(--popover-foreground)",
					"--normal-border": "var(--border)",
					"--border-radius": "var(--radius)",
				} as CSSProperties
			}
			{...props}
		/>
	);
};

export { Toaster };
