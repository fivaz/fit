"use client";

import { KeychainAccess, SecureStorage } from "@aparajita/capacitor-secure-storage";

import { isNativeMobileRuntime } from "@/lib/mobile/runtime";

const MOBILE_AUTH_TOKEN_KEY = "fit.mobile.auth.bearer-token";

let memoryToken: string | null = null;
let hydrated = false;

function canUseStorage() {
	return typeof window !== "undefined";
}

async function readFromStorage() {
	if (!canUseStorage()) return null;

	if (isNativeMobileRuntime()) {
		const value = await SecureStorage.getItem(MOBILE_AUTH_TOKEN_KEY);
		return value;
	}

	return window.localStorage.getItem(MOBILE_AUTH_TOKEN_KEY);
}

async function writeToStorage(token: string) {
	if (!canUseStorage()) return;

	if (isNativeMobileRuntime()) {
		await SecureStorage.setDefaultKeychainAccess(KeychainAccess.whenUnlockedThisDeviceOnly);
		await SecureStorage.setItem(MOBILE_AUTH_TOKEN_KEY, token);
		return;
	}

	window.localStorage.setItem(MOBILE_AUTH_TOKEN_KEY, token);
}

async function clearStorage() {
	if (!canUseStorage()) return;

	if (isNativeMobileRuntime()) {
		await SecureStorage.removeItem(MOBILE_AUTH_TOKEN_KEY);
		return;
	}

	window.localStorage.removeItem(MOBILE_AUTH_TOKEN_KEY);
}

export async function hydrateMobileAuthToken() {
	if (hydrated) return memoryToken;

	try {
		memoryToken = await readFromStorage();
	} finally {
		hydrated = true;
	}

	return memoryToken;
}

export function getMobileAuthTokenSync() {
	return memoryToken;
}

export async function persistMobileAuthToken(token: string) {
	await writeToStorage(token);
	memoryToken = token;
	hydrated = true;
}

export async function clearMobileAuthToken() {
	await clearStorage();
	memoryToken = null;
	hydrated = true;
}
