## Purpose

定义 `marchenspec init` 命令的行为规范，包括目录结构创建、配置文件生成和用户交互体验。

## Requirements

### Requirement: 用户可以初始化 OpenSpec 目录结构
系统 SHALL 提供 `marchenspec init` 命令，在当前工作区根目录下创建标准的 OpenSpec 目录结构和默认配置文件。

#### Scenario: 在新项目中初始化
- **WHEN** 用户在不包含 `openspec/` 目录的项目中执行 `marchenspec init`
- **THEN** 系统创建 `openspec/` 目录
- **AND** 创建 `openspec/config.yaml`，内容包含 `schema: spec-driven` 默认配置
- **AND** 创建 `openspec/specs/` 目录
- **AND** 创建 `openspec/changes/` 目录
- **AND** 创建 `openspec/changes/archive/` 目录

#### Scenario: 在已初始化的项目中执行 init
- **WHEN** 用户在已包含 `openspec/` 目录的项目中执行 `marchenspec init`
- **THEN** 系统提示用户 OpenSpec 目录已存在
- **AND** 询问用户是否覆盖

#### Scenario: 使用 --force 强制初始化
- **WHEN** 用户执行 `marchenspec init --force`
- **AND** `openspec/` 目录已存在
- **THEN** 系统跳过确认直接重新创建目录结构和配置文件

### Requirement: init 命令提供用户友好的交互体验
系统 SHALL 在 init 过程中使用 @clack/prompts 提供清晰的进度反馈和交互确认。

#### Scenario: 初始化成功时的输出
- **WHEN** 初始化操作成功完成
- **THEN** 系统展示 intro 标题
- **AND** 显示创建完成的确认消息

#### Scenario: 已存在时询问确认
- **WHEN** 系统检测到 `openspec/` 目录已存在且未传入 `--force`
- **THEN** 使用 @clack/prompts 的 confirm 组件询问用户
- **AND** 用户拒绝时终止操作并显示取消消息

---

## MODIFIED Requirements (refactor-to-class-architecture)

### Requirement: init 命令通过 Workspace 初始化
CLI 的 init 命令 SHALL 通过 `Workspace` 实例执行初始化检查和初始化操作。

#### Scenario: 交互式初始化
- **WHEN** 用户执行 `marchen init` 且目录已存在
- **THEN** 使用 `workspace.isInitialized()` 检查状态
- **THEN** 确认后调用 `workspace.initialize()` 执行初始化

#### Scenario: 强制初始化
- **WHEN** 用户执行 `marchen init --force`
- **THEN** 直接调用 `workspace.initialize()` 跳过确认
