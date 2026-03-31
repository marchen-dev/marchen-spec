## ADDED Requirements

### Requirement: docs/ 目录结构
系统 SHALL 提供 `docs/` 目录作为项目文档的组织结构，包含索引、路线图和外部参考。

#### Scenario: docs/ 目录存在
- **WHEN** 项目初始化完成
- **THEN** `docs/` 目录 SHALL 存在于项目根目录

### Requirement: INDEX.md 作为文档入口
系统 SHALL 提供 `docs/INDEX.md` 作为文档总索引，包含快速导航链接。

#### Scenario: INDEX.md 包含导航链接
- **WHEN** 读取 `docs/INDEX.md`
- **THEN** 文件 SHALL 包含到 roadmap.md、references/ 和 CLAUDE.md 的链接

#### Scenario: INDEX.md 说明 archive/ 位置
- **WHEN** 读取 `docs/INDEX.md`
- **THEN** 文件 SHALL 说明完整变更历史位于 `openspec/changes/archive/`

### Requirement: roadmap.md 记录项目进展
系统 SHALL 提供 `docs/roadmap.md` 记录已完成、进行中和计划中的功能。

#### Scenario: roadmap.md 包含已完成变更
- **WHEN** 读取 `docs/roadmap.md`
- **THEN** 文件 SHALL 包含"已完成"部分，列出归档的变更并链接到 archive/

#### Scenario: roadmap.md 包含进行中任务
- **WHEN** 读取 `docs/roadmap.md`
- **THEN** 文件 SHALL 包含"进行中"部分，列出当前正在开发的功能
