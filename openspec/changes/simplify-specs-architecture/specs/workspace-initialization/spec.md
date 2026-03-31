## MODIFIED Requirements

### Requirement: Workspace 初始化不再创建 main specs 目录
系统 SHALL NOT 在 `workspace.initialize()` 中创建 `marchenspec/specs/` 目录。

#### Scenario: 初始化工作区
- **WHEN** 用户执行 `marchen init`
- **THEN** 创建 `marchenspec/` 目录
- **AND** 创建 `marchenspec/changes/` 目录
- **AND** 创建 `marchenspec/changes/archive/` 目录
- **AND** 创建 `marchenspec/config.yaml` 文件
- **AND** NOT 创建 `marchenspec/specs/` 目录

#### Scenario: 验证初始化结果
- **WHEN** 初始化完成后
- **THEN** `marchenspec/specs/` 目录 SHALL NOT 存在
- **AND** 其他目录和文件正常创建
