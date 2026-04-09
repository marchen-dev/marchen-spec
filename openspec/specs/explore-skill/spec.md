# explore-skill

## 目的

定义 explore skill 和 command 模板的规范，包括模板文件结构、codegen 自动生成常量、以及模板内容的核心章节要求。

## 需求

### 需求: explore skill 模板文件
系统 SHALL 在 `packages/config/templates/skills/` 目录下包含 `explore.md` 文件，作为 `marchen init` 生成项目时的 skill 模板。

#### 场景: skill 模板存在且 frontmatter 正确
- **WHEN** 读取 `packages/config/templates/skills/explore.md`
- **THEN** 文件存在，frontmatter 包含 `name: marchen-explore` 和 `description` 字段

#### 场景: skill 模板不包含 ARGUMENTS 占位符
- **WHEN** 读取 `packages/config/templates/skills/explore.md` 的内容
- **THEN** 文件末尾不包含 `ARGUMENTS: $ARGUMENTS`

### 需求: explore command 模板文件
系统 SHALL 在 `packages/config/templates/commands/` 目录下包含 `explore.md` 文件，作为 IDE command 模板。

#### 场景: command 模板存在且 frontmatter 正确
- **WHEN** 读取 `packages/config/templates/commands/explore.md`
- **THEN** 文件存在，frontmatter 包含 `name`、`description`、`category`、`tags` 字段

#### 场景: command 模板包含 ARGUMENTS 占位符
- **WHEN** 读取 `packages/config/templates/commands/explore.md` 的内容
- **THEN** 文件末尾包含 `ARGUMENTS: $ARGUMENTS`

### 需求: codegen 自动生成 explore 常量
codegen 脚本 SHALL 在 build 时自动识别新增的 explore.md 模板并生成对应的 TypeScript 常量。

#### 场景: build 后生成 skill 常量
- **WHEN** 运行 `pnpm build`（触发 generate-templates.ts）
- **THEN** `packages/config/src/generated/skill-templates.ts` 包含 `SKILL_EXPLORE` 常量和 `SKILL_TEMPLATES` 中的 `explore` 条目

#### 场景: build 后生成 command 常量
- **WHEN** 运行 `pnpm build`（触发 generate-templates.ts）
- **THEN** `packages/config/src/generated/command-templates.ts` 包含 `COMMAND_EXPLORE` 常量和 `COMMAND_TEMPLATES` 中的 `explore` 条目

### 需求: explore 模板内容包含核心章节
explore skill 和 command 模板 SHALL 包含以下核心章节：姿态、你可以做什么（含可视化示例框）、MarchenSpec 感知、护栏。

#### 场景: 模板包含姿态章节
- **WHEN** 读取 explore 模板内容
- **THEN** 包含「姿态」章节，定义好奇、开放、视觉化、自适应、耐心、接地气六个特质

#### 场景: 模板包含可视化示例框
- **WHEN** 读取 explore 模板内容
- **THEN** 包含 ASCII 图表示例框（以身作则展示可视化）

#### 场景: 模板包含 MarchenSpec 感知章节
- **WHEN** 读取 explore 模板内容
- **THEN** 包含使用 `marchen list --json` 检查上下文的指引，以及有/无变更时的行为指引

#### 场景: 模板包含护栏章节
- **WHEN** 读取 explore 模板内容
- **THEN** 包含「不实现」「不伪装理解」「不催促」「不强制结构」「不自动捕获」等约束
