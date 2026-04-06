## Why

MarchenSpec 的 CLI 基础设施（status + instructions 命令）已完成，但用户还无法通过 AI 工作流自动创建变更的所有 artifact。目前需要手动运行多个命令并手写每个 artifact。需要一个 `marchen-propose` skill，让用户一句话描述需求就能自动生成 proposal → specs → design → tasks 全套 artifact。

同时，skill 文件需要通过 `marchen init` 自动生成到用户项目的 `.claude/skills/` 目录，而不是手动复制。这要求改造 init 命令和建立 skill 模板的存储与构建机制。

## What Changes

- 在 `packages/config/templates/` 下新增 skill 和 command 的 markdown 源文件
- 新增 codegen 脚本，构建时将 .md 文件转为 TypeScript 常量（解决 cli bundle 无法打包静态文件的问题）
- config 包新增 `skills.ts` 和 `commands.ts` 导出 skill/command 模板
- 改造 `Workspace.initialize()` 在 init 时生成 `.claude/skills/` 和 `.claude/commands/` 文件
- 编写 `marchen-propose` skill 内容（从 openspec-propose 魔改，中文，调 marchen CLI）

## Capabilities

### New Capabilities
- `skill-template-codegen`: skill/command 模板的存储、codegen 构建和导出机制
- `init-skill-generation`: init 命令改造，自动生成 skill 和 command 文件到用户项目
- `propose-skill`: marchen-propose skill 的内容编写

### Modified Capabilities

（无）

## Impact

- `packages/config`：新增 templates/ 目录、scripts/ 目录、generated/ 目录、skills.ts、commands.ts；package.json 构建流程变更
- `packages/core`：Workspace.initialize() 增加 skill/command 生成逻辑
- `apps/cli`：init 命令输出提示调整
- 用户项目：`marchen init` 后会在 `.claude/skills/` 和 `.claude/commands/` 下生成文件
