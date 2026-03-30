## MODIFIED Requirements

### Requirement: 基础检查改为 Workspace 类方法
`inspectFoundation()` 和 `getFoundationStatus()` SHALL 改为 `Workspace` 类的方法或属性。

#### Scenario: 获取基础信息
- **WHEN** 调用 `workspace.root`、`workspace.specDir`、`workspace.changeDir`
- **THEN** 返回对应的路径信息

#### Scenario: 获取包边界信息
- **WHEN** 调用 `workspace.packageBoundaries`
- **THEN** 返回 `PackageBoundary[]` 列表
