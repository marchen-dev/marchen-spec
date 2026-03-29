## MODIFIED Requirements

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
