## ADDED Requirements

### Requirement: 列出 open 状态的变更
当用户执行 `marchen list` 时，系统 SHALL 展示工作区内所有 open 状态的变更。

#### Scenario: 已初始化的工作区中存在 open 变更
- **WHEN** 用户执行 `marchen list` 且存在 open 变更
- **THEN** 系统展示格式化的表格，包含列：名称、Schema、创建时间（相对时间）
- **THEN** 变更按创建时间降序排列（最新的在前）

#### Scenario: 已初始化的工作区中无变更
- **WHEN** 用户执行 `marchen list` 且不存在 open 变更
- **THEN** 系统展示无变更的提示信息
- **THEN** 系统建议执行 `marchen new <name>` 创建变更

#### Scenario: 未初始化的工作区
- **WHEN** 用户执行 `marchen list` 且 MarchenSpec 尚未初始化
- **THEN** 系统展示未初始化的错误提示
- **THEN** 系统以非零退出码退出

### Requirement: 跳过无效的变更目录
系统 SHALL 优雅地处理缺少 `.metadata.yaml` 的变更目录。

#### Scenario: 变更目录缺少元数据文件
- **WHEN** `marchenspec/changes/` 下存在目录但没有 `.metadata.yaml`
- **THEN** 该目录不出现在列表输出中
- **THEN** 向用户展示一条警告信息

### Requirement: 排除 archive 目录
系统在列出变更时 SHALL NOT 包含 `archive` 子目录。

#### Scenario: archive 目录与 open 变更并存
- **WHEN** 用户执行 `marchen list` 且 `marchenspec/changes/` 下存在 `archive` 目录
- **THEN** `archive` 目录不作为变更被列出

---

## MODIFIED Requirements (refactor-to-class-architecture)

### Requirement: list 命令通过 ChangeManager 列出变更
CLI 的 list 命令 SHALL 通过 `ChangeManager` 实例列出变更。

#### Scenario: 列出变更
- **WHEN** 用户执行 `marchen list`
- **THEN** 创建 `Workspace` 和 `ChangeManager` 实例
- **THEN** 调用 `changeManager.list()` 获取变更列表
