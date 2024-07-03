import { expect, test } from "vitest";
import { verifyHcaptchaToken } from "./index";

// See https://docs.hcaptcha.com/#integration-testing-test-keys
const publisherSiteKey = "10000000-ffff-ffff-ffff-000000000001";
const publisherSecretKey = "0x0000000000000000000000000000000000000000";
const publisherResponse = "10000000-aaaa-bbbb-cccc-000000000001";
const enterpriseSafeSiteKey = "20000000-ffff-ffff-ffff-000000000002";
const enterpriseSafeSecretKey = "0x0000000000000000000000000000000000000000";
const enterpriseSafeResponse = "20000000-aaaa-bbbb-cccc-000000000002";
const enterpriseBotSiteKey = "30000000-ffff-ffff-ffff-000000000003";
const enterpriseBotSecretKey = "0x0000000000000000000000000000000000000000";
const enterpriseBotResponse = "30000000-aaaa-bbbb-cccc-000000000003";

test("no data", async () => {
	const res = await verifyHcaptchaToken({} as any);
	expect(res).toMatchInlineSnapshot(`
		{
		  "challengeTimestamp": undefined,
		  "credit": undefined,
		  "errorCodes": [
		    "invalid-input-response",
		  ],
		  "hostname": undefined,
		  "score": undefined,
		  "scoreReasons": undefined,
		  "success": false,
		}
	`);
});

test("no token", async () => {
	const res = await verifyHcaptchaToken({
		secretKey: publisherSecretKey,
	} as any);
	expect(res).toMatchInlineSnapshot(`
		{
		  "challengeTimestamp": undefined,
		  "credit": undefined,
		  "errorCodes": [
		    "invalid-input-response",
		  ],
		  "hostname": undefined,
		  "score": undefined,
		  "scoreReasons": undefined,
		  "success": false,
		}
	`);
});

test("invalid token and secret key", async () => {
	const res = await verifyHcaptchaToken({
		secretKey: "invalid",
		token: "invalid",
	} as any);
	expect(res).toMatchInlineSnapshot(`
		{
		  "challengeTimestamp": undefined,
		  "credit": undefined,
		  "errorCodes": [
		    "invalid-input-response",
		  ],
		  "hostname": undefined,
		  "score": undefined,
		  "scoreReasons": undefined,
		  "success": false,
		}
	`);
});

test("invalid secret key", async () => {
	const res = await verifyHcaptchaToken({
		secretKey: "not-the-dummy-secret",
		token: publisherResponse,
	});
	expect(res).toMatchInlineSnapshot(
		{
			challengeTimestamp: expect.any(String),
		},
		`
		{
		  "challengeTimestamp": Any<String>,
		  "credit": false,
		  "errorCodes": [
		    "not-using-dummy-secret",
		  ],
		  "hostname": "dummy-key-pass",
		  "score": undefined,
		  "scoreReasons": undefined,
		  "success": false,
		}
	`,
	);
});

test("invalid site key", async () => {
	const res = await verifyHcaptchaToken({
		secretKey: publisherSecretKey,
		token: publisherResponse,
		siteKey: "invalid",
	});
	expect(res).toMatchInlineSnapshot(`
		{
		  "challengeTimestamp": undefined,
		  "credit": undefined,
		  "errorCodes": [
		    "invalid-sitekey",
		  ],
		  "hostname": undefined,
		  "score": undefined,
		  "scoreReasons": undefined,
		  "success": false,
		}
	`);
});

test("invalid remote IP", async () => {
	const res = await verifyHcaptchaToken({
		secretKey: publisherSecretKey,
		token: publisherResponse,
		siteKey: publisherSiteKey,
		remoteIp: "invalid",
	});
	expect(res).toMatchInlineSnapshot(`
		{
		  "challengeTimestamp": undefined,
		  "credit": undefined,
		  "errorCodes": [
		    "invalid-remoteip",
		  ],
		  "hostname": undefined,
		  "score": undefined,
		  "scoreReasons": undefined,
		  "success": false,
		}
	`);
});

test("successful validation", async () => {
	const res = await verifyHcaptchaToken({
		secretKey: publisherSecretKey,
		token: publisherResponse,
		siteKey: publisherSiteKey,
		remoteIp: "0.0.0.0",
	});
	expect(res).toMatchInlineSnapshot(
		{
			challengeTimestamp: expect.any(String),
		},
		`
		{
		  "challengeTimestamp": Any<String>,
		  "credit": false,
		  "errorCodes": undefined,
		  "hostname": "dummy-key-pass",
		  "score": undefined,
		  "scoreReasons": undefined,
		  "success": true,
		}
	`,
	);
});

test("successful enterprise safe validation", async () => {
	const res = await verifyHcaptchaToken({
		secretKey: enterpriseSafeSecretKey,
		token: enterpriseSafeResponse,
		siteKey: enterpriseSafeSiteKey,
		remoteIp: "0.0.0.0",
	});
	expect(res).toMatchInlineSnapshot(
		{
			challengeTimestamp: expect.any(String),
		},
		`
		{
		  "challengeTimestamp": Any<String>,
		  "credit": undefined,
		  "errorCodes": undefined,
		  "hostname": "dummy-key-pass",
		  "score": 0,
		  "scoreReasons": undefined,
		  "success": true,
		}
	`,
	);
});

test("successful enterprise bot validation", async () => {
	const res = await verifyHcaptchaToken({
		secretKey: enterpriseBotSecretKey,
		token: enterpriseBotResponse,
		siteKey: enterpriseBotSiteKey,
		remoteIp: "0.0.0.0",
	});
	expect(res).toMatchInlineSnapshot(
		{
			challengeTimestamp: expect.any(String),
		},
		`
		{
		  "challengeTimestamp": Any<String>,
		  "credit": undefined,
		  "errorCodes": undefined,
		  "hostname": "dummy-key-pass",
		  "score": 1,
		  "scoreReasons": undefined,
		  "success": true,
		}
	`,
	);
});
