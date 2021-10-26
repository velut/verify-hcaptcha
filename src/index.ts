import * as https from "https";

/**
 *
 * A no dependencies, fully typed library to verify hCaptcha tokens
 * submitted by users when solving CAPTCHA challenges.
 *
 * @remarks
 *
 * Note: this is an unofficial library; we are not affiliated with hCaptcha.com
 *
 * @example
 *
 * Verify a token submitted by a user:
 *
 * ```typescript
 * import { verifyHcaptchaToken } from 'verify-hcaptcha';
 *
 * (async () => {
 *     const result = await verifyHcaptchaToken({
 *       token: "USER-SUBMITTED-RESPONSE-TOKEN",
 *       secretKey: "YOUR-SECRET-KEY",
 *       siteKey: "YOUR-SITE-KEY",
 *     });
 *
 *     if (result.success) {
 *       console.log("User is human");
 *     } else {
 *       console.log("User is robot");
 *     }
 * })();
 * ```
 *
 * @example
 *
 * Verify a token submitted by a user and get the raw response from hCaptcha:
 *
 * ```typescript
 * import { rawVerifyHcaptchaToken } from 'verify-hcaptcha';
 *
 * (async () => {
 *     const result = await rawVerifyHcaptchaToken({
 *       token: "USER-SUBMITTED-RESPONSE-TOKEN",
 *       secretKey: "YOUR-SECRET-KEY",
 *       siteKey: "YOUR-SITE-KEY",
 *     });
 *
 *     if (result.success) {
 *       console.log("User is human");
 *     } else {
 *       console.log("User is robot");
 *     }
 * })();
 * ```
 *
 * @packageDocumentation
 */

/**
 * `HcaptchaResponse` represents the response to the verification challenge
 * performed by calling {@link verifyHcaptchaToken}.
 *
 * @see {@link https://docs.hcaptcha.com/#verify-the-user-response-server-side}
 */
export interface HcaptchaResponse {
  /**
   * True if the token is valid and meets the specified security criteria
   * (for example, if the site key is associated to the secret key)
   */
  readonly success: boolean;

  /**
   * Optional: UTC timestamp of the challenge in ISO 8601 format
   * (for example, `2021-10-02T18:12:10.149Z`)
   */
  readonly challengeTimestamp?: string;

  /** Optional: hostname of the website where the challenge was solved */
  readonly hostname?: string;

  /** Optional: true if the response will be credited */
  readonly credit?: boolean;

  /**
   * Optional: list of error codes
   *
   * @see {@link HcaptchaError}
   */
  readonly errorCodes?: HcaptchaError[];

  /** Enterprise-only feature: score for malicious activity */
  readonly score?: number;

  /** Enterprise-only feature: list of reasons for the malicious activity score */
  readonly scoreReasons?: string[];
}

/**
 * `HcaptchaError` collects the errors explaining why a verification challenge failed.
 *
 * @see {@link HcaptchaResponse}
 * @see {@link https://docs.hcaptcha.com/#siteverify-error-codes-table}
 */
export type HcaptchaError =
  /** Secret key is missing */
  | "missing-input-secret"
  /** Secret key is invalid */
  | "invalid-input-secret"
  /** User response token is missing */
  | "missing-input-response"
  /** User response token is invalid */
  | "invalid-input-response"
  /** Site key is invalid */
  | "invalid-sitekey"
  /** Remote user IP is invalid */
  | "invalid-remoteip"
  /** Request is invalid */
  | "bad-request"
  /** User response token is invalid or has already been checked */
  | "invalid-or-already-seen-response"
  /** Must use the test site key when using a test verification token */
  | "not-using-dummy-passcode"
  /** Must use the test secret key when using a test verification token */
  | "not-using-dummy-secret"
  /** The site key is not associated to the secret key */
  | "sitekey-secret-mismatch";

/**
 * `RawHcaptchaResponse` represents the raw response to the verification challenge
 * obtained by directly calling the hCaptcha API endpoint
 * with {@link rawVerifyHcaptchaToken}.
 *
 * @see {@link https://docs.hcaptcha.com/#verify-the-user-response-server-side}
 */
export interface RawHcaptchaResponse {
  readonly success: boolean;
  readonly challenge_ts?: string;
  readonly hostname?: string;
  readonly credit?: boolean;
  readonly "error-codes"?: string[];
  readonly score?: number;
  readonly score_reason?: string[];
}

/**
 * `verifyHcaptchaToken` verifies with the hCaptcha API that the response token
 * obtained from a captcha challenge is valid.
 *
 * @param token - required: the token obtained from a user with a captcha challenge
 * @param secretKey - required: the secret key for your account
 * @param siteKey - optional but recommended: the site key for the website hosting the captcha challenge
 * @param remoteIp - optional: the IP address of the user submitting the challenge
 *
 * @returns a {@link HcaptchaResponse} with the verification result
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
  const {
    success,
    challenge_ts: challengeTimestamp,
    hostname,
    credit,
    "error-codes": rawErrorCodes,
    score,
    score_reason: scoreReasons,
  } = await rawVerifyHcaptchaToken({
    token,
    secretKey,
    siteKey,
    remoteIp,
  });

  return {
    success,
    challengeTimestamp,
    hostname,
    credit,
    errorCodes: rawErrorCodes as HcaptchaError[] | undefined,
    score,
    scoreReasons,
  };
}

/**
 * `rawVerifyHcaptchaToken` verifies with the hCaptcha API that the response token
 * obtained from a captcha challenge is valid and returns the raw hCaptcha response.
 *
 * @param token - required: the token obtained from a user with a captcha challenge
 * @param secretKey - required: the secret key for your account
 * @param siteKey - optional but recommended: the site key for the website hosting the captcha challenge
 * @param remoteIp - optional: the IP address of the user submitting the challenge
 *
 * @returns a {@link RawHcaptchaResponse} with the verification result
 */
export async function rawVerifyHcaptchaToken({
  token,
  secretKey,
  siteKey,
  remoteIp,
}: {
  token: string;
  secretKey: string;
  siteKey?: string;
  remoteIp?: string;
}): Promise<RawHcaptchaResponse> {
  const form = buildForm({ token, secretKey, siteKey, remoteIp });
  const data = await postToHcaptcha({ form });
  return data;
}

function buildForm({
  token,
  secretKey,
  siteKey,
  remoteIp,
}: {
  token?: string;
  secretKey?: string;
  siteKey?: string;
  remoteIp?: string;
}): string {
  const form = new URLSearchParams();
  if (token) {
    form.append("response", token);
  }

  if (secretKey) {
    form.append("secret", secretKey);
  }

  if (siteKey) {
    form.append("sitekey", siteKey);
  }

  if (remoteIp) {
    form.append("remoteip", remoteIp);
  }

  return form.toString();
}

function postToHcaptcha({
  form,
}: {
  form: string;
}): Promise<RawHcaptchaResponse> {
  const options: https.RequestOptions = {
    host: "hcaptcha.com",
    path: "/siteverify",
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(form),
    },
  };

  return new Promise((resolve, reject) => {
    // See https://nodejs.org/api/http.html#http_class_http_clientrequest
    const req = https.request(options, (res) => {
      const chunks: string[] = [];
      res.setEncoding("utf-8");
      res
        .on("data", (data) => {
          chunks.push(data);
        })
        .on("end", () => {
          const data = JSON.parse(chunks.join("")) as RawHcaptchaResponse;
          resolve(data);
        });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.write(form);
    req.end();
  });
}
