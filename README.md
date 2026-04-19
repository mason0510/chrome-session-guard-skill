# Chrome Session Guard Skill
> 一个给小白也能直接上手的 skill-first 开源仓库：解决“**我只是想在当前/默认 Chrome 会话里打开页面，别再给我打错 profile、打错窗口**”这个真实问题。

[English](./README_EN.md)

![Language](https://img.shields.io/badge/language-Node.js-blue)
![Platform](https://img.shields.io/badge/platform-macOS-black)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 这是什么

很多自动化脚本一上来就犯三个错：

1. **瞎猜 profile**
2. **不检查机器上是不是同时开了多个 Chrome 主实例**
3. **明明打错窗口了，还以为自己是对的**

这个仓库就是把这套防踩坑经验，整理成：

- 一个可复用的 `SKILL.md`
- 一套可以直接运行的 helper scripts
- 一份对小白友好的中文说明

一句话理解：

> **先观察现场，再决定怎么打开；默认不乱猜，发现多实例就先拦住。**

---

## 它适合谁

适合这些场景：

- 你在 macOS 上用 **Google Chrome**
- 你想“用我当前正在用的 Chrome 打开页面”
- 你不想误打到错误 profile
- 你希望**先列出当前窗口 / 当前 profiles** 再做动作
- 你在写 Codex / Claude Code / 本地脚本，希望把这套逻辑复用进去

不适合这些场景：

- 你不是 macOS
- 你要操作的不是 Google Chrome
- 你要的是 CDP / MCP 全自动接管浏览器

---

## 小白先看：你大概率只需要这 3 个命令

### 第一步：看看机器上有哪些 profile

```bash
node ./scripts/chrome-session-guard.mjs list-profiles
```

### 第二步：看看当前 Chrome 窗口标题

```bash
node ./scripts/chrome-session-guard.mjs list-windows
```

### 第三步：用默认/当前会话打开网页

```bash
node ./scripts/chrome-session-guard.mjs open https://example.com
```

如果这一步报错说“检测到多个 Chrome 主实例”，**这不是坏了，是保护生效了。**

---

## 为什么要有“多实例保护”

很多人机器上其实不止一个 Chrome 主实例，比如：

- 一个是你平时正在用的主 Chrome
- 一个是调试 Chrome
- 一个是带 `--user-data-dir` 的独立实例

这时候如果脚本还自作聪明地说“我帮你打开到当前 Chrome”，很容易：

- 打到错误实例
- 打到错误 profile
- 抢错窗口
- 结果看起来像成功，实际完全错了

所以这个仓库的默认策略是：

```text
先观察
→ 发现多主实例
→ 默认拒绝继续
→ 让你自己决定：关掉多余实例 / 显式指定 profile / 明知风险再 --force
```

这就是它和“普通打开浏览器脚本”最大的区别。

---

## 3 分钟快速开始

### 前置要求

- macOS
- 已安装 Google Chrome
- Node.js 20 或更高版本

先确认：

```bash
node -v
```

---

## 用法一：直接当本地脚本用

### 1. 克隆仓库

```bash
git clone git@github.com:mason0510/chrome-session-guard-skill.git
cd chrome-session-guard-skill
```

### 2. 先看帮助

```bash
node ./scripts/chrome-session-guard.mjs --help
```

### 3. 开始使用

```bash
# 查看 profile
node ./scripts/chrome-session-guard.mjs list-profiles

# 查看当前窗口
node ./scripts/chrome-session-guard.mjs list-windows

# 用默认/当前会话打开
node ./scripts/chrome-session-guard.mjs open https://example.com
```

---

## 用法二：当 skill 使用

这个仓库虽然 GitHub 仓库名叫 **`chrome-session-guard-skill`**，  
但真正安装到技能目录时，**推荐目录名仍然用 `chrome-session-guard`**，这样更直观。

### Codex

```bash
git clone git@github.com:mason0510/chrome-session-guard-skill.git ~/.codex/skills/chrome-session-guard
```

### Claude Code

```bash
git clone git@github.com:mason0510/chrome-session-guard-skill.git ~/.claude/skills/chrome-session-guard
```

skill 主入口是：

```bash
SKILL.md
```

---

## 最常用命令清单

### 1. 查看 profiles

```bash
node ./scripts/chrome-session-guard.mjs list-profiles
```

作用：
- 读取默认 Chrome 的 `Local State`
- 告诉你有哪些 profile
- 告诉你哪个是最近使用的

---

### 2. 查看当前窗口

```bash
node ./scripts/chrome-session-guard.mjs list-windows
```

作用：
- 列出当前可见窗口标题
- 如果存在多个 Chrome 主实例，会先给出警告

---

### 3. 用默认/当前会话打开

```bash
node ./scripts/chrome-session-guard.mjs open https://example.com
```

适合：
- 你没明确指定 profile
- 你就是想复用当前正常使用的 Chrome

---

### 4. 新标签打开

```bash
node ./scripts/chrome-session-guard.mjs open https://example.com --mode new-tab
```

适合：
- 你不想新开窗口
- 你只想在当前 Chrome 前台开一个新标签

---

### 5. 显式指定 profile

```bash
node ./scripts/chrome-session-guard.mjs open https://example.com --profile "Default"
```

适合：
- 你明确知道该用哪个 profile
- 你不想依赖“当前默认会话”的判断

---

### 6. 明知有风险仍强制继续

```bash
node ./scripts/chrome-session-guard.mjs open https://example.com --force
```

适合：
- 你已经知道机器上有多个 Chrome 主实例
- 你明确接受可能打错实例的风险

不适合：
- 你只是图省事
- 你还没看过 `list-windows`
- 你根本不知道机器上现在是什么现场

---

## 也可以直接用 shell wrapper

如果你不想每次都写完整 Node 命令，可以直接用这些包装脚本：

```bash
./scripts/list-profiles.sh
./scripts/list-current-windows.sh
./scripts/open-default-session.sh https://example.com
./scripts/open-explicit-profile.sh Default https://example.com
```

---

## 报错了怎么办

### 情况 1：提示“检测到多个 Chrome 主实例”

这是最常见情况。

正确做法：

1. 先运行：

```bash
node ./scripts/chrome-session-guard.mjs list-windows
```

2. 然后选一种：
- 关闭多余 Chrome 主实例
- 改用 `--profile`
- 明知风险才 `--force`

---

### 情况 2：提示“未找到 Chrome Local State”

说明当前机器上没有标准 Chrome 本地状态文件，或者 Chrome 还没正常初始化过。

你可以先：

1. 手动启动一次 Google Chrome
2. 正常创建或登录一个 profile
3. 再重新执行 `list-profiles`

---

### 情况 3：命令没反应 / 行为和预期不一致

请先检查三件事：

```bash
node ./scripts/chrome-session-guard.mjs --help
node ./scripts/chrome-session-guard.mjs list-profiles
node ./scripts/chrome-session-guard.mjs list-windows
```

如果这三步里已经有一步不对，先不要继续往后堆命令。

---

## Q&A

### Q1：这个和 Playwright 区别是什么？

不是一类东西。

- **chrome-session-guard**：只解决“**在正确的现有 Chrome 会话里打开页面**”这件事
- **Playwright**：是完整的浏览器自动化框架，负责启动、接管、脚本化控制浏览器

这个仓库的核心价值不是自动化，而是：

- 少打错 profile
- 少打错 Chrome 实例
- 少打错窗口
- 在你已经在用的真实 Chrome 会话里打开页面

如果你要的是：

- 自动点击
- 自动填表
- 自动抓 DOM
- 自动跑测试

那主角应该是 Playwright / CDP / MCP，不是这个仓库。

---

### Q2：它能不能复用浏览器登录态？

**能，但边界要说清楚。**

它的复用方式不是“读取 cookie 后自己伪造浏览器”，而是：

- 直接调用你本机现有的 **Google Chrome**
- 复用当前/默认会话，或显式指定的 profile
- 让页面在那个真实 Chrome 会话里打开

所以：

- 你原本已经登录的网站，通常会继续保持登录
- 你原本已有的 Cookie / Local Storage / 扩展环境，也会随那个会话一起生效

但它**不负责**：

- 接管当前登录态做自动化
- 连接 CDP / MCP
- 绕过网站风控
- 替你保证“这个 profile 一定就是你想要的目标账号”

它做的是**减少打错会话**，不是“浏览器自动化伪装器”。

---

### Q3：为什么很多场景下 Playwright 更容易被封控？

因为很多主流网站现在已经不只是看“能不能打开页面”，而是在看：

- 浏览器指纹
- 自动化特征
- 行为节奏
- 新环境/冷环境登录
- `webdriver` / DevTools / 自动化上下文痕迹

Playwright 本质上是自动化框架，即使做过各种规避，很多站点仍会重点盯这种流量。

而这个仓库的思路完全不同：

- 不新造一个自动化浏览器环境
- 不默认拉起一套新的临时 profile
- 不假装自己是“像真人一样的自动化”
- 只是把页面打开到你**已经在使用的真实 Chrome 会话**

所以它不是“反封控工具”，但在很多“只是想复用现有登录态打开页面”的场景里，**天然比 Playwright 少一层自动化暴露面**。

---

### Q4：它和 BitBrowser（有些人会写成 bb-browser）区别是什么？

也不是同一层工具。

**chrome-session-guard** 解决的是：

- 当前机器上哪个 Chrome 才是对的
- 当前默认/现有会话能不能安全打开
- 多实例时先拦住，别乱打

**BitBrowser** 解决的是：

- 一账号一环境
- 一账号一代理
- 一账号一指纹
- 多账号长期隔离运营

一句话说：

- 你要的是“**别打错我正在用的 Chrome 会话**” → 用这个仓库
- 你要的是“**多账号隔离、独立环境、独立代理、独立指纹**” → 用 BitBrowser

两者可以互补，但不是替代关系。

---

### Q5：怎么触发这个 skill？

如果你是把它装进 **Codex** 或 **Claude Code** 的 skills 目录，最常见触发方式就是在任务里直接说出这类意图：

- “用我当前的 Chrome 打开这个页面”
- “不要新建干净浏览器，复用我现有 Chrome 会话”
- “先看下当前有哪些 Chrome profile / 窗口”
- “帮我在默认 Chrome 会话里打开这个链接”
- “显式用 Profile 7 / Default 打开这个地址”

更直接一点，你也可以明确点名这个 skill：

```text
用 chrome-session-guard 打开 https://example.com
```

或者：

```text
先用 chrome-session-guard 列出当前 Chrome 窗口和 profile
```

如果你不是通过 agent 触发，而是自己本地直接跑脚本，那就不用讲“触发词”，直接执行命令：

```bash
node ./scripts/chrome-session-guard.mjs list-profiles
node ./scripts/chrome-session-guard.mjs list-windows
node ./scripts/chrome-session-guard.mjs open https://example.com
```

---

## 目录说明

```text
chrome-session-guard-skill/
├── SKILL.md                         # skill 主入口
├── scripts/
│   ├── chrome-session-guard.mjs     # 统一 CLI 入口
│   ├── list-profiles.sh
│   ├── list-current-windows.sh
│   ├── open-default-session.sh
│   └── open-explicit-profile.sh
├── tests/                           # 纯逻辑测试
├── docs/SMOKE_TEST.md               # 冒烟测试记录
└── README.md                        # 中文说明
```

---

## 边界说明

- 当前只支持 **macOS + Google Chrome**
- 默认会话模式**不是**实例路由器
- 这个仓库解决的是“在对的会话里打开页面”
- 它**不负责**：
  - 接管当前登录态做自动化
  - 接管 DevTools / MCP
  - 替你判断“这个 profile 一定就是你想要的”

---

## 详细文档

- [架构说明](./ARCHITECTURE.md)
- [使用和维护指南](./USAGE_AND_MAINTENANCE.md)
- [测试记录](./docs/SMOKE_TEST.md)
- [待办事项](./TODOS.md)
- [贡献指南](./CONTRIBUTING.md)
- [变更日志](./CHANGELOG.md)

---

## 开发者最小验证

```bash
npm test
node ./scripts/chrome-session-guard.mjs --help
```

---

## 如果这个仓库帮你避开过坑，欢迎 Star

如果你也被这些问题反复坑过：

- 明明想复用当前登录态，结果打开了错误 profile
- 机器上开了多个 Chrome 实例，脚本却自作聪明乱打
- 只是想开个页面，却把会话、窗口、账号全搞混

那这个仓库大概率就是在解决你的真实问题。

如果它帮你省过一次排查时间，欢迎点个 **Star**。

也欢迎提 **Issue** 或直接发 **PR**，把更多真实现场补进来。

---

## 反馈方式

如果你发现：

- 某种 Chrome 现场没有被正确识别
- 某种多实例情况误判
- 某个命令文案不够小白

请直接提 GitHub Issue：

```text
https://github.com/mason0510/chrome-session-guard-skill/issues
```

---

## 许可证

MIT License，详见 [LICENSE](./LICENSE)
