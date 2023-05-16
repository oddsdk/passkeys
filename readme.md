# Odd Passkeys monorepo

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/oddsdk/passkeys/blob/main/license)
[![Built by FISSION](https://img.shields.io/badge/⌘-Built_by_FISSION-purple.svg)](https://fission.codes)
[![Discord](https://img.shields.io/discord/478735028319158273.svg)](https://discord.gg/zAQBDEq)
[![Discourse](https://img.shields.io/discourse/https/talk.fission.codes/topics)](https://talk.fission.codes)

Headless, type-safe & powerful utilities to build apps with [ODD SDK](https://odd.dev/) and [Passkeys](https://w3c.github.io/webauthn).

## Packages

- [`@oddjs/passkeys`](packages/odd-passkeys/) - ODD SDK passkeys components.
- [`@oddjs/preact`](packages/odd-preact/) - ODD SDK Preact hooks and context provider.

## Examples

- [`examples/passkey-auth`](examples/passkey-auth/) - Passkey authentication example

### Checkout examples

Using Codesandbox: <https://githubbox.com/oddsdk/passkeys/tree/main/examples/passkey-auth>

Locally:

```bash
npx tiged oddsdk/passkeys/examples/passkey-auth odd-passkey-auth
cd odd-passkey-auth
pnpm install
pnpm dev
```

## Contributing

Read contributing guidelines [here](.github/CONTRIBUTING.md).

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/oddsdk/passkeys)

## License

Licensed under [Apache 2.0](license)
