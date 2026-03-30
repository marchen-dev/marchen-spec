## MODIFIED Requirements

### Requirement: new 命令通过 ChangeManager 创建变更
CLI 的 new 命令 SHALL 通过 `ChangeManager` 实例创建变更。

#### Scenario: 创建变更
- **WHEN** 用户执行 `marchen new <name>`
- **THEN** 创建 `Workspace` 和 `ChangeManager` 实例
- **THEN** 调用 `changeManager.create(name)` 执行创建
