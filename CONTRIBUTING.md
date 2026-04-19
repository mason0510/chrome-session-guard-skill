# 贡献指南

感谢你考虑为 Chrome Session Guard 做贡献。

## 贡献类型
- 报告 Bug
- 提交功能建议
- 改进 skill 文档
- 修复 helper 脚本

## 报告 Bug 时请附带
- macOS 版本
- Chrome 版本
- Node.js 版本
- 是否存在多个 Chrome 主实例
- 复现命令
- 实际输出

## 提交代码流程
1. Fork 并 Clone
2. 新建分支：`git checkout -b feature/your-change`
3. 修改代码或文档
4. 跑测试：`npm test`
5. 更新相关文档
6. 提交：`git commit -m "feat: your change"`
7. 推送并创建 PR

## 开发规范
- `SKILL.md` 的 description 只写触发条件，不写完整流程。
- 默认行为禁止写死私人 profile。
- 多实例默认拒绝，是核心边界。
- 新增逻辑先补测试，再补脚本，再补文档。

## 审查重点
- 是否破坏了 skill 的触发边界
- 是否引入了新的隐式猜测
- 是否把读操作和写操作混在一起
- 是否把 helper 脚本包装成了“已自动化接管”
