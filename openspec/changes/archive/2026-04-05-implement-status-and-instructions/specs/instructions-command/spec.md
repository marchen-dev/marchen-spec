## ADDED Requirements

### 需求: instructions 命令返回 artifact 创建指令
CLI SHALL 提供 `marchen instructions <name> <artifact-id>` 命令，返回指定 artifact 的创建指令。

#### 场景: 获取 proposal 的指令
- **WHEN** 用户执行 `marchen instructions my-feature proposal --json`
- **THEN** 返回 InstructionsResult，包含 template、instruction、dependencies（空数组）、unlocks

#### 场景: 获取 specs 的指令
- **WHEN** 用户执行 `marchen instructions my-feature specs --json`
- **THEN** 返回 InstructionsResult
- **AND** dependencies 包含 proposal 的状态和内容
- **AND** unlocks 包含 `["tasks"]`

#### 场景: 获取 design 的指令
- **WHEN** 用户执行 `marchen instructions my-feature design --json`
- **THEN** 返回 InstructionsResult
- **AND** dependencies 包含 proposal 的状态和内容

#### 场景: 获取 tasks 的指令
- **WHEN** 用户执行 `marchen instructions my-feature tasks --json`
- **THEN** 返回 InstructionsResult
- **AND** dependencies 包含 specs 和 design 的状态和内容

#### 场景: artifact-id 不合法
- **WHEN** 用户执行 `marchen instructions my-feature unknown-artifact --json`
- **THEN** 系统抛出 ValidationError，提示 artifact 不存在

#### 场景: 变更不存在
- **WHEN** 用户执行 `marchen instructions non-existent proposal --json`
- **THEN** 系统抛出 ValidationError，提示变更不存在

### 需求: instructions 返回依赖 artifact 的实际内容
dependencies 中 status 为 filled 的 artifact SHALL 包含其文件内容。

#### 场景: 单文件依赖的内容
- **WHEN** 依赖的 artifact 是单文件（如 proposal.md、design.md）
- **THEN** DependencyInfo.content 为该文件的完整内容

#### 场景: specs 目录依赖的内容
- **WHEN** 依赖的 artifact 是 specs 目录
- **THEN** DependencyInfo.content 为所有 spec 文件内容的拼接
- **AND** 每个文件以 `--- specs/<name>/spec.md ---` 分隔

#### 场景: 依赖 artifact 未填充
- **WHEN** 依赖的 artifact 状态为 empty 或 missing
- **THEN** DependencyInfo.content 为 null

### 需求: instructions 默认输出 JSON
instructions 命令 SHALL 默认输出 JSON 格式（主要给 Skill 消费），`--json` 标志可选。

#### 场景: 不带 --json 标志
- **WHEN** 用户执行 `marchen instructions my-feature proposal`
- **THEN** 输出 JSON 格式的 InstructionsResult（与 --json 行为一致）
