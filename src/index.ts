import * as https from "https";

/**
 * This package provides a way to verify on the server
 * the hCaptcha tokens obtained from captcha challenges solved by users.
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

  /** Optional: timestamp of the challenge */
  readonly challengeTimestamp?: Date;

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
export enum HcaptchaError {
  /** Secret key is missing */
  MissingInputSecret = "missing-input-secret",
  /** Secret key is invalid */
  InvalidInputSecret = "invalid-input-secret",
  /** Verification token is missing */
  MissingInputResponse = "missing-input-response",
  /** Verification token is invalid */
  InvalidInputResponse = "invalid-input-response",
  /** Request is invalid */
  BadRequest = "bad-request",
  /** Verification token is invalid or has already been checked */
  InvalidOrAlreadySeenResponse = "invalid-or-already-seen-response",
  /** The test site key should be used with a test verification token */
  NotUsingDummyPassCode = "not-using-dummy-passcode",
  /** The site key is not associated to the secret key */
  SiteKeySecretMismatch = "sitekey-secret-mismatch",
}

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
    challenge_ts,
    hostname,
    credit,
    "error-codes": rawErrorCodes,
    score,
    score_reason: rawScoreReason,
  } = await rawVerifyHcaptchaToken({
    token,
    secretKey,
    siteKey,
    remoteIp,
  });

  challenge_ts as unknown;
  rawErrorCodes as unknown;

  return {
    success,
    challengeTimestamp: new Date(),
    hostname,
    credit,
    errorCodes: [],
    score,
    scoreReasons: rawScoreReason,
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
  token: string;
  secretKey: string;
  siteKey?: string;
  remoteIp?: string;
}): string {
  const form = new URLSearchParams();
  form.append("response", token);
  form.append("secret", secretKey);

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
    const req = https.request(options, (res) => {
      const chunks: string[] = [];
      res.setEncoding("utf-8");
      res
        .on("error", (err) => {
          reject(err);
        })
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
