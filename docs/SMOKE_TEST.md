# Chrome Session Guard 冒烟测试记录

## 测试日期：2026-04-19
## 文档版本：v0.1.0

## 测试环境
- 操作系统：macOS
- 浏览器：Google Chrome
- 运行时：Node.js
- 仓库名：`chrome-session-guard-skill`

## 本轮测试目标
1. 纯逻辑测试通过
2. CLI 帮助输出正确
3. `list-profiles` / `list-windows` 跑出真实结果
4. 多实例保护真实触发
5. `--force` 在明确风险下继续执行

## 实际执行命令
```bash
node --test tests/*.test.mjs
node ./scripts/chrome-session-guard.mjs --help
node ./scripts/chrome-session-guard.mjs list-profiles
node ./scripts/chrome-session-guard.mjs list-windows
node ./scripts/chrome-session-guard.mjs open https://example.com
node ./scripts/chrome-session-guard.mjs open https://example.com --force
```

## 实际结果摘要
- 单元测试：10 / 10 通过
- `--help`：通过
- `list-profiles`：通过
- `list-windows`：通过，且真实返回 `WARNING=multiple-main-instances`、`INSTANCE_COUNT=2`
- 默认 `open`：按设计拒绝，提示存在多个 Chrome 主实例
- `open --force`：真实返回 `STATUS=ok`，页面标题为 `Example Domain`

## 说明
- 本文档只记录本轮真实口径，不固化私人 profile 名称、私人邮箱、私人窗口标题。
- 若要公开截图或长日志，发布前应先脱敏。
