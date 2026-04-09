## Context

MarchenSpec 的 skill 体系由两层组成：
- `templates/skills/*.md` — 给 `marchen init` 生成到项目 `.kiro/skills/` 目录的模板
- `templates/commands/*.md` — 给 IDE command 用的模板（有 `ARGUMENTS: $ARGUMENTS`）

两者内容主体一致，区别在 frontmatter 和末尾的 ARGUMENTS 占位符。codegen 脚本 `generate-templates.ts` 自动扫描这两个目录，生成 TypeScript 常量文件。

现有 skill：propose（创建变更）、apply（实现任务）。

## Goals / Non-Goals

**Goals:**
- 添加 explore skill/command 模板，让 `marchen init` 生成的项目包含 `/marchen:explore`
- 模板内容已在 explore 阶段确定，直接写入

**Non-Goals:**
- 不修改 codegen 脚本（它自动扫描 .md 文件）
- 不修改 CLI 命令
- 不修改 core/shared/fs 包
- 不添加新的 CLI 子命令

## Decisions

### 两份模板保持内容一致

和 propose/apply 的模式一致：skills/ 和 commands/ 各一份，内容主体相同。

区别：
- `skills/explore.md`：frontmatter 只有 `name`（`marchen-explore`）和 `description`，无 ARGUMENTS
- `commands/explore.md`：frontmatter 有 `name`（`Marchen: Explore`）、`description`、`category`、`tags`，末尾有 `ARGUMENTS: $ARGUMENTS`

### 中文为主、英文术语的语言风格

和现有 propose/apply 模板保持一致。

### 不硬编码 schema 或依赖图

explore 是自由思考模式，不需要预置 MarchenSpec 内部概念。LLM 在需要时会通过 `marchen list --json` / `marchen status` 自行获取。

## Risks / Trade-offs

- [模板内容过长] → explore 模板比 propose/apply 长（~120 行 vs ~80 行），因为需要描述「姿态」而非「步骤」。可接受，不影响性能
- [codegen 兼容性] → generate-templates.ts 按文件名生成常量，新增 explore.md 会自动生成 `SKILL_EXPLORE` / `COMMAND_EXPLORE`，无需改动
