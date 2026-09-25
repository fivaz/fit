/**
 * The AI clip records the real feature: it calls OpenAI and spends one of the demo account's
 * credits. It is on by default; `DEMO_AI=0` opts out. Without an OPENAI_API_KEY it is skipped too.
 */
export function aiClipSkipReason(): string | undefined {
	if (process.env.DEMO_AI === "0") return "DEMO_AI=0 opts out of the AI coach clip.";
	if (!process.env.OPENAI_API_KEY) return "OPENAI_API_KEY is not set.";
	return undefined;
}
