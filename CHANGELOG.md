# Changelog

All notable changes to BeHappy Web will be documented in this file.

Changes inherited from upstream Telegram Web A are tracked separately
in [UPSTREAM_CHANGELOG.md](UPSTREAM_CHANGELOG.md) and are not repeated
here. This changelog covers only modifications made by the BeHappy Web
Authors.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

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
