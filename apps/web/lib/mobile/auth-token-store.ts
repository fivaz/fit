"use client";

import { KeychainAccess, SecureStorage } from "@aparajita/capacitor-secure-storage";

import { isNativeMobileRuntime } from "@/lib/mobile/runtime";

const MOBILE_AUTH_TOKEN_KEY = "fit.mobile.auth.bearer-token";

let memoryToken: string | null = null;
let hydrated = false;
/** Consumed on the next bearer token persist after sign-in / sign-up. */
let pendingRememberMe = true;

function canUseStorage() {
	return typeof window !== "undefined";
}

export function setAuthTokenRememberMe(rememberMe: boolean) {
	pendingRememberMe = rememberMe;
}

export function consumeAuthTokenRememberMe() {
	const rememberMe = pendingRememberMe;
	pendingRememberMe = true;
	return rememberMe;
}

async function readFromPersistentStorage() {
	if (!canUseStorage()) return null;

	if (isNativeMobileRuntime()) {
		return SecureStorage.getItem(MOBILE_AUTH_TOKEN_KEY);
	}

	return window.localStorage.getItem(MOBILE_AUTH_TOKEN_KEY);
}

async function readFromSessionStorage() {
	if (!canUseStorage()) return null;
	return window.sessionStorage.getItem(MOBILE_AUTH_TOKEN_KEY);
}

async function writeToPersistentStorage(token: string) {
	if (!canUseStorage()) return;

	if (isNativeMobileRuntime()) {
		await SecureStorage.setDefaultKeychainAccess(KeychainAccess.whenUnlockedThisDeviceOnly);
		await SecureStorage.setItem(MOBILE_AUTH_TOKEN_KEY, token);
		return;
	}

	window.localStorage.setItem(MOBILE_AUTH_TOKEN_KEY, token);
}

async function writeToSessionStorage(token: string) {
	if (!canUseStorage()) return;
	window.sessionStorage.setItem(MOBILE_AUTH_TOKEN_KEY, token);
}

async function clearPersistentStorage() {
	if (!canUseStorage()) return;

	if (isNativeMobileRuntime()) {
		await SecureStorage.removeItem(MOBILE_AUTH_TOKEN_KEY);
		return;
	}

	window.localStorage.removeItem(MOBILE_AUTH_TOKEN_KEY);
}

async function clearSessionStorage() {
	if (!canUseStorage()) return;
	window.sessionStorage.removeItem(MOBILE_AUTH_TOKEN_KEY);
}

export async function hydrateMobileAuthToken() {
	if (hydrated) return memoryToken;

	try {
		memoryToken = (await readFromSessionStorage()) ?? (await readFromPersistentStorage());
	} finally {
		hydrated = true;
	}

	return memoryToken;
}

export function getMobileAuthTokenSync() {
	return memoryToken;
}

export async function persistMobileAuthToken(token: string, rememberMe = true) {
	memoryToken = token;
	hydrated = true;

	if (rememberMe) {
		await clearSessionStorage();
		await writeToPersistentStorage(token);
		return;
	}

	await clearPersistentStorage();
	await writeToSessionStorage(token);
}

export async function clearMobileAuthToken() {
	await clearPersistentStorage();
	await clearSessionStorage();
	memoryToken = null;
	hydrated = true;
}
