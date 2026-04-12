## Why

MarchenSpec 有 propose、propose-lite、apply、explore 四组 skill/command 模板，但 archive 没有。用户归档变更时只能手动跑 `marchen archive <name>`，无法在 Claude Code 中通过 `/marchen:archive` 完成带完成度检查的归档流程。同时 CLI 的 archive 命令缺少 `--json` 输出，不支持 skill 消费。

## What Changes

- 新增 `archive` skill 模板（`.claude/skills/marchen-archive/SKILL.md`）
- 新增 `archive` command 模板（`.claude/commands/marchen/archive.md`）
- CLI `marchen archive` 命令增加 `--json` 选项，输出归档结果
- `ChangeManager.archive()` 返回 `ArchiveResult` 而非 void，并在目标目录已存在时抛出明确错误

## Capabilities

### New Capabilities
- `archive-skill`: archive skill/command 模板，归档前检查完成度、确认后调用 CLI 执行归档

### Modified Capabilities
- `change-creation`: `ChangeManager.archive()` 返回值变更 + 目标已存在检查

## Impact

- `packages/shared` — 新增 `ArchiveResult` 类型
- `packages/core` — `ChangeManager.archive()` 签名变更（返回 ArchiveResult）
- `apps/cli` — `archive.ts` 增加 `--json` 选项
- `packages/config` — 新增 `templates/skills/archive.md` + `templates/commands/archive.md`，codegen 生成 5 skill + 5 command
- `packages/core/test` — archive 测试更新 + workspace skill 数量断言更新
