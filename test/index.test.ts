import { rawVerifyHcaptchaToken, verifyHcaptchaToken } from "../src";

describe("verifyHcaptchaToken", () => {
  it("one", async () => {
    expect.assertions(1);

    const res = await verifyHcaptchaToken({} as any);
    console.table(res);

    expect(true).toBeTruthy();
  });

  it("two", async () => {
    expect.assertions(1);

    // const res = await rawVerifyHcaptchaToken({} as any);
    const res = await rawVerifyHcaptchaToken({});
    console.table(res);

    expect(true).toBeTruthy();
  });
});
