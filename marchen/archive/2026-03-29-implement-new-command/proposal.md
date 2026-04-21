## Why

MarchenSpec 目前只有 `marchen init` 命令，初始化之后工具就没有下一步可做了。`new` 命令是整个规范驱动工作流的入口——没有它，用户无法创建变更、无法开始任何工作流循环。

## What Changes

- 新增 `marchen new <name>` CLI 命令，用于创建变更（change）目录和初始制品文件
- 在 shared 包中新增 Change 相关类型定义（ChangeMetadata、ArtifactDefinition 等）
- 在 config 包中新增内置 schema 定义（硬编码 artifact 列表和依赖关系，集中管理）
- 在 core 包中新增 `createChange()` 用例，处理变更创建的业务逻辑
- 在 core 包中新增内置模板内容，用于生成初始 artifact 文件

## Capabilities

### New Capabilities
- `change-creation`: 创建变更目录结构、写入元数据文件、根据 schema 生成初始 artifact 文件
- `schema-definition`: 内置 schema 定义，描述 artifact 列表、依赖关系和生成路径

### Modified Capabilities
_无需修改现有规范_

## Impact

- **packages/shared**: 新增类型定义（ChangeMetadata, ChangeStatus, ArtifactDefinition, SchemaDefinition）
- **packages/config**: 新增 schema 常量定义和模板内容
- **packages/core**: 新增 createChange() 函数，依赖 config 和 fs 包
- **apps/cli**: 新增 `new` 命令注册，使用 @clack/prompts 处理交互
- **packages/fs**: 无需修改，现有能力（ensureDir, writeFile, writeYaml）已满足需求
