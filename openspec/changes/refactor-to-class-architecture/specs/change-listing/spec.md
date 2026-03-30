## MODIFIED Requirements

### Requirement: list 命令通过 ChangeManager 列出变更
CLI 的 list 命令 SHALL 通过 `ChangeManager` 实例列出变更。

#### Scenario: 列出变更
- **WHEN** 用户执行 `marchen list`
- **THEN** 创建 `Workspace` 和 `ChangeManager` 实例
- **THEN** 调用 `changeManager.list()` 获取变更列表
