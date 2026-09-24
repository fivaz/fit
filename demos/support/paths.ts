import path from "node:path";

export const RAW_DIR = path.join(process.cwd(), "demo-output", "raw");
export const DEMO_STATE_FILE = "demo-output/.demo-state.json";
export const STORAGE_STATE_FILE = "demo-output/.demo-storage-state.json";

/** Recording size = 2x the CSS viewport (393x659), even dimensions for H.264. */
export const VIDEO_SIZE = { width: 786, height: 1318 };

export function rawClipPath(clipName: string): string {
	return path.join(RAW_DIR, `${clipName}.webm`);
}
