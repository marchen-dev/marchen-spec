## ADDED Requirements

### Requirement: Repository provides a workspace-based foundation
仓库 SHALL 以 pnpm workspace monorepo + Turborepo orchestration 的方式组织，使 MarchenSpec CLI app 与内部 packages 能通过统一的 repository workflow 进行开发、构建、测试与校验。

#### Scenario: Workspace structure is present
- **WHEN** a developer inspects the repository root
- **THEN** 仓库中存在面向 `apps/*` 与 `packages/*` 的 workspace 配置
- **AND** 仓库中存在用于 shared workspace tasks 的 Turbo 配置

#### Scenario: Shared repository tasks are available
- **WHEN** a developer runs repository-level development scripts
- **THEN** workspace 对外暴露一致的 build、test、lint、format、typecheck 命令
- **AND** 这些命令通过 shared orchestration 作用于 app 与 package workspaces

### Requirement: CLI app is separated from internal modules
仓库 SHALL 定义独立的 CLI application package 与内部 packages，使 command parsing、workflow logic、file-system logic、configuration logic 与 shared utility 可以独立演进。

#### Scenario: CLI package is isolated from workflow internals
- **WHEN** the CLI entrypoint is implemented
- **THEN** command registration 与 terminal interaction 位于 CLI application package 中
- **AND** workflow behavior 通过内部 packages 调用，而不是直接写在 CLI shell 中

#### Scenario: Internal package boundaries are defined
- **WHEN** a developer inspects the workspace packages
- **THEN** 仓库中包含面向 core workflow logic、file-system operations、configuration handling 与 shared primitives 的内部 packages

#### Scenario: fs 包提供完整的文件系统操作
- **WHEN** 开发者需要执行文件系统操作时
- **THEN** 所有文件操作通过 `@marchen-spec/fs` 包提供的 API 完成
- **AND** 其他包不直接使用 Node.js `fs` 模块

### Requirement: Workspace uses a modern TypeScript build pipeline
仓库 SHALL 使用 ESM-first TypeScript，并结合 shared base configuration 与 package-level build configuration，使各 workspace 在不复制 compiler policy 的前提下保持一致编译行为。

#### Scenario: Shared TypeScript baseline exists
- **WHEN** a workspace package defines its TypeScript configuration
- **THEN** 它会继承 shared root TypeScript base configuration
- **AND** 该 shared configuration 为整个仓库定义公共 compiler baseline

#### Scenario: Package builds use the selected bundler
- **WHEN** a developer builds the CLI app or an internal package
- **THEN** workspace 使用 `tsdown` 作为 package build tool
- **AND** build configuration 保持 package-local，同时继承 shared repository convention

### Requirement: Formatting and linting responsibilities are separated
仓库 SHALL 使用 Prettier 作为 formatting authority，使用 ESLint 作为 linting authority，避免自动修复职责重叠或冲突。

#### Scenario: Prettier owns formatting
- **WHEN** a developer formats repository files
- **THEN** formatting 由 shared `@suemor/prettier-config` preset 驱动
- **AND** repository-level Prettier option 可以关闭当前项目不需要的特性

#### Scenario: ESLint does not perform formatting duties
- **WHEN** a developer runs linting
- **THEN** linting 由 `@antfu/eslint-config` 驱动
- **AND** 与 Prettier 冲突的 stylistic 或 formatter-style 行为被关闭

### Requirement: Repository supports testing and release preparation
仓库 SHALL 提供 automated testing 与 version preparation 的基础工具链，使 CLI 可以在可重复的质量与 release workflow 下持续演进。

#### Scenario: Test runner is standardized
- **WHEN** a developer adds or runs automated tests
- **THEN** 仓库使用 `vitest` 作为 workspace packages 的 shared test runner

#### Scenario: Version workflow is defined
- **WHEN** a maintainer prepares a release
- **THEN** 仓库提供基于 `bumpp` 的 version bump workflow
- **AND** 该 workflow 能兼容以 CLI package 作为主要发布产物
