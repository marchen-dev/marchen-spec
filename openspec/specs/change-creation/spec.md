# Change Creation

## Purpose

定义变更创建的命令行接口和元数据管理规范，确保变更目录结构一致且包含必要的上下文信息。

## Requirements

### Requirement: CLI provides a command to create a new change
CLI SHALL 提供 `marchen new <name>` 命令，用于在 marchenspec/changes/ 目录下创建一个新的变更，包含完整的目录结构和初始制品文件。

#### Scenario: Create a change with a valid name
- **WHEN** 用户执行 `marchen new my-feature`
- **THEN** 系统在 `marchenspec/changes/my-feature/` 下创建变更目录
- **AND** 目录中包含 `.metadata.yaml` 元数据文件
- **AND** 目录中包含根据 schema 定义生成的初始 artifact 文件（proposal.md, design.md, tasks.md）
- **AND** 目录中包含 `specs/` 子目录

#### Scenario: Reject creation when change name already exists
- **WHEN** 用户执行 `marchen new my-feature` 且 `marchenspec/changes/my-feature/` 已存在
- **THEN** 系统提示该变更已存在并终止操作

#### Scenario: Reject creation when MarchenSpec is not initialized
- **WHEN** 用户执行 `marchen new my-feature` 且当前项目未执行过 `marchen init`
- **THEN** 系统提示需要先执行 `marchen init` 并终止操作

#### Scenario: Validate change name format
- **WHEN** 用户提供的变更名称不符合 kebab-case 格式
- **THEN** 系统提示名称格式要求并终止操作

### Requirement: Change metadata records creation context
每个变更 SHALL 包含一个 `.metadata.yaml` 文件，记录变更的名称、使用的 schema、创建时间和当前状态。

#### Scenario: Metadata file is written on creation
- **WHEN** 变更创建成功
- **THEN** `.metadata.yaml` 包含 `name`（变更名称）、`schema`（schema 名称）、`createdAt`（ISO 时间戳）、`status`（初始值为 `open`）字段

#### Scenario: Metadata is valid YAML
- **WHEN** 系统读取 `.metadata.yaml`
- **THEN** 文件内容可被正确解析为 YAML 对象

---

## MODIFIED Requirements (refactor-to-class-architecture)

### Requirement: new 命令通过 ChangeManager 创建变更
CLI 的 new 命令 SHALL 通过 `ChangeManager` 实例创建变更。

#### Scenario: 创建变更
- **WHEN** 用户执行 `marchen new <name>`
- **THEN** 创建 `Workspace` 和 `ChangeManager` 实例
- **THEN** 调用 `changeManager.create(name)` 执行创建
