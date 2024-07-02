import nock from "nock";
import { verifyHcaptchaToken } from "../src";

// See https://docs.hcaptcha.com/#integration-testing-test-keys
const publisherSecretKey = "0x0000000000000000000000000000000000000000";
const publisherResponse = "10000000-aaaa-bbbb-cccc-000000000001";

describe("verifyHcaptchaToken", () => {
	it("throws when the HTTP POST request fails", async () => {
		expect.assertions(1);

		nock("https://hcaptcha.com").post("/siteverify").replyWithError("Test request failed");

		try {
			await verifyHcaptchaToken({
				secretKey: publisherSecretKey,
				token: publisherResponse,
			});
		} catch (err) {
			expect(err).toBeDefined();
		}
	});
});
