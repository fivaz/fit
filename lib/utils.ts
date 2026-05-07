import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export async function devDelay(ms: number = 0) {
	if (process.env.NODE_ENV === "development") {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

export function sameOrder<T extends { id: string }>(a: T[], b: T[]) {
	if (a.length !== b.length) return false;
	return a.every((item, i) => item.id === b[i]?.id);
}
