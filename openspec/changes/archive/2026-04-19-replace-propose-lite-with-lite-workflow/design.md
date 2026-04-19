## Context

当前 skill 模板体系中，lite 工作流被拆分为三个独立 skill：`propose-lite`（创建 tasks.md）、`apply`（实现任务）、`archive`（归档）。用户需要手动依次调用。

模板文件通过 `packages/config/scripts/generate-templates.ts` 从 `templates/skills/*.md` 和 `templates/commands/*.md` 自动生成 TypeScript 常量，文件名直接决定导出的常量名和映射 key。

## Goals / Non-Goals

**Goals:**

- 将 lite 工作流合并为单个 `lite` skill/command，一次调用完成全流程
- 删除 `propose-lite` 模板，用 `lite` 替代
- 保持 `apply` 和 `archive` 作为独立 skill（用于 full schema 或断点续做）

**Non-Goals:**

- 不修改 codegen 脚本逻辑（文件名变了，生成逻辑不变）
- 不修改 core 包的 `Workspace` 类逻辑（它只是遍历 `SKILL_TEMPLATES` 映射）
- 不处理已有用户项目中残留的旧 `marchen-propose-lite` 目录

## Decisions

**1. 文件命名：`lite.md` 而非 `propose-lite.md`**

这个 skill 不再只是 "propose"，而是完整流程。`lite` 与 schema 名一致，语义清晰。

生成结果：
- 常量名：`SKILL_LITE` / `COMMAND_LITE`
- 映射 key：`'lite'`
- Skill 目录：`marchen-lite`
- Command 文件：`lite.md`

**2. apply 逻辑内联到 lite 模板**

lite 模板是给 AI 的指令文本，不存在"调用另一个 skill"的机制。直接在模板中描述 apply 流程（精简版，去掉"选择变更"步骤，因为变更名已知）。

**3. 暂停时流程结束，不询问归档**

暂停意味着任务未全部完成，归档不合适。用户解决问题后可用 `/marchen:apply` 继续，完成后再用 `/marchen:archive` 归档。

**4. 归档前不再调用 `marchen status --json` 检查完成度**

在组合流程中，刚刚完成了所有任务，无需重复检查。直接生成摘要并归档。

## Risks / Trade-offs

- 模板长度从 ~90 行增长到 ~120 行，仍在可控范围
- 已 init 的项目会保留旧的 `marchen-propose-lite` 目录，不影响功能但略显杂乱
- `openspec/specs/propose-lite-workflow/` 需要删除，由 `lite-workflow` 替代
