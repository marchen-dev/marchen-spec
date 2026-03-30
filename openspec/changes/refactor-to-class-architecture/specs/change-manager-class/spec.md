## ADDED Requirements

### Requirement: ChangeManager 类管理变更操作
系统 SHALL 提供 `ChangeManager` 类，接收 `Workspace` 实例，统一管理变更的增删查操作。

#### Scenario: 创建 ChangeManager 实例
- **WHEN** 调用 `new ChangeManager(workspace)`
- **THEN** 实例 SHALL 通过传入的 Workspace 获取路径上下文

### Requirement: ChangeManager 创建变更
系统 SHALL 通过 `ChangeManager.create(name)` 创建新变更。

#### Scenario: 成功创建变更
- **WHEN** 调用 `changeManager.create(name)` 且名称合法、项目已初始化、无重名
- **THEN** 创建变更目录、元数据文件和初始 artifact 文件

#### Scenario: 创建失败时抛出错误
- **WHEN** 调用 `changeManager.create(name)` 但未初始化、名称不合法或已存在
- **THEN** 抛出 `MarchenSpecError`

### Requirement: ChangeManager 列出变更
系统 SHALL 通过 `ChangeManager.list()` 列出所有 open 变更。

#### Scenario: 列出变更
- **WHEN** 调用 `changeManager.list()`
- **THEN** 返回 `ChangeMetadata[]`，按创建时间降序排列
- **THEN** 排除 `archive` 目录，跳过缺失元数据的目录

### Requirement: 变更名称校验为静态方法
系统 SHALL 通过 `ChangeManager.isValidName(name)` 提供名称校验。

#### Scenario: 校验变更名称
- **WHEN** 调用 `ChangeManager.isValidName(name)`
- **THEN** 返回 `boolean` 表示名称是否为合法的 kebab-case 格式
