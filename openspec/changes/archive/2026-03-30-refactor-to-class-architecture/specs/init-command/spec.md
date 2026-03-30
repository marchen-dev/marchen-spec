## MODIFIED Requirements

### Requirement: init 命令通过 Workspace 初始化
CLI 的 init 命令 SHALL 通过 `Workspace` 实例执行初始化检查和初始化操作。

#### Scenario: 交互式初始化
- **WHEN** 用户执行 `marchen init` 且目录已存在
- **THEN** 使用 `workspace.isInitialized()` 检查状态
- **THEN** 确认后调用 `workspace.initialize()` 执行初始化

#### Scenario: 强制初始化
- **WHEN** 用户执行 `marchen init --force`
- **THEN** 直接调用 `workspace.initialize()` 跳过确认
