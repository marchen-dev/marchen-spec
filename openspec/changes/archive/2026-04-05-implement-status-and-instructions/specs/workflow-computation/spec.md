## ADDED Requirements

### 需求: 固定工作流规则计算 artifact 就绪状态
ChangeManager SHALL 根据固定的 spec-driven 工作流依赖规则，计算每个 artifact 的就绪状态。

#### 场景: 初始状态（所有 artifact 为 empty）
- **WHEN** 所有 artifact 状态为 empty 或 no-content
- **THEN** `workflow.ready` 为 `["proposal"]`
- **AND** `workflow.blocked` 为 `["specs", "design", "tasks"]`
- **AND** `workflow.next` 为 `"proposal"`

#### 场景: proposal 已填充
- **WHEN** proposal 状态为 `filled`
- **THEN** `workflow.ready` 包含 `specs` 和 `design`
- **AND** `workflow.blocked` 包含 `tasks`
- **AND** `workflow.next` 为 `"specs"`

#### 场景: proposal + specs 已填充
- **WHEN** proposal 和 specs 状态为 `filled`，design 为 `empty`
- **THEN** `workflow.ready` 包含 `design`
- **AND** `workflow.blocked` 包含 `tasks`

#### 场景: proposal + specs + design 已填充
- **WHEN** proposal、specs、design 状态均为 `filled`
- **THEN** `workflow.ready` 包含 `tasks`
- **AND** `workflow.blocked` 为空

#### 场景: 所有 artifact 已填充
- **WHEN** 所有 artifact 状态为 `filled`
- **THEN** `workflow.next` 为 `null`
- **AND** `workflow.ready` 和 `workflow.blocked` 均为空

### 需求: 工作流依赖规则
依赖规则 SHALL 硬编码在 ChangeManager 中，不依赖外部 schema 文件。

#### 场景: 依赖关系定义
- **WHEN** 计算工作流状态
- **THEN** proposal 无依赖
- **AND** specs 依赖 proposal filled
- **AND** design 依赖 proposal filled
- **AND** tasks 依赖 specs filled 且 design filled

### 需求: StatusResult 和 WorkflowStatus 类型定义
shared 包 SHALL 提供 `StatusResult`、`WorkflowStatus`、`ArtifactStatusDetail` 类型。

#### 场景: StatusResult 包含完整信息
- **WHEN** 调用 `ChangeManager.status(name)`
- **THEN** 返回的 StatusResult 包含 name、schema、artifacts、workflow、tasks

#### 场景: WorkflowStatus 包含建议信息
- **WHEN** 查看 WorkflowStatus
- **THEN** 包含 next（下一步建议，可为 null）、ready（就绪列表）、blocked（阻塞列表）
