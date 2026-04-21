## ADDED Requirements

### 需求: verify 命令展示变更验证信息
CLI SHALL 提供 `marchen verify <name>` 命令，展示指定变更的 artifact 完整度和 task 完成情况。

#### 场景: 验证一个完整的变更
- **WHEN** 用户执行 `marchen verify my-feature`
- **THEN** 系统展示该变更的 artifact 存在状态（proposal.md / design.md / tasks.md / specs/）
- **AND** 展示 specs/ 下的 capability 列表
- **AND** 展示 task 完成度（X/N 完成）
- **AND** 列出所有未完成的 task

#### 场景: 变更不存在
- **WHEN** 用户执行 `marchen verify non-existent`
- **THEN** 系统抛出 ValidationError，提示变更不存在

#### 场景: MarchenSpec 未初始化
- **WHEN** 用户在未初始化的目录执行 `marchen verify my-feature`
- **THEN** 系统抛出 StateError，提示需要先执行 `marchen init`

#### 场景: tasks.md 不存在
- **WHEN** 变更目录中没有 tasks.md
- **THEN** tasks 信息为 null
- **AND** CLI 展示时提示"无 tasks 文件"

#### 场景: specs/ 为空目录
- **WHEN** 变更的 specs/ 目录存在但为空
- **THEN** capabilities 列表为空数组
- **AND** CLI 正常展示，不报错

### 需求: verify 命令支持 JSON 输出
CLI SHALL 支持 `--json` 标志，输出结构化的 VerifyResult 数据。

#### 场景: 使用 --json 标志
- **WHEN** 用户执行 `marchen verify my-feature --json`
- **THEN** 系统输出 JSON 格式的 VerifyResult
- **AND** 不输出任何 clack UI 内容

### 需求: VerifyResult 类型定义
shared 包 SHALL 提供 `VerifyResult`、`ArtifactStatus`、`TaskItem` 类型。

#### 场景: VerifyResult 包含完整信息
- **WHEN** 调用 `ChangeManager.verify(name)`
- **THEN** 返回的 VerifyResult 包含 name（变更名称）、artifacts（artifact 状态列表）、tasks（task 完成信息或 null）

#### 场景: ArtifactStatus 描述单个 artifact
- **WHEN** 检查 artifact 状态
- **THEN** ArtifactStatus 包含 id（artifact 标识）、exists（是否存在）
- **AND** 当 id 为 specs 时，额外包含 capabilities（子目录名列表）

#### 场景: TaskItem 描述单个 task
- **WHEN** 解析 tasks.md 中的 checkbox
- **THEN** TaskItem 包含 description（任务描述）和 completed（是否完成）
- **AND** items 包含所有 task（含已完成），不做过滤
