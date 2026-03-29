## ADDED Requirements

### Requirement: Knowledge base directory structure
项目根目录 SHALL 包含 `knowledge/` 目录，其结构如下：

```
knowledge/
├── overview.md
├── progress.md
├── roadmap.md
├── research/
│   └── _index.md
├── decisions/
│   └── _index.md
└── _templates/
    ├── research.md
    ├── decision.md
    └── progress-entry.md
```

#### Scenario: Initial directory creation
- **WHEN** 知识库初始化完成
- **THEN** `knowledge/` 目录下 MUST 包含 overview.md、progress.md、roadmap.md 三个顶层文件，以及 research/、decisions/、_templates/ 三个子目录

### Requirement: Overview file as snapshot
`knowledge/overview.md` SHALL 作为项目全景快照，反映项目当前状态，包含架构现状、已完成里程碑、进行中工作等信息。内容 MUST 控制在 100 行以内。

#### Scenario: Overview reflects current state
- **WHEN** AI 读取 overview.md
- **THEN** 文件内容 MUST 反映项目最新状态，而非追加式日志

### Requirement: Progress file as timeline
`knowledge/progress.md` SHALL 以时间线形式记录项目重要节点，每个节点包含：做了什么、为什么、结果。

#### Scenario: New milestone recorded
- **WHEN** 一个重要里程碑完成
- **THEN** 在 progress.md 末尾追加一条记录，包含日期、描述和结果

### Requirement: Roadmap file with layered planning
`knowledge/roadmap.md` SHALL 包含三层规划：短期（下几个 change）、中期（功能里程碑）、长期（产品愿景）。

#### Scenario: Roadmap structure
- **WHEN** 读取 roadmap.md
- **THEN** 文件 MUST 包含短期、中期、长期三个独立 section

### Requirement: Research directory with index
`knowledge/research/` SHALL 存放调研结论文件，每个调研主题一个文件。`_index.md` MUST 包含所有调研文件的一行摘要和链接。

#### Scenario: New research added
- **WHEN** 新调研结论写入 research/ 目录
- **THEN** _index.md MUST 同步更新，新增对应条目

#### Scenario: Research file naming
- **WHEN** 创建新的调研文件
- **THEN** 文件名 MUST 使用 kebab-case（如 `yaml-parsing.md`）

### Requirement: Decisions directory with index
`knowledge/decisions/` SHALL 存放跨模块的技术决策记录（ADR 风格）。`_index.md` MUST 包含所有决策文件的一行摘要和链接。

#### Scenario: New decision recorded
- **WHEN** 新技术决策写入 decisions/ 目录
- **THEN** _index.md MUST 同步更新，新增对应条目

#### Scenario: Decision file naming
- **WHEN** 创建新的决策文件
- **THEN** 文件名 MUST 使用三位递增编号前缀（如 `001-monorepo-structure.md`）

### Requirement: Template files for format consistency
`knowledge/_templates/` SHALL 包含三个模板文件：research.md、decision.md、progress-entry.md。模板定义核心 section 结构，AI 写入知识库时 MUST 先读取对应模板。

#### Scenario: Research template structure
- **WHEN** 读取 _templates/research.md
- **THEN** 模板 MUST 包含：状态、结论、背景、选项对比、最终选择、参考 六个 section

#### Scenario: Decision template structure
- **WHEN** 读取 _templates/decision.md
- **THEN** 模板 MUST 包含：状态、上下文、选项、决定、后果 五个 section

#### Scenario: Progress entry template structure
- **WHEN** 读取 _templates/progress-entry.md
- **THEN** 模板 MUST 包含：日期、描述、结果 三个字段
