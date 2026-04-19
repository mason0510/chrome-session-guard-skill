# Chrome Session Guard Skill
> A skill-first open-source repository for safely opening pages in the user's default macOS Chrome session without guessing the wrong profile or the wrong Chrome instance.

[中文说明](./README.md)

![Language](https://img.shields.io/badge/language-Node.js-blue)
![Platform](https://img.shields.io/badge/platform-macOS-black)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features
- 🧠 **Skill-first**: the main artifact is `SKILL.md`, not just a CLI.
- 🔐 No hardcoded private profile in default mode.
- 🛑 Refuses default-session open when multiple Chrome main instances are detected.
- 🧭 Supports explicit `--profile` override plus `list-profiles` / `list-windows`.
- 🪶 Includes lightweight helper scripts for local verification and reuse.

## 🚀 Quick Start

### Use as a skill
- Codex: place this repo under `~/.codex/skills/chrome-session-guard/`
- Claude Code: place this repo under `~/.claude/skills/chrome-session-guard/`

The main skill entry is `SKILL.md`.

### Use helper CLI locally
```bash
node ./scripts/chrome-session-guard.mjs --help
node ./scripts/chrome-session-guard.mjs list-profiles
node ./scripts/chrome-session-guard.mjs list-windows
node ./scripts/chrome-session-guard.mjs open https://example.com
```

## ⚙️ Common Usage
```bash
node ./scripts/chrome-session-guard.mjs list-profiles
node ./scripts/chrome-session-guard.mjs list-windows
node ./scripts/chrome-session-guard.mjs open https://example.com
node ./scripts/chrome-session-guard.mjs open https://example.com --mode new-tab
node ./scripts/chrome-session-guard.mjs open https://example.com --profile "Default"
node ./scripts/chrome-session-guard.mjs open https://example.com --force
```

## 📚 Documentation
- [Architecture](./ARCHITECTURE.md)
- [Usage and Maintenance](./USAGE_AND_MAINTENANCE.md)
- [Smoke Test Notes](./docs/SMOKE_TEST.md)
- [TODOs](./TODOS.md)
- [Contributing](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

## 🛠️ Development
```bash
npm test
node ./scripts/chrome-session-guard.mjs --help
```

## Boundaries
- macOS + Google Chrome only.
- Default-session mode is not an instance router. It fails fast when multiple main instances are present.
- This skill solves “open in the correct session”, not “attach full browser automation to the current login state”.

## 🤝 Contributing
See [CONTRIBUTING.md](./CONTRIBUTING.md).

## 📧 Contact
- GitHub: [@mason0510](https://github.com/mason0510)
- Issues: please use GitHub Issues

## 📄 License
MIT License. See [LICENSE](./LICENSE).
