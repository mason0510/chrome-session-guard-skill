# 使用和维护指南

## 测试日期：2026-04-19
## 文档版本：v0.1.0

## 第一部分：使用指南

### 前置要求
- 操作系统：macOS
- 浏览器：Google Chrome
- 运行时：Node.js 20+
- 权限：允许本地执行 AppleScript

### skill 安装位置
- Codex：`~/.codex/skills/chrome-session-guard/`
- Claude Code：`~/.claude/skills/chrome-session-guard/`

### 常用命令
| 命令 | 说明 | 示例 |
|------|------|------|
| `node ./scripts/chrome-session-guard.mjs open <URL>` | 用默认会话打开 | `node ./scripts/chrome-session-guard.mjs open https://example.com` |
| `node ./scripts/chrome-session-guard.mjs open <URL> --mode new-tab` | 默认会话新标签 | `node ./scripts/chrome-session-guard.mjs open https://example.com --mode new-tab` |
| `node ./scripts/chrome-session-guard.mjs open <URL> --profile "Default"` | 指定 profile 打开 | `node ./scripts/chrome-session-guard.mjs open https://example.com --profile "Default"` |
| `node ./scripts/chrome-session-guard.mjs open <URL> --force` | 多实例强制继续 | `node ./scripts/chrome-session-guard.mjs open https://example.com --force` |
| `node ./scripts/chrome-session-guard.mjs list-profiles` | 查看 Local State 里的 profiles | `node ./scripts/chrome-session-guard.mjs list-profiles` |
| `node ./scripts/chrome-session-guard.mjs list-windows` | 查看当前窗口标题 | `node ./scripts/chrome-session-guard.mjs list-windows` |

### wrapper 脚本
```bash
./scripts/open-default-session.sh https://example.com
./scripts/open-default-session.sh --mode new-tab https://example.com
./scripts/open-explicit-profile.sh Default https://example.com
./scripts/list-profiles.sh
./scripts/list-current-windows.sh
```

### 典型场景

#### 场景 1：用户明确要“用我当前 Chrome 打开”
先：
```bash
./scripts/list-current-windows.sh
```
再：
```bash
./scripts/open-default-session.sh https://example.com
```

#### 场景 2：已经知道要用哪个 profile
```bash
./scripts/open-explicit-profile.sh Default https://example.com
```

#### 场景 3：机器上同时存在主 Chrome 和调试 Chrome
```bash
./scripts/open-default-session.sh https://example.com
```
若被拒绝：
1. 先关闭多余主实例
2. 或改用显式 `--profile`
3. 明知风险时再 `--force`

### 输出约定
成功：
```text
STATUS=ok
...
```

失败：
```text
STATUS=error
MESSAGE=...
```

## 第二部分：维护指南

### 代码结构
```text
SKILL.md
scripts/
├── chrome-session-guard.mjs
├── open-default-session.sh
├── open-explicit-profile.sh
├── list-profiles.sh
├── list-current-windows.sh
└── lib/core.mjs
tests/core.test.mjs
```

### 维护原则
1. 默认模式不猜实例。
2. 先观察现场，再做写操作。
3. skill 文档必须比 helper 脚本更稳定。
4. 不要把私人 profile、私人路径写进默认行为。

### 修复流程
1. 先确认是：默认会话问题 / 显式 profile 问题 / 多实例问题 / AppleScript 权限问题。
2. 先写或补纯逻辑测试。
3. 再修 helper 逻辑。
4. 最后更新 `SKILL.md` 和文档。

### 发布前检查清单
- [ ] `npm test` 通过
- [ ] `node ./scripts/chrome-session-guard.mjs --help` 通过
- [ ] `list-profiles` / `list-windows` 跑过 live
- [ ] 多实例保护跑过 live
- [ ] `--force` 跑过 live（如现场允许）
- [ ] README / README_EN / CHANGELOG 同步

### 常见问题

#### 1. 报“当前版本仅支持 macOS”
当前 skill 只针对 macOS。

#### 2. 报“未找到 Chrome Local State”
通常是当前账号下 Chrome 尚未初始化，或路径不是默认安装位置。

#### 3. 默认模式被多实例保护挡住
这是预期，不是故障。它在防止打到错误实例。

#### 4. `list-windows` 看到的窗口和你以为的不一样
它只是观察工具，不是安全实例路由器。

### 长期建议
- 保持 skill 边界清晰：打开页面 ≠ 自动化接管。
- 把“多实例默认拒绝”当成核心不变量，不要为了方便偷改。
