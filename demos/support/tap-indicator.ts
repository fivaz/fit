import type { Page } from "@playwright/test";

const TAP_INDICATOR_SCRIPT = `
(() => {
	const RIPPLE_MS = 550;
	const style = document.createElement("style");
	style.textContent = \`
		@keyframes demo-tap { from { transform: translate(-50%, -50%) scale(0.4); opacity: 0.85; }
			to { transform: translate(-50%, -50%) scale(1.5); opacity: 0; } }
		.demo-tap { position: fixed; z-index: 2147483647; width: 44px; height: 44px; border-radius: 9999px;
			pointer-events: none; background: rgba(249, 115, 22, 0.35); border: 2px solid rgba(249, 115, 22, 0.9);
			animation: demo-tap \${RIPPLE_MS}ms ease-out forwards; }
		nextjs-portal { display: none !important; }
	\`;
	const install = () => document.documentElement.appendChild(style);
	if (document.documentElement) install();
	else document.addEventListener("DOMContentLoaded", install);

	window.addEventListener("pointerdown", (event) => {
		const dot = document.createElement("div");
		dot.className = "demo-tap";
		dot.style.left = event.clientX + "px";
		dot.style.top = event.clientY + "px";
		document.documentElement.appendChild(dot);
		setTimeout(() => dot.remove(), RIPPLE_MS);
	}, true);
})();
`;

/**
 * Playwright doesn't render touches, so draw a fading circle at each pointer-down. The same script
 * hides the Next.js dev indicator (a <nextjs-portal> element) so dev-only chrome stays out of clips.
 */
export async function installDemoOverlays(page: Page): Promise<void> {
	await page.addInitScript(TAP_INDICATOR_SCRIPT);
}
