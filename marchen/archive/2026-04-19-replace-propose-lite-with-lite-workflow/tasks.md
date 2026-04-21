## 1. 模板文件替换

- [x] 1.1 删除 `packages/config/templates/skills/propose-lite.md`
- [x] 1.2 创建 `packages/config/templates/skills/lite.md`，包含完整 lite 流程（创建变更 → 填充 tasks.md → 实现任务 → 询问归档）
- [x] 1.3 删除 `packages/config/templates/commands/propose-lite.md`
- [x] 1.4 创建 `packages/config/templates/commands/lite.md`，内容与 skill 版本对应

## 2. 重新生成 codegen

- [x] 2.1 运行 `pnpm generate`（在 packages/config 下），确认生成 `SKILL_LITE` / `COMMAND_LITE`，不再包含 `SKILL_PROPOSE_LITE` / `COMMAND_PROPOSE_LITE`

## 3. 更新测试

- [x] 3.1 更新 `packages/core/test/workspace.test.ts` 中的文件名断言（`marchen-propose-lite` → `marchen-lite`，`propose-lite.md` → `lite.md`）

## 4. 更新 spec

- [x] 4.1 删除 `openspec/specs/propose-lite-workflow/`
- [x] 4.2 创建 `openspec/specs/lite-workflow/spec.md`

## 5. 更新文档

- [x] 5.1 更新 `README.md` 中对 propose-lite 的引用
- [x] 5.2 更新 `CLAUDE.md` 中对 marchen-propose-lite 的引用
- [x] 5.3 更新 `packages/config/CLAUDE.md` 中模板文件列表

## 6. 验证

- [x] 6.1 运行 `pnpm build` 确认构建通过
- [x] 6.2 运行 `pnpm test` 确认测试通过
- [x] 6.3 运行 `pnpm check` 完整检查
