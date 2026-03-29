# Schema Definition

## Purpose

定义内置 schema 结构规范，描述变更所需的 artifact 列表及其依赖关系，确保变更创建时生成正确的目录和文件。

## Requirements

### Requirement: System defines a built-in schema for artifact structure
系统 SHALL 提供一个内置的 schema 定义，描述变更所需的 artifact 列表、每个 artifact 的生成路径和依赖关系。

#### Scenario: Default schema includes standard artifacts
- **WHEN** 系统加载内置 schema
- **THEN** schema 包含 proposal、specs、design、tasks 四种 artifact 定义
- **AND** 每个 artifact 定义包含 `id`、`generates`（输出路径）、`requires`（依赖的 artifact ID 列表）字段

#### Scenario: Artifact dependency order is correct
- **WHEN** 系统解析内置 schema 的依赖关系
- **THEN** proposal 无依赖
- **AND** specs 依赖 proposal
- **AND** design 依赖 proposal
- **AND** tasks 依赖 specs 和 design
