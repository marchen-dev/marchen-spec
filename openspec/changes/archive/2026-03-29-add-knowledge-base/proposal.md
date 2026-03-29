## Why

每次开启新的 AI 对话都需要重新调研项目的整体进展、技术选型结论和后续方向，这个成本随项目增长越来越高。现有的 openspec 管理的是"变更流"（具体 feature 从提案到归档），但缺少一个持久化的"全局认知"层来记录项目走到哪了、调研过什么、要往哪走。需要一个结构化的知识库来解决这个问题。

## What Changes

- 在项目根目录新增 `knowledge/` 目录，作为独立于 openspec 的知识存储层
- 创建 `overview.md` 作为 AI 每次对话的速读入口（项目全景快照）
- 创建 `progress.md` 记录项目进展时间线
- 创建 `roadmap.md` 记录短期/中期/长期方向规划
- 创建 `research/` 目录存放调研结论，每个主题一个文件，配有 `_index.md` 索引
- 创建 `decisions/` 目录存放跨模块的技术决策记录（ADR 风格），配有 `_index.md` 索引
- 创建 `_templates/` 目录存放写入模板，确保 AI 写入内容格式一致
- 在 CLAUDE.md 中新增"知识库"章节，包含路径引用、写入规范和更新时机指引

## Capabilities

### New Capabilities
- `knowledge-base-structure`: 知识库目录结构、模板文件和索引机制的设计与创建
- `knowledge-base-integration`: 知识库与 CLAUDE.md 的集成，包括路径引用、写入规范和更新时机约定

### Modified Capabilities

## Impact

- 新增 `knowledge/` 目录及其下所有文件（纯文档，不影响代码构建）
- 修改 `CLAUDE.md`，新增知识库相关章节
- 不影响任何现有代码、构建流程或测试
