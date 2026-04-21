## ADDED Requirements

### 需求: status 命令展示变更状态和工作流建议
CLI SHALL 提供 `marchen status <name>` 命令，展示指定变更的 artifact 内容状态、工作流建议和 task 进度。

#### 场景: 查看刚创建的变更状态
- **WHEN** 用户执行 `marchen status my-feature`
- **THEN** 系统展示每个 artifact 的内容状态（empty/filled/missing 等）
- **AND** 展示工作流建议（next/ready/blocked）
- **AND** tasks 信息为 null（tasks.md 内容为模板骨架）

#### 场景: 查看部分填充的变更状态
- **WHEN** 用户执行 `marchen status my-feature` 且 proposal 已填充
- **THEN** proposal 状态为 `filled`
- **AND** specs 和 design 在 `workflow.ready` 中
- **AND** tasks 在 `workflow.blocked` 中
- **AND** `workflow.next` 为 `specs`

#### 场景: 查看全部填充的变更状态
- **WHEN** 所有 artifact 都已填充
- **THEN** `workflow.next` 为 `null`
- **AND** `workflow.ready` 和 `workflow.blocked` 均为空数组

#### 场景: 变更不存在
- **WHEN** 用户执行 `marchen status non-existent`
- **THEN** 系统抛出 ValidationError，提示变更不存在

#### 场景: MarchenSpec 未初始化
- **WHEN** 用户在未初始化的目录执行 `marchen status my-feature`
- **THEN** 系统抛出 StateError，提示需要先执行 `marchen init`

### 需求: status 命令支持 JSON 输出
CLI SHALL 支持 `--json` 标志，输出结构化的 StatusResult 数据。

#### 场景: 使用 --json 标志
- **WHEN** 用户执行 `marchen status my-feature --json`
- **THEN** 系统输出 JSON 格式的 StatusResult
- **AND** 不输出任何 clack UI 内容

### 需求: status 命令展示 task 进度
当 tasks.md 有实质内容时，status SHALL 解析 checkbox 并展示进度。

#### 场景: tasks 有内容且部分完成
- **WHEN** tasks.md 包含 checkbox 且部分已勾选
- **THEN** tasks 字段包含 total、completed、items
- **AND** tasks.md 的 artifact 状态为 `in-progress`

#### 场景: tasks 全部完成
- **WHEN** tasks.md 所有 checkbox 已勾选
- **THEN** tasks.md 的 artifact 状态为 `done`

### 需求: status 命令人类友好输出
默认输出 SHALL 使用 emoji 和格式化文本展示状态。

#### 场景: 人类友好输出格式
- **WHEN** 用户执行 `marchen status my-feature`（不带 --json）
- **THEN** 使用 ✅ 表示 filled/done，⬜ 表示 empty/no-content，🔒 表示 blocked
- **AND** 展示变更名称和 schema
- **AND** 展示"下一步"建议
