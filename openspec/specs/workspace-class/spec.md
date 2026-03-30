## ADDED Requirements

### Requirement: Workspace 类提供工作区上下文
系统 SHALL 提供 `Workspace` 类作为工作区的统一上下文入口。

#### Scenario: 创建 Workspace 实例
- **WHEN** 调用方创建 `new Workspace()` 实例
- **THEN** 实例 SHALL 提供 `root`、`specDir`、`changeDir` 三个只读属性
- **THEN** 路径 SHALL 在构造时一次性计算完成

### Requirement: Workspace 提供初始化检查
系统 SHALL 通过 `Workspace` 实例的方法检查和执行初始化。

#### Scenario: 检查初始化状态
- **WHEN** 调用 `workspace.isInitialized()`
- **THEN** 返回 `boolean` 表示 marchenspec 目录是否存在

#### Scenario: 执行初始化
- **WHEN** 调用 `workspace.initialize()`
- **THEN** 创建标准目录结构和默认配置文件
