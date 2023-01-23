# verify-hcaptcha

[![Build status](https://img.shields.io/github/actions/workflow/status/velut/verify-hcaptcha/main.yml?branch=main)](https://github.com/velut/verify-hcaptcha/actions?query=workflow%3ACI)
[![Coverage](https://img.shields.io/codecov/c/gh/velut/verify-hcaptcha)](https://codecov.io/gh/velut/verify-hcaptcha)
[![jsDocs.io](https://img.shields.io/badge/jsDocs.io-reference-blue)](https://www.jsdocs.io/package/verify-hcaptcha)
![Language](https://img.shields.io/github/languages/top/velut/verify-hcaptcha)
[![npm bundle size](https://img.shields.io/bundlephobia/min/verify-hcaptcha)](https://bundlephobia.com/result?p=verify-hcaptcha)
[![npm](https://img.shields.io/npm/v/verify-hcaptcha)](https://www.npmjs.com/package/verify-hcaptcha)
[![License](https://img.shields.io/github/license/velut/verify-hcaptcha)](https://github.com/velut/verify-hcaptcha/blob/main/LICENSE)


A no dependencies, fully typed library to verify hCaptcha tokens
submitted by users when solving CAPTCHA challenges.

> Note: this is an **unofficial** library; we are not affiliated with hCaptcha.com

## Features

-   No dependencies
-   Fully typed API and response data
-   Well documented and tested

## API & Package Info

-   [Explore the API on **jsDocs.io**](https://www.jsdocs.io/package/verify-hcaptcha)
-   [View package contents on **unpkg**](https://unpkg.com/verify-hcaptcha/)
-   [View repository on **GitHub**](https://github.com/velut/verify-hcaptcha)
-   [Read official documentation on **hCaptcha**](https://docs.hcaptcha.com/)

## Install

Using `npm`:

```
npm i verify-hcaptcha
```

Using `yarn`:

```
yarn add verify-hcaptcha
```

## Usage Examples

Verify a token submitted by a user:

```typescript
import { verifyHcaptchaToken } from 'verify-hcaptcha';

(async () => {
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
})();
```

Verify a token submitted by a user and get the raw response from hCaptcha:

```typescript
import { rawVerifyHcaptchaToken } from 'verify-hcaptcha';

(async () => {
    const result = await rawVerifyHcaptchaToken({
      token: "USER-SUBMITTED-RESPONSE-TOKEN",
      secretKey: "YOUR-SECRET-KEY",
      siteKey: "YOUR-SITE-KEY",
    });

    if (result.success) {
      console.log("User is human");
    } else {
      console.log("User is robot");
    }
})();
```

## License

MIT License

Copyright (c) 2021 Edoardo Scibona

See LICENSE file.
