# Changelog

All notable changes to BeHappy Web will be documented in this file.

Changes inherited from upstream Telegram Web A are tracked separately
in [UPSTREAM_CHANGELOG.md](UPSTREAM_CHANGELOG.md) and are not repeated
here. This changelog covers only modifications made by the BeHappy Web
Authors.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.3.1] - 2026-08-01

### Changed
- Attach menu: attachment bots are separated from the system entries by a divider,
  matching Telegram. Ported as a single hunk from upstream #7080, whose remaining
  215 files (the tiptap input rewrite) depend on Layer 227 and stay out.

## [0.3.0] - 2026-08-01

Second wave of the upstream Telegram Web A redesign, ported from
Ajaxy/telegram-tt (12.0.30 – 12.0.36). 34 upstream commits cherry-picked
on top of the v0.2.x base.

### Added
- Round video message recording, with a record-mode menu and a one-time toggle (#7075).
- Footer action bar replacing the ad-hoc subscribe / join / start-bot / unblock /
  unpin-all / open-chat buttons (#7089).
- Voice recording bar with pause, resume and playback before sending, backed by a
  native `AudioEncoder` + AudioWorklet pipeline (`opus-recorder` stays as fallback) (#7078).
- `Marquee` primitive: long profile titles scroll instead of wrapping (#7020).
- Rounded outer corners for the media/stories grid in profiles (#7019).

### Changed
- Left column and folder sidebar became floating islands over the chat wallpaper;
  the wallpaper now spans the whole window (#6971).
- Middle header became a floating pill; the audio player, pinned message, group-call
  and bot-ad panels became separate stacked panes below it (#6971, #7063, #7072).
- Message list edges now fade with a gradient mask instead of the scroll notch, and
  reserve exact space for the header and composer so the list no longer jumps (#7059).
- Composer redesigned into a single rounded pill with a detached send button; reply,
  edit and link previews moved above the input (#7078).
- Unified shadow tokens `--shadow-island`, `--shadow-pane`, `--shadow-footer`,
  `--shadow-chat-list-panel` replace hardcoded shadows (#7039).
- `--header-height` split into `--middle-header-height` and `--column-header-height` (#7040).
- Chat invite modal, poll answer results, quick preview, new-contact modal, passcode
  settings and active sessions restyled (#7047, #7057, #7054, #7053, #7069, #6975).
- Diamond icon vertical alignment inside list items (#7104, applied to `DiamondIcon`).
- `Esc` and `Enter` are ignored while an IME composition is active (#7043, partial).

### Fixed
- Round video messages no longer carry a `TELEGRAM` caption and the Telegram
  paper-plane logo. The upstream recorder rasterizes the watermark into the very
  canvas the stream is captured from, so it was baked into every sent file rather
  than merely overlaid in the UI.
- The Ogg container of voice messages no longer advertises `telegram-web-a` as its vendor.
- The in-app "what's new" digest describes the redesign instead of the old welcome text.

### Notes
- MTProto stays on **Layer 224**; upstream Layer 225/227 commits and everything
  depending on them (rich messages, Instant View, the tiptap message-input rewrite)
  are deliberately not ported.
- The build stays on **webpack**; the upstream Vite migration is not ported. The new
  audio worklet is emitted as an asset and excluded from `babel-loader`.

## [Unreleased]

### Added
- Initial fork from upstream Telegram Web A.
- MVSy 1.0 protocol layer (replaces MTProto 2.0 in GramJS).
- Connection to BeHappy backend (`mvsy.ansible.su`).
- BeHappy branding: app name, favicon, splash, color scheme, fonts.

### Removed
- Telegram-specific branding (name, logo, About text).
- Telegram Premium UI surfaces.
- Telegram Stars integration.
- Fragment / TON wallet integration.
- Sponsored messages.
- Telegram-specific deep links (`tg://`, `t.me`).

### Changed
- Default DC list points to BeHappy servers.
- App manifest, service worker scope, and PWA install metadata rebranded.
- Help and support links point to BeHappy resources.
