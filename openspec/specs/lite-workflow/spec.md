# lite-workflow

## 目的

提供一键式 lite 工作流 skill/command，整合创建变更、实现任务、询问归档为一个连贯流程。

## 需求

### 需求: marchen init SHALL 生成 lite skill 模板

`marchen init` 生成的 `.claude/skills/` 目录 MUST 包含 `marchen-lite/SKILL.md` skill 文件。

#### 场景: init 后存在 lite skill

- **WHEN** 执行 `marchen init` 完成后
- **THEN** `.claude/skills/marchen-lite/SKILL.md` 文件存在
- **AND** skill 描述表明其用于一键式轻量变更流程

### 需求: marchen init SHALL 生成 lite command 模板

`marchen init` 生成的 `.claude/commands/` 目录 MUST 包含 `marchen/lite.md` 命令文件。

#### 场景: init 后存在 lite 命令

- **WHEN** 执行 `marchen init` 完成后
- **THEN** `.claude/commands/marchen/lite.md` 文件存在

### 需求: lite 流程 SHALL 使用 lite schema 创建变更并填充 tasks.md

lite skill/command MUST 使用 lite schema 创建变更，获取 tasks artifact 指令，填充 tasks.md。

#### 场景: 用户通过 lite 创建变更

- **WHEN** 用户执行 `/marchen:lite fix-typo`
- **THEN** 执行 `marchen new fix-typo --schema lite`
- **AND** 获取 tasks artifact 的 instruction 和 template
- **AND** 根据用户描述填充 tasks.md（包含背景章节和任务列表）

#### 场景: 未提供变更名称

- **WHEN** 用户执行 `/marchen:lite` 不带参数
- **THEN** 用 AskUserQuestion 询问用户想做什么
- **AND** 从描述中提取 kebab-case 名称

### 需求: lite 流程 SHALL 在 tasks.md 填充后自动开始实现

tasks.md 创建完成后，MUST 自动获取 apply 指令并逐个实现任务，无需用户手动调用 apply。

#### 场景: tasks.md 填充后自动实现

- **WHEN** tasks.md 填充完成
- **THEN** 调用 `marchen instructions <name> apply --json` 获取实现指令
- **AND** 显示进度信息
- **AND** 逐个实现任务并勾选 checkbox

#### 场景: 实现中途暂停

- **WHEN** 任务不清晰、发现设计问题、或遇到错误
- **THEN** 显示暂停原因
- **AND** 流程结束，不询问归档

### 需求: lite 流程 SHALL 在全部任务完成后询问是否归档

所有任务完成后，MUST 用 AskUserQuestion 询问用户是否归档。

#### 场景: 全部完成后用户选择归档

- **WHEN** 所有任务实现完成
- **THEN** 用 AskUserQuestion 询问"是否归档这个变更？"
- **AND** 用户选择归档时，生成摘要并执行 `marchen archive <name> --summary "<摘要>" --json`
- **AND** 显示归档结果

#### 场景: 全部完成后用户选择暂不归档

- **WHEN** 所有任务实现完成
- **AND** 用户选择暂不归档
- **THEN** 显示提示信息，告知后续可用 `/marchen:archive` 归档
