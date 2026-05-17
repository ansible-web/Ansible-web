# BeHappy Web

Web client for the [BeHappy](https://behappy.rest) messaging service.

> **This project is a fork of [Telegram Web A](https://github.com/Ajaxy/telegram-tt).**
> It is licensed under [GPL v3](LICENSE), the same terms as the upstream
> project. We are grateful to Alexander Zinchuk and the Telegram Web A
> contributors for their work — without it this fork would not exist.
>
> BeHappy Web is **not affiliated with, endorsed by, or sponsored by
> Telegram FZ-LLC**. It connects to BeHappy servers, not Telegram
> servers, and cannot be used to access Telegram accounts.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Upstream](https://img.shields.io/badge/forked%20from-telegram--tt-orange.svg)](https://github.com/Ajaxy/telegram-tt)

---

## What this is

BeHappy Web is the official web client for the BeHappy messenger. It
is built on top of the Telegram Web A codebase under GPL v3, with the
following high-level modifications:

- Networking layer (custom GramJS) rewritten to use the **MVSy 1.0**
  protocol and connect to BeHappy backend servers (instead of MTProto
  2.0 / Telegram DCs).
- Branding, visual identity, and product naming replaced throughout.
- Telegram-specific features removed where not applicable to BeHappy
  (e.g., Telegram Premium subscriptions, Telegram Stars, Fragment
  integration, sponsored messages).
- Additional features added that are unique to BeHappy.

The complete list of changes from upstream is tracked in
[`CHANGELOG.md`](CHANGELOG.md). The upstream changelog is preserved in
[`UPSTREAM_CHANGELOG.md`](UPSTREAM_CHANGELOG.md) for reference.

## Relationship to upstream

| | Telegram Web A | BeHappy Web |
|---|---|---|
| License | GPL v3 | GPL v3 — same |
| Backend | Telegram DCs | BeHappy servers (`mvsy.behappy.rest`) |
| Protocol | MTProto 2.0 (via GramJS) | MVSy 1.0 (via custom GramJS fork) |
| Trademarks | Telegram Web A | BeHappy |
| Account compatibility | Telegram accounts | BeHappy accounts (separate system) |
| Source repository | [Ajaxy/telegram-tt](https://github.com/Ajaxy/telegram-tt) | [behappy-web/behappy-web](https://github.com/behappy-web/behappy-web) |

We do **not** merge updates from upstream automatically. The fork is
independently maintained.

## Try it

Hosted instance: <https://web.ansible.rest/>

Source release archives: <https://github.com/behappy-web/behappy-web/releases>

For Telegram Web A (the upstream project) please visit
[telegram.org/web](https://web.telegram.org/a).

## Local setup

```sh
mv .env.example .env
npm i
npm run dev
```

The `.env` file should point to your BeHappy backend instance. No
Telegram `api_id` is required — BeHappy uses its own protocol.

For full build and deployment instructions see
[`docs/`](docs/) (where present) and the upstream README for the
underlying tooling.

## License

BeHappy Web is free software: you can redistribute it and/or modify it
under the terms of the **GNU General Public License v3** as published
by the Free Software Foundation.

- Full license text: [LICENSE](LICENSE)
- Attribution and trademark notice: [NOTICE](NOTICE)

By contributing to this repository, you agree that your contributions
will be licensed under the same terms.

## Trademarks

"Telegram" and "Telegram Web A" are trademarks/identifiers associated
with Telegram FZ-LLC. They are used in this README and in source code
copyright headers solely to identify the upstream project from which
this fork is derived, as required by GPL §5(a). They are **not** used
as trademarks of this product.

"BeHappy" is a trademark of the BeHappy Web Authors.

## Contact

- General: <https://behappy.rest>
- Source code questions: open an issue on this repository
- License compliance / DMCA: <legal@behappy.rest>
