# Chrome Session Guard 架构说明

## 整体架构
```text
┌─────────────────────────┐
│ SKILL.md                │
│ 触发条件 / 行为边界      │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Helper CLI              │
│ scripts/chrome-session- │
│ guard.mjs               │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Core logic              │
│ scripts/lib/core.mjs    │
└───────┬─────────┬───────┘
        ▼         ▼
┌────────────┐ ┌──────────────┐
│ osascript  │ │ ps / open /  │
│ 当前会话打开 │ │ Local State  │
└──────┬─────┘ └──────┬───────┘
       └──────┬───────┘
              ▼
      ┌────────────────┐
      │ 标准文本输出    │
      └────────────────┘
```

## 核心模块

### 1. `SKILL.md`
- 职责：定义什么时候应该使用这个 skill，什么时候不该用。
- 关键点：
  - 用户说“用我当前 Chrome 打开”
  - 不要瞎猜 profile
  - 多实例先保护再动作

### 2. `scripts/chrome-session-guard.mjs`
- 职责：命令入口。
- 子命令：
  - `open`
  - `list-profiles`
  - `list-windows`

### 3. `scripts/lib/core.mjs`
- 职责：
  - URL / mode 校验
  - Chrome 主实例检测
  - AppleScript 生成
  - Local State 解析
  - 多实例保护文案

### 4. `scripts/*.sh`
- 职责：给 shell/agent 更短调用路径。
- 说明：只是 wrapper，不承载核心逻辑。

### 5. `tests/core.test.mjs`
- 职责：纯逻辑测试。
- 原则：不伪造浏览器验收，不拿样例冒充 live 结果。

## 数据流

### 默认会话打开
1. 调用 `open <URL>`
2. 校验 URL 与 mode
3. 检查主实例数量
4. 若多实例且未 `--force` → 直接失败
5. 若单实例或 `--force` → AppleScript 打开页面

### 显式 profile 打开
1. 调用 `open <URL> --profile <PROFILE_KEY>`
2. 直接走 Chrome `--profile-directory`
3. 输出结果

### 现场观察
- `list-profiles`：读默认 `Local State`
- `list-windows`：读 UI 可见窗口标题

## 关键设计决策

### 决策 1：skill-first，而不是 tool-first
核心价值是把经验沉淀成 agent 可复用规则，不只是一个命令。

### 决策 2：默认模式不能靠猜
只要多主实例出现，默认模式就不再可靠，所以必须默认阻断。

### 决策 3：读操作和写操作分层
`list-*` 负责观察现场；`open` 负责执行动作，保护更严格。

## 扩展建议
- 若未来要做实例级路由，新增独立命令，不要污染默认模式。
- 若未来要支持 Chromium / Arc / Chrome Beta，应抽浏览器适配层。
- 若未来要接 CDP 自动化，应新建 skill，不要把自动化接管混入当前 skill。
