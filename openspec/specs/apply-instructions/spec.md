## apply-instructions

通过 `marchen instructions <name> apply --json` 获取实现阶段的完整上下文和进度。

### 需求: 返回实现状态

系统 SHALL 在 `artifactId` 为 `apply` 时返回 `state` 字段，值为 `ready`、`blocked` 或 `all_done`。

#### 场景: tasks 未创建或无内容

WHEN tasks.md 不存在或为空模板
THEN `state` SHALL 为 `"blocked"`

#### 场景: tasks 有未完成任务

WHEN tasks.md 存在且包含未勾选的 checkbox
THEN `state` SHALL 为 `"ready"`

#### 场景: tasks 全部完成

WHEN tasks.md 中所有 checkbox 均已勾选
THEN `state` SHALL 为 `"all_done"`

### 需求: 返回任务进度

系统 SHALL 在 `artifactId` 为 `apply` 时返回 `progress` 字段，包含 `total`、`completed`、`remaining`。

#### 场景: 部分完成

WHEN tasks.md 有 5 个任务，其中 2 个已勾选
THEN `progress` SHALL 为 `{ total: 5, completed: 2, remaining: 3 }`

### 需求: 返回所有 filled artifact 内容

系统 SHALL 在 `context` 数组中包含所有 schema 定义的 artifact，每个条目包含 `id`、`status`、`path`、`content`（filled 时有值）。

#### 场景: 所有 artifact 已填充

WHEN proposal、specs、design、tasks 均已填充
THEN `context` SHALL 包含 4 个条目，每个 `content` 非 null

#### 场景: 部分 artifact 未填充

WHEN design 未填充
THEN design 条目的 `status` SHALL 为 `"missing"`，`content` SHALL 为 null

### 需求: apply 不返回创建阶段专属字段

系统 SHALL 在 `artifactId` 为 `apply` 时将 `outputPath`、`template`、`unlocks` 设为 null。

#### 场景: apply 返回值

WHEN 调用 `instructions <name> apply`
THEN `outputPath` SHALL 为 null，`template` SHALL 为 null，`unlocks` SHALL 为 null
