## Why

当前 lite 工作流需要用户手动调用三个 skill（propose-lite → apply → archive），对于小改动来说摩擦过大。lite schema 本身就是为"快速搞定"设计的，中间的手动衔接是多余的。优化为一键式流程：创建 tasks.md 后自动开始实现，全部完成后询问是否归档。

## What Changes

- 删除 `propose-lite` skill/command 模板（`templates/skills/propose-lite.md`、`templates/commands/propose-lite.md`）
- 新增 `lite` skill/command 模板（`templates/skills/lite.md`、`templates/commands/lite.md`），整合 propose + apply + 归档询问为一个连贯流程
- codegen 自动重新生成（`SKILL_PROPOSE_LITE` → `SKILL_LITE`）
- 更新 spec、README、CLAUDE.md 中的相关引用
- 更新测试中的文件名断言

## Capabilities

### New Capabilities

- `lite-workflow`：一键式 lite 工作流 skill/command，整合创建变更、实现任务、询问归档

### Modified Capabilities

（无——`propose-lite-workflow` 被完全替代删除，不是修改）

## Impact

- `packages/config/templates/skills/` — 删除 propose-lite.md，新增 lite.md
- `packages/config/templates/commands/` — 删除 propose-lite.md，新增 lite.md
- `packages/config/src/generated/` — codegen 自动重新生成
- `packages/core/test/workspace.test.ts` — 更新文件名断言
- `openspec/specs/propose-lite-workflow/` — 删除，由 lite-workflow 替代
- `README.md`、`CLAUDE.md`、`packages/config/CLAUDE.md` — 更新引用
