## ADDED Requirements

### Requirement: CLAUDE.md knowledge base section
CLAUDE.md SHALL 新增"知识库"章节，包含三部分：路径说明、写入规范、更新时机指引。该章节 MUST 控制在 20 行以内。

#### Scenario: Path reference
- **WHEN** AI 读取 CLAUDE.md 的知识库章节
- **THEN** MUST 能明确知道知识库位于 `knowledge/` 目录，以及新对话应先读 `knowledge/overview.md`

#### Scenario: Write rules
- **WHEN** AI 需要写入知识库
- **THEN** CLAUDE.md MUST 指引 AI 先读取 `knowledge/_templates/` 下对应模板，并遵循命名规范

### Requirement: Knowledge base update triggers
CLAUDE.md SHALL 定义知识库的更新时机约定，指引 AI 在特定场景后询问用户是否更新知识库。

#### Scenario: After research completion
- **WHEN** AI 完成一次技术调研
- **THEN** AI SHALL 询问用户是否将结论写入 `knowledge/research/`

#### Scenario: After change archival
- **WHEN** 一个 OpenSpec change 归档
- **THEN** AI SHALL 询问用户是否更新 `overview.md` 和 `progress.md`

#### Scenario: After global technical decision
- **WHEN** 做出跨模块的技术决策
- **THEN** AI SHALL 询问用户是否将决策记录写入 `knowledge/decisions/`
