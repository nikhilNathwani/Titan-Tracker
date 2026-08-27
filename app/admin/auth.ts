// Password gate for the admin portal.
//
// Threat model: keep casual visitors from stumbling onto the form and editing
// data. It is NOT meant to withstand a determined attacker. Every mutating
// action re-checks the session server-side (see actions.ts) so the gate cannot
// be bypassed by poking at the client.
//
// The password lives in the ADMIN_PASSWORD env var (never in source — this repo
// is public). Set it in .env.local locally and in the Vercel project settings
// for production.

import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "tt_admin";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const SESSION_VERSION = "v1";

function secret(): string {
	const value = process.env.ADMIN_PASSWORD;
	if (!value) {
		throw new Error(
			"ADMIN_PASSWORD is not set. Add it to .env.local (local) and the " +
				"Vercel project environment variables (production).",
		);
	}
	return value;
}

function sign(expiresAt: string): string {
	return crypto
		.createHmac("sha256", secret())
		.update(`${SESSION_VERSION}:${expiresAt}`)
		.digest("hex");
}

function constantTimeEquals(a: string, b: string): boolean {
	const ab = Buffer.from(a);
	const bb = Buffer.from(b);
	return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/** Constant-time comparison of a submitted password against ADMIN_PASSWORD. */
export function passwordIsCorrect(submitted: string): boolean {
	try {
		return constantTimeEquals(submitted, secret());
	} catch {
		return false;
	}
}

/** True when the current request carries a valid, unexpired session cookie. */
export function isAuthenticated(): boolean {
	const raw = cookies().get(COOKIE_NAME)?.value;
	if (!raw) return false;

	const [expiresAt, signature] = raw.split(".");
	const expiryMs = Number(expiresAt);
	if (!Number.isFinite(expiryMs) || Date.now() > expiryMs) return false;

	try {
		return constantTimeEquals(signature ?? "", sign(expiresAt));
	} catch {
		return false;
	}
}

/** Issue a fresh session cookie. Only valid inside a Server Action / Route Handler. */
export function startSession(): void {
	const expiresAt = String(Date.now() + SESSION_TTL_MS);
	cookies().set(COOKIE_NAME, `${expiresAt}.${sign(expiresAt)}`, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		path: "/admin",
		maxAge: Math.floor(SESSION_TTL_MS / 1000),
	});
}

/** Clear the session cookie. Only valid inside a Server Action / Route Handler. */
export function endSession(): void {
	cookies().delete({ name: COOKIE_NAME, path: "/admin" });
}
