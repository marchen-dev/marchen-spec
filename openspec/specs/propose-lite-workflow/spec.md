# propose-lite-workflow

## 目的

提供轻量级 propose-lite 命令和 skill，使用 lite schema 快速创建变更并填充 tasks.md。

## 需求

### 需求: marchen init SHALL 生成 propose-lite command 模板

`marchen init` 生成的 `.claude/commands/` 目录 MUST 包含 `marchen/propose-lite.md` 命令文件。

#### 场景: init 后存在 propose-lite 命令

- **WHEN** 执行 `marchen init` 完成后
- **THEN** `.claude/commands/marchen/propose-lite.md` 文件存在
- **AND** 文件内容引导 AI 使用 lite schema 创建变更

### 需求: marchen init SHALL 生成 propose-lite skill 模板

`marchen init` 生成的 `.claude/skills/` 目录 MUST 包含 `marchen-propose-lite/SKILL.md` skill 文件。

#### 场景: init 后存在 propose-lite skill

- **WHEN** 执行 `marchen init` 完成后
- **THEN** `.claude/skills/marchen-propose-lite/SKILL.md` 文件存在
- **AND** skill 描述表明其用于轻量变更

### 需求: propose-lite 流程 SHALL 使用 lite schema 创建变更并填充 tasks.md

propose-lite 命令/skill MUST 执行以下流程：创建 lite schema 变更，获取 tasks artifact 指令，填充 tasks.md。

#### 场景: 用户通过 propose-lite 创建变更

- **WHEN** 用户执行 `/marchen:propose-lite fix-typo`
- **THEN** 执行 `marchen new fix-typo --schema lite`
- **AND** 获取 tasks artifact 的 instruction 和 template
- **AND** 根据用户描述填充 tasks.md（包含背景章节和任务列表）
- **AND** 提示用户可用 `/marchen:apply` 开始实现

#### 场景: 未提供变更名称

- **WHEN** 用户执行 `/marchen:propose-lite` 不带参数
- **THEN** 用 AskUserQuestion 询问用户想做什么
- **AND** 从描述中提取 kebab-case 名称
