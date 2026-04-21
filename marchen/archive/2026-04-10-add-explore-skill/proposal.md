## Why

MarchenSpec 的工作流目前只有「提出变更」和「实现变更」两个 skill（propose / apply）。缺少一个「动手之前先想清楚」的入口。用户在面对模糊需求、技术选型、架构探索时，没有一个结构化的思考伙伴模式。

## What Changes

- 新增 `explore` skill 模板（`packages/config/templates/skills/explore.md`）
- 新增 `explore` command 模板（`packages/config/templates/commands/explore.md`）
- codegen 脚本自动识别新模板，无需修改
- `marchen init` 生成的项目会自动包含 `/marchen:explore` skill

## Capabilities

### New Capabilities
- `explore-skill`: explore skill 和 command 模板的内容规格

### Modified Capabilities

（无）

## Impact

- `packages/config/templates/skills/explore.md` — 新增文件
- `packages/config/templates/commands/explore.md` — 新增文件
- `packages/config/src/generated/` — codegen 自动更新（build 时重新生成）
- 不影响 CLI 命令、core、shared、fs 包
- 不影响现有 propose/apply skill
