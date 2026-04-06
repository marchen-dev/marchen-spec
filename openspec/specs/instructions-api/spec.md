## instructions-api

`InstructionsResult` 类型重构，统一创建和实现两个阶段的返回结构。

### 需求: dependencies 重命名为 context

系统 SHALL 将 `InstructionsResult.dependencies` 重命名为 `context`，类型从 `DependencyInfo[]` 改为 `ContextInfo[]`。

#### 场景: 创建 artifact 阶段

WHEN 调用 `instructions <name> proposal`
THEN 返回值 SHALL 包含 `context` 字段（原 `dependencies`），不包含 `dependencies`

### 需求: 创建阶段专属字段改为可选

`outputPath`、`template`、`unlocks` SHALL 改为可选字段（`T | null`）。

#### 场景: 创建 artifact 时

WHEN `artifactId` 为 schema 中定义的 artifact
THEN `outputPath`、`template`、`unlocks` SHALL 有值

#### 场景: apply 时

WHEN `artifactId` 为 `apply`
THEN `outputPath`、`template`、`unlocks` SHALL 为 null

### 需求: propose skill 模板同步更新

propose skill 模板中引用 `dependencies` 的地方 SHALL 更新为 `context`。

#### 场景: propose 模板字段引用

WHEN 查看 propose 模板
THEN 所有对返回字段的描述 SHALL 使用 `context` 而非 `dependencies`
