## Why

当前 `knowledge/` 目录结构不够清晰，与 OpenAI Harness Engineering 实践不对齐。需要重构为更轻量、更易维护的 `docs/` 结构，以 `openspec/changes/archive/` 作为唯一的历史记录来源。

## What Changes

- 删除 `knowledge/` 目录及其所有内容（overview.md, progress.md, roadmap.md, research/, decisions/, _templates/）
- 创建新的 `docs/` 目录，包含：
  - `INDEX.md` - 文档总索引（~50 行）
  - `roadmap.md` - 路线图，链接到 archive/ 的已完成变更
  - `references/openspec-llms.txt` - OpenSpec 功能参考清单
- 更新 `CLAUDE.md` 中的知识库引用（从 `knowledge/` 改为 `docs/`）

## Capabilities

### New Capabilities
- `docs-structure`: 定义 docs/ 目录的结构、内容规范和更新机制

### Modified Capabilities
- `knowledge-base-integration`: 从 knowledge/ 目录迁移到 docs/ 目录，更新 CLAUDE.md 引用

## Impact

- 影响文件：`CLAUDE.md`（知识库引用部分）
- 删除整个 `knowledge/` 目录
- 新增 `docs/` 目录及 3 个文件
- 不影响代码逻辑，仅影响文档结构
