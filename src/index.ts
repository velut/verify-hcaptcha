/**
A fully typed library to verify hCaptcha.com tokens submitted by users when solving captcha challenges.

@remarks
Note: this is an unofficial library; we are not affiliated with hCaptcha.com.

@example
Verify a token submitted by a user:

```typescript
import { verifyHcaptchaToken } from 'verify-hcaptcha';

const result = await verifyHcaptchaToken({
	token: "USER-SUBMITTED-RESPONSE-TOKEN", // Required
	secretKey: "YOUR-SECRET-KEY",           // Required
	siteKey: "YOUR-SITE-KEY",               // Optional
	remoteIp: "USER-IP-ADDRESS",            // Optional
});

if (result.success) {
	console.log("User is human");
} else {
	console.log("User is robot");
}
```

@packageDocumentation
*/

import * as z from "zod/mini";

export type ErrorCodes =
	/** Secret key is missing. */
	| "missing-input-secret"
	/** Secret key is invalid. */
	| "invalid-input-secret"
	/** User response token is missing. */
	| "missing-input-response"
	/** User response token is invalid. */
	| "invalid-input-response"
	/** User response token is expired. */
	| "expired-input-response"
	/** User response token was already verified once. */
	| "already-seen-response"
	/** Request is invalid. */
	| "bad-request"
	/** Remote user IP is missing. */
	| "missing-remoteip"
	/** Remote user IP is invalid. */
	| "invalid-remoteip"
	/** Must use the test site key when using a test verification token. */
	| "not-using-dummy-passcode"
	/** The site key is not associated to the secret key. */
	| "sitekey-secret-mismatch"
	/** Site key is invalid (Not listed on hcaptcha docs). */
	| "invalid-sitekey"
	/** Must use the test secret key when using a test verification token (Not listed on hcaptcha docs). */
	| "not-using-dummy-secret";

const rawHcaptchaResponseSchema = z.object({
	success: z.boolean(),
	challenge_ts: z.optional(z.string()),
	hostname: z.optional(z.string()),
	credit: z.optional(z.boolean()),
	// See https://github.com/colinhacks/zod/discussions/4934 and https://github.com/colinhacks/zod/discussions/4939.
	"error-codes": z.optional(z.array(z.string() as z.ZodMiniType<ErrorCodes | (string & {})>)),
	score: z.optional(z.number()),
	"score-reason": z.optional(z.array(z.string())),
});

const hCaptchaResponseSchema = z.pipe(
	rawHcaptchaResponseSchema,
	z.transform(({ success, hostname, credit, score, ...rest }) => ({
		/** True if the token is valid and meets the specified security criteria (e.g., if the site key is associated to the secret key). */
		success,

		/** UTC timestamp of the challenge in ISO 8601 format (e.g., `2021-10-02T18:12:10.149Z`). */
		challengeTimestamp: rest.challenge_ts,

		/** Hostname of the website where the challenge was solved. */
		hostname,

		/** True if the response will be credited. @deprecated */
		credit,

		/** Error codes. @see {@link https://docs.hcaptcha.com/#siteverify-error-codes-table} */
		errorCodes: rest["error-codes"],

		/** Enterprise-only feature: score for malicious activity. */
		score,

		/** Enterprise-only feature: list of reasons for the malicious activity score. */
		scoreReasons: rest["score-reason"],
	})),
);

/**
`HcaptchaResponse` represents the response to the verification challenge performed by calling {@link verifyHcaptchaToken}.
@see {@link https://docs.hcaptcha.com/#verify-the-user-response-server-side}
*/
export type HcaptchaResponse = z.infer<typeof hCaptchaResponseSchema>;

/**
`verifyHcaptchaToken` verifies with the hCaptcha.com API that the response token obtained
from a user who solved a captcha challenge is valid.

@param token - required: the token obtained from the user who solved the captcha challenge
@param secretKey - required: the secret key for your account
@param siteKey - optional but recommended: the site key for the website hosting the captcha challenge
@param remoteIp - optional: the IP address of the user who solved the challenge

@returns a {@link HcaptchaResponse} with the verification result
*/
export async function verifyHcaptchaToken({
	token,
	secretKey,
	siteKey,
	remoteIp,
}: {
	token: string;
	secretKey: string;
	siteKey?: string;
	remoteIp?: string;
}): Promise<HcaptchaResponse> {
	const form = new URLSearchParams();
	form.append("response", token);
	form.append("secret", secretKey);
	if (siteKey) form.append("sitekey", siteKey);
	if (remoteIp) form.append("remoteip", remoteIp);
	const response = await fetch("https://api.hcaptcha.com/siteverify", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: form.toString(),
	});
	const json = await response.json();
	return hCaptchaResponseSchema.parse(json);
}
