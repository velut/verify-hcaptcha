/**
A fully typed library to verify hCaptcha.com tokens submitted by users when solving captcha challenges.

@remarks
Note: this is an unofficial library; we are not affiliated with hCaptcha.com.

@example
Verify a token submitted by a user:

```typescript
import { verifyHcaptchaToken } from 'verify-hcaptcha';

const result = await verifyHcaptchaToken({
	token: "USER-SUBMITTED-RESPONSE-TOKEN",
	secretKey: "YOUR-SECRET-KEY",
	siteKey: "YOUR-SITE-KEY",
});

if (result.success) {
	console.log("User is human");
} else {
	console.log("User is robot");
}
```

@packageDocumentation
*/

import { z } from "zod";

const hCaptchaResponseSchema = z
	.object({
		success: z.boolean(),
		challenge_ts: z.string().optional(),
		hostname: z.string().optional(),
		credit: z.boolean().optional(),
		"error-codes": z
			.array(
				z.union([
					/** Secret key is missing. */
					z.literal("missing-input-secret"),
					/** Secret key is invalid. */
					z.literal("invalid-input-secret"),
					/** User response token is missing. */
					z.literal("missing-input-response"),
					/** User response token is invalid. */
					z.literal("invalid-input-response"),
					/** Site key is invalid. */
					z.literal("invalid-sitekey"),
					/** Remote user IP is missing. */
					z.literal("missing-remoteip"),
					/** Remote user IP is invalid. */
					z.literal("invalid-remoteip"),
					/** Request is invalid. */
					z.literal("bad-request"),
					/** User response token is invalid or has already been checked. */
					z.literal("invalid-or-already-seen-response"),
					/** Must use the test site key when using a test verification token. */
					z.literal("not-using-dummy-passcode"),
					/** Must use the test secret key when using a test verification token. */
					z.literal("not-using-dummy-secret"),
					/** The site key is not associated to the secret key. */
					z.literal("sitekey-secret-mismatch"),
				]),
			)
			.optional(),
		score: z.number().optional(),
		"score-reason": z.array(z.string()).optional(),
	})
	.transform(({ success, hostname, credit, score, ...rest }) => ({
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
	}));

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
