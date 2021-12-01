/** @jest-environment setup-polly-jest/jest-environment-node */
// See https://netflix.github.io/pollyjs/#/test-frameworks/jest-jasmine?id=supported-test-runners

import NodeHttpAdapter from "@pollyjs/adapter-node-http";
import FSPersister from "@pollyjs/persister-fs";
import * as path from "path";
import { setupPolly } from "setup-polly-jest";
import { verifyHcaptchaToken } from "../src";

// See https://github.com/gribnoysup/setup-polly-jest/issues/23#issuecomment-890494186
// Polly.register(NodeHttpAdapter);
// Polly.register(FSPersister);

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

describe("verifyHcaptchaToken", () => {
  setupPolly({
    adapters: [NodeHttpAdapter],
    persister: FSPersister,
    persisterOptions: {
      fs: {
        recordingsDir: path.resolve(__dirname, "./__recordings__"),
      },
    },
    recordFailedRequests: true,
  });

  it("fails when no form data is sent", async () => {
    expect.assertions(3);

    const res = await verifyHcaptchaToken({} as any);
    const { success, errorCodes } = res;

    expect(success).toEqual(false);
    expect(errorCodes).toEqual([
      "missing-input-response",
      "missing-input-secret",
    ]);

    expect(res).toMatchSnapshot();
  });

  it("fails when no token is sent", async () => {
    expect.assertions(3);

    const res = await verifyHcaptchaToken({
      secretKey: publisherSecretKey,
    } as any);
    const { success, errorCodes } = res;

    expect(success).toEqual(false);
    expect(errorCodes).toEqual(["missing-input-response"]);

    expect(res).toMatchSnapshot();
  });

  it("fails when the form data is invalid", async () => {
    expect.assertions(3);

    const res = await verifyHcaptchaToken({
      secretKey: "invalid",
      token: "invalid",
    });
    const { success, errorCodes } = res;

    expect(success).toEqual(false);
    expect(errorCodes).toEqual(["invalid-input-response"]);

    expect(res).toMatchSnapshot();
  });

  it("fails when a test secret key is not used for a test token", async () => {
    expect.assertions(3);

    const res = await verifyHcaptchaToken({
      secretKey: "not-the-dummy-secret",
      token: publisherResponse,
    });
    const { success, errorCodes } = res;

    expect(success).toEqual(false);

    // NOTE: this error is returned by the API
    // but is not documented in the hCaptcha developer docs
    expect(errorCodes).toEqual(["not-using-dummy-secret"]);

    expect(res).toMatchSnapshot({
      challengeTimestamp: expect.any(String),
    });
  });

  it("fails when the site key is invalid", async () => {
    expect.assertions(3);

    const res = await verifyHcaptchaToken({
      secretKey: publisherSecretKey,
      token: publisherResponse,
      siteKey: "invalid",
    });
    const { success, errorCodes } = res;

    expect(success).toEqual(false);

    // NOTE: this error is returned by the API
    // but is not documented in the hCaptcha developer docs
    expect(errorCodes).toEqual(["invalid-sitekey"]);

    expect(res).toMatchSnapshot();
  });

  it("fails when the remote IP is invalid", async () => {
    expect.assertions(3);

    const res = await verifyHcaptchaToken({
      secretKey: publisherSecretKey,
      token: publisherResponse,
      siteKey: publisherSiteKey,
      remoteIp: "invalid",
    });
    const { success, errorCodes } = res;

    expect(success).toEqual(false);

    // NOTE: this error is returned by the API
    // but is not documented in the hCaptcha developer docs
    expect(errorCodes).toEqual(["invalid-remoteip"]);

    expect(res).toMatchSnapshot();
  });

  it("succeeds with valid form data for the test publisher", async () => {
    expect.assertions(2);

    const res = await verifyHcaptchaToken({
      secretKey: publisherSecretKey,
      token: publisherResponse,
      siteKey: publisherSiteKey,
      remoteIp: "0.0.0.0",
    });
    const { success } = res;

    expect(success).toEqual(true);

    expect(res).toMatchSnapshot({
      challengeTimestamp: expect.any(String),
    });
  });

  it("succeeds with valid form data for the enterprise safe user", async () => {
    expect.assertions(4);

    const res = await verifyHcaptchaToken({
      secretKey: enterpriseSafeSecretKey,
      token: enterpriseSafeResponse,
      siteKey: enterpriseSafeSiteKey,
      remoteIp: "0.0.0.0",
    });
    const { success, score, scoreReasons } = res;

    expect(success).toEqual(true);
    expect(score).toEqual(0);
    expect(scoreReasons).toEqual(["safe"]);

    expect(res).toMatchSnapshot({
      challengeTimestamp: expect.any(String),
    });
  });

  it("succeeds with valid form data for the enterprise bot user", async () => {
    expect.assertions(4);

    const res = await verifyHcaptchaToken({
      secretKey: enterpriseBotSecretKey,
      token: enterpriseBotResponse,
      siteKey: enterpriseBotSiteKey,
      remoteIp: "0.0.0.0",
    });
    const { success, score, scoreReasons } = res;

    expect(success).toEqual(true);
    expect(score).toEqual(1);
    expect(scoreReasons).toEqual(["bot"]);

    expect(res).toMatchSnapshot({
      challengeTimestamp: expect.any(String),
    });
  });
});
