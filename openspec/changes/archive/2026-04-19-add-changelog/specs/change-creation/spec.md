## MODIFIED Requirements

### 需求: 工作区初始化

系统在初始化 MarchenSpec 工作区时 SHALL 创建标准目录结构、默认配置、skill/command 文件，以及空的 changelog.md。

#### 场景: 完整初始化

- **WHEN** 用户执行 `marchen init`
- **THEN** 创建 `marchen/` 目录结构（changes/、archive/、config.yaml、changelog.md）并生成 `.claude/skills/` 和 `.claude/commands/` 文件

#### 场景: changelog.md 已存在时初始化

- **WHEN** 用户执行 `marchen init --force` 且 `marchen/changelog.md` 已存在
- **THEN** 不覆盖已有的 `changelog.md`，保留历史记录
