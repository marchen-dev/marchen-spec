## 背景

新增 review skill，作为独立的工作流步骤（和 archive 同级），用于 apply 完成后对照变更意图检查代码实现的完整性和一致性。review 通过 sub-agent 执行，避免 diff 污染主会话 context。同时修改 apply 模板的完成提示语，引导用户使用 review。

## 1. 新增 review 模板文件

- [x] 1.1 新建 `packages/config/templates/skills/review.md`
- [x] 1.2 新建 `packages/config/templates/commands/review.md`

## 2. 修改 apply 模板提示语

- [x] 2.1 修改 `packages/config/templates/skills/apply.md` 步骤 5 的完成提示，加入 review 引导
- [x] 2.2 修改 `packages/config/templates/commands/apply.md` 步骤 5 的完成提示，加入 review 引导

## 3. 重新生成 codegen 产物

- [x] 3.1 执行 `pnpm generate` 重新生成 `src/generated/` 下的 TS 常量
- [x] 3.2 执行 `pnpm build` 确认构建通过
