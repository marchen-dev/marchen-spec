# archive-skill

## 需求

### 需求: marchen init SHALL 生成 archive skill 模板

`marchen init` 生成的 `.claude/skills/` 目录 MUST 包含 `marchen-archive/SKILL.md` skill 文件。

#### 场景: init 后存在 archive skill

- **WHEN** 执行 `marchen init` 完成后
- **THEN** `.claude/skills/marchen-archive/SKILL.md` 文件存在
- **AND** skill 描述表明其用于归档已完成的变更

### 需求: marchen init SHALL 生成 archive command 模板

`marchen init` 生成的 `.claude/commands/` 目录 MUST 包含 `marchen/archive.md` 命令文件。

#### 场景: init 后存在 archive command

- **WHEN** 执行 `marchen init` 完成后
- **THEN** `.claude/commands/marchen/archive.md` 文件存在

### 需求: archive skill SHALL 在归档前检查完成度

skill MUST 调用 `marchen status <name> --json` 检查 artifact 和 task 完成状态。

#### 场景: 全部完成时直接归档

- **WHEN** 所有 artifact status 为 `done` 且所有 task 已完成
- **THEN** 直接执行 `marchen archive <name>`
- **AND** 不显示警告

#### 场景: 有未完成项时警告并确认

- **WHEN** 存在未完成的 artifact 或 task
- **THEN** 显示警告列出未完成项
- **AND** 用 AskUserQuestion 确认是否继续
- **AND** 用户确认后执行归档，不阻塞

### 需求: 归档变更

系统 SHALL 将已完成的变更移动到 archive 目录，更新元数据，并写入 changelog 条目。

#### 场景: 带 summary 归档

- **WHEN** 用户执行 `marchen archive <name> --summary "摘要文本"`
- **THEN** 移动变更到 `archive/YYYY-MM-DD-<name>/`，更新 metadata status 为 archived，追加带摘要的条目到 changelog.md

#### 场景: 不带 summary 归档

- **WHEN** 用户执行 `marchen archive <name>`
- **THEN** 移动变更到 `archive/YYYY-MM-DD-<name>/`，更新 metadata status 为 archived，追加仅含名称链接的条目到 changelog.md

#### 场景: JSON 输出

- **WHEN** 用户执行 `marchen archive <name> --json`
- **THEN** 输出 JSON 格式的 ArchiveResult

### 需求: archive skill SHALL 在未提供名称时让用户选择

skill MUST 调用 `marchen list --json` 获取 open 变更列表，用 AskUserQuestion 让用户选择。

#### 场景: 未提供变更名称

- **WHEN** 用户执行 `/marchen:archive` 不带参数
- **THEN** 调用 `marchen list --json` 获取变更列表
- **AND** 用 AskUserQuestion 让用户选择
- **AND** 不自动猜测或选择
