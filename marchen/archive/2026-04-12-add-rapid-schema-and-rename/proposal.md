## 动机

MarchenSpec 目前只有一个 `spec-driven` schema（proposal → specs → design → tasks），所有变更都必须走完整流程。对于 bug 修复、小改动、explore 之后的快速执行等场景，这个流程太重了。

同时，`marchenspec/` 目录名过长，改为 `marchen/` 更简洁。

两个改动都涉及 schema/config 层的 breaking change，合并一次完成。

## 变更内容

- 重构 `ArtifactDefinition` 类型，将 template 和 instruction 内聚到 artifact 定义中
- 废弃 `ARTIFACT_TEMPLATES` 和 `ARTIFACT_INSTRUCTIONS` 两个 flat map
- 新增 `SCHEMAS` map，内置 `spec-driven` 和 `rapid` 两个 schema
- `rapid` schema 只有一个 artifact：tasks（带背景章节的模板）
- `marchen new` 命令新增 `--schema` 选项
- `ChangeManager` 按 metadata 中的 schema 名称动态查找 schema 定义
- `SPEC_DIRECTORY_NAME` 从 `'marchenspec'` 改为 `'marchen'`
- 全局更新路径引用（模板、文档、测试、.gitignore）

## 能力

### 新增能力

- multi-schema-support：支持多 schema 选择，ArtifactDefinition 内聚 template/instruction
- rapid-schema：只有 tasks 一个 artifact 的轻量工作流

### 修改能力

- change-creation：`marchen new` 支持 `--schema` 参数
- directory-naming：根目录从 `marchenspec/` 改为 `marchen/`

## 影响范围

- `packages/shared` — 类型定义（ArtifactDefinition）、常量（SPEC_DIRECTORY_NAME）
- `packages/config` — schema 定义、模板、指导文本
- `packages/core` — ChangeManager 全部 schema 引用
- `apps/cli` — new 命令参数、init 文案
- 模板文件（skills/commands）— 路径示例
- 文档和测试 — 路径引用
