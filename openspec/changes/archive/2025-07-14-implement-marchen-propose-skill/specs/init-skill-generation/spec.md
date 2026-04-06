## ADDED Requirements

### Requirement: initialize 生成 skill 文件
系统 SHALL 在 `Workspace.initialize()` 执行时，将所有 skill 模板写入用户项目的 `.claude/skills/` 目录。

#### Scenario: init 生成 propose skill
- **WHEN** 用户执行 `marchen init`
- **THEN** 在项目根目录创建 `.claude/skills/marchen-propose/SKILL.md`，内容为 propose skill 模板

#### Scenario: init 生成 propose command
- **WHEN** 用户执行 `marchen init`
- **THEN** 在项目根目录创建 `.claude/commands/marchen/propose.md`，内容为 propose command 模板

### Requirement: 重复 init 覆盖 skill 文件
系统 SHALL 在重复执行 init 时覆盖已有的 skill 和 command 文件，确保内容为最新版本。

#### Scenario: 重复 init 更新 skill
- **WHEN** 用户再次执行 `marchen init`，且 `.claude/skills/marchen-propose/SKILL.md` 已存在
- **THEN** 文件内容被覆盖为最新的 skill 模板

### Requirement: init 输出提示包含 skill 信息
系统 SHALL 在 init 完成后的输出中提示用户已生成 skill 文件。

#### Scenario: init 成功提示
- **WHEN** init 执行成功
- **THEN** 输出中包含 skill 生成的信息
