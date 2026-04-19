# Chrome Session Guard
> 一个 skill-first 开源仓库：把“在 macOS 上正确打开用户默认 Chrome 当前会话、避免误打到错误 profile / 错误实例”的经验，沉淀成可复用 skill 与 helper scripts。

[English](./README_EN.md)

![Language](https://img.shields.io/badge/language-Node.js-blue)
![Platform](https://img.shields.io/badge/platform-macOS-black)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ 核心特性
- 🧠 **skill-first**：主产物是 `SKILL.md`，不是纯 CLI。
- 🔐 默认不写死私人 profile，优先复用用户默认/当前 Chrome 会话。
- 🛑 检测到多个 Chrome 主实例时默认拒绝，避免“打开错窗口还自以为对”。
- 🧭 支持显式 `--profile` 覆盖，并提供 `list-profiles` / `list-windows` 做现场观察。
- 🪶 附带轻量 helper scripts，方便本地验证与二次集成。

## 🚀 快速开始

### 作为 skill 使用

#### Codex
把本仓库内容放到：
```bash
~/.codex/skills/chrome-session-guard/
```

#### Claude Code
把本仓库内容放到：
```bash
~/.claude/skills/chrome-session-guard/
```

skill 主入口是：
```bash
SKILL.md
```

### 作为 helper CLI 本地运行
```bash
node ./scripts/chrome-session-guard.mjs --help
node ./scripts/chrome-session-guard.mjs list-profiles
node ./scripts/chrome-session-guard.mjs list-windows
node ./scripts/chrome-session-guard.mjs open https://example.com
```

## ⚙️ 典型用法
```bash
# 观察现场
node ./scripts/chrome-session-guard.mjs list-profiles
node ./scripts/chrome-session-guard.mjs list-windows

# 用默认/当前会话打开
node ./scripts/chrome-session-guard.mjs open https://example.com

# 新标签打开
node ./scripts/chrome-session-guard.mjs open https://example.com --mode new-tab

# 显式指定 profile
node ./scripts/chrome-session-guard.mjs open https://example.com --profile "Default"

# 明知多实例仍强制继续
node ./scripts/chrome-session-guard.mjs open https://example.com --force
```

也提供 shell wrapper：
```bash
./scripts/list-profiles.sh
./scripts/list-current-windows.sh
./scripts/open-default-session.sh https://example.com
./scripts/open-explicit-profile.sh Default https://example.com
```

## 📚 详细文档
- [架构说明](./ARCHITECTURE.md)
- [使用和维护指南](./USAGE_AND_MAINTENANCE.md)
- [测试记录](./docs/SMOKE_TEST.md)
- [待办事项](./TODOS.md)
- [贡献指南](./CONTRIBUTING.md)
- [变更日志](./CHANGELOG.md)

## 🛠️ 开发
```bash
npm test
node ./scripts/chrome-session-guard.mjs --help
```

## 边界
- 当前只支持 macOS + Google Chrome。
- 默认会话模式不是实例路由器；多主实例时会默认阻断。
- 这个 skill 解决的是“在对的会话里打开页面”，不是“自动接管当前登录态做 CDP 自动化”。

## 🤝 贡献
欢迎贡献，请先看 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 📧 联系方式
- GitHub: [@mason0510](https://github.com/mason0510)
- WeChat: zhcmason
- Email: zhang_989898@126.com
- Issues: 请通过 GitHub Issues 提交

## 📄 许可证
MIT License，详见 [LICENSE](./LICENSE)
