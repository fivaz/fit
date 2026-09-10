"use client";

import { ReactNode } from "react";

import { useSoftwareKeyboardScroll } from "@/hooks/use-software-keyboard-scroll";
import { cn } from "@/lib/utils";

type AuthPageLayoutProps = {
	children: ReactNode;
	className?: string;
};

/**
 * Auth shell: vertically centered when the keyboard is hidden; scrollable with extra
 * bottom room only while the keyboard is open (Capacitor / visualViewport).
 */
export function AuthPageLayout({ children, className }: AuthPageLayoutProps) {
	const { containerRef, keyboardOpen } = useSoftwareKeyboardScroll<HTMLDivElement>({
		resetScrollOnClose: true,
	});

	return (
		<div
			ref={containerRef}
			className={cn(
				"fixed inset-0 z-0 bg-gray-50 dark:bg-gray-900",
				keyboardOpen ? "overflow-y-auto overscroll-y-contain" : "overflow-hidden",
				className,
			)}
		>
			<div
				className={cn(
					"flex min-h-full flex-col px-6 md:px-10",
					keyboardOpen ? "justify-start" : "justify-center",
				)}
				style={{
					paddingTop: "max(1.5rem, env(safe-area-inset-top))",
					paddingBottom: keyboardOpen
						? "max(45vh, 12rem)"
						: "max(1.5rem, env(safe-area-inset-bottom))",
				}}
			>
				<div className="mx-auto w-full max-w-sm">{children}</div>
			</div>
		</div>
	);
}
