import path from "node:path";

export const RAW_DIR = path.join(process.cwd(), "demo-output", "raw");
export const DEMO_STATE_FILE = "demo-output/.demo-state.json";
export const STORAGE_STATE_FILE = "demo-output/.demo-storage-state.json";

/** iPhone 15 Pro: full screen in CSS px (the app runs full-screen, not inside Safari's toolbars). */
export const IPHONE_SCREEN = { width: 393, height: 852 };
export const DEMO_COLOR_SCHEME = "dark";
/** iPhone 15 Pro safe-area insets in portrait (status bar / Dynamic Island, home indicator). */
export const SAFE_AREA_INSETS = { top: 59, bottom: 34, left: 0, right: 0 };
/**
 * Recording size = the screen in CSS px. Playwright captures frames at CSS-pixel size and doesn't
 * scale them up: a larger size just pins the page top-left on gray padding. demo-convert upscales 2x.
 */
export const VIDEO_SIZE = IPHONE_SCREEN;

export function rawClipPath(clipName: string): string {
	return path.join(RAW_DIR, `${clipName}.webm`);
}

export function cutsPath(clipName: string): string {
	return path.join(RAW_DIR, `${clipName}.cuts.json`);
}
