# Odd Passkeys Monorepo

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/oddsdk/passkeys/blob/main/license)
[![Built by FISSION](https://img.shields.io/badge/⌘-Built_by_FISSION-purple.svg)](https://fission.codes)
[![Discord](https://img.shields.io/discord/478735028319158273.svg)](https://discord.gg/zAQBDEq)
[![Discourse](https://img.shields.io/discourse/https/talk.fission.codes/topics)](https://talk.fission.codes)

Headless, type-safe & powerful utilities to build apps with [ODD SDK](https://odd.dev/) and [Passkeys](https://w3c.github.io/webauthn).

## Packages

- [`@oddjs/passkeys`](packages/odd-passkeys/) - ODD SDK passkeys components.
- [`@oddjs/preact`](packages/odd-preact/) - ODD SDK Preact hooks and context provider.

## Examples

- [`examples/demo`](examples/demo/) - Full PWA demo app with ODD SDK, passkeys authentication, OS share target, OS sharing UI and more. Check the [Live demo](https://passkeys.fission.app/).
- [`examples/odd-passkeys-preact`](examples/odd-passkeys-preact/) - ODD SDK using passkeys authentication with [Preact](https://preactjs.com/).

### Checkout examples

Using can you Codesandbox: <https://githubbox.com/oddsdk/passkeys/tree/main/examples/odd-passkeys-preact> and start hacking right away.

To clone it locally:

```bash
npx tiged oddsdk/passkeys/examples/odd-passkeys-preact odd-passkeys-preact
cd odd-passkeys-preact
pnpm install
pnpm dev
```

You can try any of the examples by replacing `odd-passkeys-preact` with the name of the example you want to try.

## Contributing

Read contributing guidelines [here](.github/CONTRIBUTING.md).

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/oddsdk/passkeys)

## License

Licensed under [Apache 2.0](license)
