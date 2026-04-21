## ADDED Requirements

### Requirement: CLI 提供 archive 命令归档已完成的变更
CLI SHALL 提供 `marchen archive <name>` 命令，将活跃变更移动到 archive 目录。

#### Scenario: 归档一个存在的变更
- **WHEN** 用户执行 `marchen archive my-feature`
- **AND** `marchenspec/changes/my-feature/` 存在
- **THEN** 目录移动到 `marchenspec/changes/archive/YYYY-MM-DD-my-feature/`
- **AND** `.metadata.yaml` 的 `status` 更新为 `archived`
- **AND** `.metadata.yaml` 添加 `archivedAt` 时间戳

#### Scenario: 归档不存在的变更
- **WHEN** 用户执行 `marchen archive non-existent`
- **AND** `marchenspec/changes/non-existent/` 不存在
- **THEN** 系统提示变更不存在并终止操作

#### Scenario: 归档不执行 sync
- **WHEN** 变更被归档
- **THEN** 系统 SHALL NOT 将 delta specs 合并到 main specs
- **AND** archive 目录中的 specs/ 保持原样
