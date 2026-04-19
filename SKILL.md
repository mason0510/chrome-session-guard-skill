---
name: chrome-session-guard
description: Use when a task must open a page in the user's current or default Google Chrome session on macOS, needs an explicit Chrome profile override, or must avoid hitting the wrong Chrome main instance during browser-state reuse.
---

# Chrome Session Guard

## Overview
Chrome Session Guard 把“在 macOS 上**正确打开用户默认 Chrome 当前会话**”沉淀成一个 skill。

核心原则只有一句：**先观察现场，再决定打开；默认不瞎猜 profile，不瞎打多实例。**

## When to Use
- 用户说“用我当前 Chrome 打开”
- 用户说“不要覆盖我正在看的页面，开新窗口/新标签”
- 用户明确给了 `Default` 或 `Profile N`
- 你怀疑机器上有多个 Chrome 主实例，怕打错实例
- 你想先列出窗口和 profiles，再决定后续动作

不要用于：
- 非 macOS 环境
- 目标浏览器不是 Google Chrome
- 任务本质是 CDP / MCP 自动化接管，而不是“先在对的会话里打开页面”

## Core Pattern

### 1. 先观察
```bash
./scripts/list-profiles.sh
./scripts/list-current-windows.sh
```

### 2. 再决定打开方式

#### 默认 / 当前会话
```bash
./scripts/open-default-session.sh https://example.com
```

#### 显式 profile
```bash
./scripts/open-explicit-profile.sh Default https://example.com
```

### 3. 多实例保护
若默认模式返回：
```text
STATUS=error
MESSAGE=检测到多个 Google Chrome 主实例正在运行...
```
说明保护生效。此时优先：
1. 关闭多余主实例
2. 或改用显式 `--profile`
3. 明知风险时才 `--force`

## Quick Reference
| 目标 | 命令 |
|------|------|
| 查看 profiles | `./scripts/list-profiles.sh` |
| 查看窗口 | `./scripts/list-current-windows.sh` |
| 默认会话打开 | `./scripts/open-default-session.sh <URL>` |
| 新标签打开 | `./scripts/open-default-session.sh --mode new-tab <URL>` |
| 显式 profile 打开 | `./scripts/open-explicit-profile.sh <PROFILE_KEY> <URL>` |

## Common Mistakes
- 把 `list-windows` 当成实例路由器：不对，它只是观察工具。
- 看到 Chrome 在运行就直接默认打开：不对，先看是否多主实例。
- 用户没明确说 profile，却擅自写死 `Profile 7`：不对，这是私有口径，不是公开 skill 口径。
- 把“页面在对的会话里打开”误说成“自动化已经接管”：不对。

## Helper Scripts
- `scripts/chrome-session-guard.mjs`：统一入口
- `scripts/open-default-session.sh`：默认会话打开 wrapper
- `scripts/open-explicit-profile.sh`：显式 profile 打开 wrapper
- `scripts/list-profiles.sh`：查看默认 Chrome Local State
- `scripts/list-current-windows.sh`：查看当前窗口标题

## Validation Standard
最小可用标准：
1. `list-profiles` 能返回真实 profiles
2. `list-windows` 能返回真实窗口
3. 多实例场景默认 `open` 会拒绝
4. `--force` 在明确风险下可继续
5. 全程不依赖私人 profile 默认值
