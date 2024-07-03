# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- None

## [2.0.0] - 2024-07-03

This package is now a [pure ESM package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c) and uses the [fetch global function](https://developer.mozilla.org/en-US/docs/Web/API/fetch) to perform network requests.

Additionally, every response returned by hCaptcha.com is now validated against its expected schema. This means that data can now be safely accessed according to the corresponding TypeScript type definition. Unexpected data will reject with an error; in this case open an issue to propose changes to the schema.

### Added

These are the current package's exports:

- **Functions**:
  - verifyHcaptchaToken()
- **TypeScript types**:
  - HcaptchaResponse

### Changed

- **BREAKING CHANGE**: This package is now a [pure ESM package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
- **BREAKING CHANGE**: Require Node.js 20 (latest LTS).
- **BREAKING CHANGE**: Use `fetch` for network requests.

## [1.0.0] - 2021-10-26

[unreleased]: https://github.com/velut/verify-hcaptcha/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/velut/verify-hcaptcha/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/velut/verify-hcaptcha/tree/v1.0.0
