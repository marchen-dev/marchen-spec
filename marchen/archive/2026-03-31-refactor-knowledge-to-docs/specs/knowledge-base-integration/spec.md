## MODIFIED Requirements

### Requirement: CLAUDE.md knowledge base section
CLAUDE.md SHALL 包含"知识库"章节，说明文档位于 `docs/` 目录。该章节 MUST 控制在 15 行以内。

#### Scenario: Path reference
- **WHEN** AI 读取 CLAUDE.md 的知识库章节
- **THEN** MUST 能明确知道文档位于 `docs/` 目录，新对话应先读 `docs/INDEX.md`

#### Scenario: Archive reference
- **WHEN** AI 需要查看历史记录
- **THEN** CLAUDE.md MUST 指引 AI 查看 `openspec/changes/archive/` 目录

### Requirement: Documentation update triggers
CLAUDE.md SHALL 定义文档的更新时机约定，指引 AI 在归档 change 时更新 roadmap.md。

#### Scenario: After change archival
- **WHEN** 一个 OpenSpec change 归档
- **THEN** AI SHALL 提醒用户在 `docs/roadmap.md` 的"已完成"部分添加链接

## REMOVED Requirements

### Requirement: Knowledge base update triggers
**Reason**: 不再维护独立的 research/ 和 decisions/ 目录，所有决策记录在 archive/ 的 design.md 中
**Migration**: 技术决策和调研结论直接记录在对应 change 的 proposal.md 和 design.md 中

### Requirement: Write rules
**Reason**: 删除 _templates/ 目录，不再需要模板规范
**Migration**: 使用 OpenSpec 的 artifact 模板系统
