## 动机

当前 `marchen init` 硬编码生成 `.claude/skills/` 和 `.claude/commands/` 文件，只支持 Claude Code。随着 AI 编码工具生态的发展（Codex、Gemini CLI、Cursor、Windsurf 等），用户可能同时使用多个工具。这些工具都采用了相同的 SKILL.md 格式，只是目录路径不同（`.claude/skills/`、`.codex/skills/`、`.gemini/skills/` 等）。

需要让 `init` 支持多工具选择，先实现 Claude Code + Codex，同时建立可扩展的 provider 架构，后续添加新工具只需注册一条记录。

## 变更内容

1. 在 shared 包新增 `AgentProvider` 类型定义
2. 在 config 包新增 `AGENT_PROVIDERS` 注册表，内置 Claude Code 和 Codex 两个 provider
3. 改造 `Workspace.initialize()` 接收 providers 参数，根据选中的 provider 生成对应目录下的 skills（和 commands，仅 Claude Code）
4. 改造 `init` 命令，增加 `@clack/prompts` 多选交互让用户选择 AI 工具
5. 将选中的 providers 持久化到 `marchen/config.yaml`

## 能力

### 新增能力

- `agent-provider-registry`：AgentProvider 类型和内置 provider 注册表
- `multi-provider-init`：init 命令的多工具选择交互和多目录生成

### 修改能力

- 无（现有行为作为 Claude Code provider 的默认行为保留）

## 影响范围

- `packages/shared/src/types.ts` — 新增 AgentProvider 类型
- `packages/config/src/` — 新增 providers.ts 注册表，index.ts 导出
- `packages/core/src/workspace.ts` — initialize() 签名变更，generateSkills/generateCommands 参数化
- `apps/cli/src/commands/init.ts` — 增加多选交互
- `marchen/config.yaml` 的 schema — 新增 providers 字段
