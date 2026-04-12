## Why

内置 schema 命名不对称：`spec-driven` 描述方法论，`rapid` 描述速度，放在一起选择时语义不统一。改为 `full` / `lite` 在同一维度（流程重量）上形成对比。

同时，lite schema 缺少对应的 skill/command 入口，用户无法通过 `/marchen:propose-lite` 快速创建轻量变更。

## What Changes

- **BREAKING**: schema 名称 `spec-driven` → `full`，`rapid` → `lite`
- **BREAKING**: `DEFAULT_SCHEMA_NAME` 从 `'spec-driven'` 改为 `'full'`
- 全局替换代码、测试、文档、skill/command 模板中的 schema 名称引用
- 新增 `propose-lite` command 模板和 `marchen-propose-lite` skill 模板
- `marchen init` 生成的 `.claude/` 目录包含新的 propose-lite 入口

## Capabilities

### New Capabilities
- `propose-lite-workflow`: propose-lite command/skill 模板，用于 lite schema 的快速变更创建

### Modified Capabilities
- `multi-schema-support`: schema 名称从 spec-driven/rapid 改为 full/lite
- `change-creation`: CLI `--schema` 选项的 choices 更新

## Impact

- `packages/shared` — 无代码改动，常量不涉及 schema 名
- `packages/config` — schema.ts（SCHEMAS key、name、DEFAULT_SCHEMA_NAME）、CLAUDE.md、templates/（新增 propose-lite 模板）
- `packages/core` — change-manager.ts 注释、测试中的 schema 名字面量
- `apps/cli` — new.ts / status.ts 中的 schema 名引用
- `.claude/skills/` 和 `.claude/commands/` — 现有模板中的 schema 名 + 新增 propose-lite
- `docs/` 和 `openspec/specs/` — 文档中的 schema 名引用
