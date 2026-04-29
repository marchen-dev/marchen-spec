## 背景

explore skill 的"检查上下文"部分指引 AI 用 `marchen search "<关键词>"` 搜索历史，但 AI 提取的查询词太泛（如用户问"初始化适配多个 agent 客户端"，AI 搜 "agent"）。需要调整策略：changelog 优先、搜索补充，并加入查询构造指引。

## 1. 更新 explore 模板

- [x] 1.1 修改 `templates/skills/explore.md` 的"检查上下文"部分：changelog 提前、搜索降级为补充、加查询构造指引
- [x] 1.2 同步修改 `templates/commands/explore.md` 的相同部分

## 2. 重新生成和验证

- [x] 2.1 运行 `pnpm generate` 重新生成 codegen 输出
- [x] 2.2 运行 `pnpm check` 确保通过
