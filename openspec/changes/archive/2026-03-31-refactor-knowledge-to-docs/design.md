## Context

当前项目使用 `knowledge/` 目录存放项目知识库，包含 overview.md、progress.md、roadmap.md、research/、decisions/ 和 _templates/。但这些内容大多已过时或与 CLAUDE.md 重复。

参考 OpenAI Harness Engineering 实践，他们使用 `docs/` 作为结构化知识系统，配合 `AGENTS.md` 作为索引入口。MarchenSpec 已有 `CLAUDE.md` 承担架构文档角色，`openspec/changes/archive/` 承担历史记录角色，因此 `docs/` 只需作为轻量的导航和补充层。

## Goals / Non-Goals

**Goals:**

- 用 `docs/` 替代 `knowledge/`，对齐 OpenAI 的 harness engineering 实践
- 以 `openspec/changes/archive/` 作为唯一的历史记录来源，避免重复维护
- 保持极简结构（3 个文件），降低维护成本
- 提供清晰的文档更新机制

**Non-Goals:**

- 不实现自动化文档生成（generated/）
- 不添加质量评分（QUALITY_SCORE.md）
- 不添加核心信念文档（core-beliefs/）
- 不添加产品规格（product-specs/）
- 这些可在项目成熟后按需添加

## Decisions

### 1. 用 `docs/` 替代 `knowledge/`

**选择**: 重命名为 `docs/` 并重构内容
**替代方案**: 保留 `knowledge/` 名称只重构内容
**理由**: `docs/` 是行业通用命名（OpenAI、OpenSpec 均使用），更易被 Agent 和开发者理解

### 2. 以 archive/ 作为唯一历史记录

**选择**: 不在 docs/ 中维护 design-decisions/ 索引，直接链接到 archive/
**替代方案**: 在 docs/ 中维护独立的决策索引文件
**理由**: 减少重复维护。archive/ 中的 proposal.md 和 design.md 已包含完整的决策记录，docs/roadmap.md 通过链接指向它们即可

### 3. references/ 存放外部参考

**选择**: 使用 llms.txt 格式存放 OpenSpec 功能清单
**替代方案**: 不存放外部参考
**理由**: MarchenSpec 对标 OpenSpec 功能，需要一个参考清单供 Agent 和开发者查阅

### 4. 文档更新机制

**选择**: 手动更新（归档 change 时更新 roadmap.md）
**替代方案**: 自动化脚本生成
**理由**: 当前 archive/ 数量少（6 个），手动更新成本极低。等超过 20 个时再考虑自动化

## Risks / Trade-offs

- **信息丢失风险** → knowledge/research/ 和 decisions/ 中可能有有价值内容。迁移前需检查，但经确认现有内容大多已过时或错误，可安全删除
- **docs/ 维护遗忘** → roadmap.md 可能忘记更新。通过在归档工作流中提醒来缓解
- **过度简化** → 3 个文件可能不够用。但结构可扩展，未来按需添加即可

