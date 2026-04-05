## ADDED Requirements

### 需求: 内容感知状态检测区分模板骨架和实质内容
ChangeManager SHALL 提供内容感知的 artifact 状态检测，区分文件是模板骨架还是已填充实质内容。

#### 场景: 单文件 artifact 为模板骨架
- **WHEN** 检测 proposal.md / design.md / tasks.md 的内容状态
- **AND** 文件内容去掉 HTML 注释（`<!-- ... -->`）、空行、纯 markdown 标题行后，剩余内容不超过 20 字符
- **THEN** 状态为 `empty`

#### 场景: 单文件 artifact 有实质内容
- **WHEN** 检测 proposal.md / design.md / tasks.md 的内容状态
- **AND** 文件内容去掉 HTML 注释、空行、纯 markdown 标题行后，剩余内容超过 20 字符
- **THEN** 状态为 `filled`

#### 场景: 文件不存在
- **WHEN** 检测的 artifact 文件不存在
- **THEN** 状态为 `missing`

#### 场景: specs 目录为空
- **WHEN** specs/ 目录存在但没有任何 .md 文件
- **THEN** 状态为 `no-content`

#### 场景: specs 目录有 spec 文件
- **WHEN** specs/ 目录下有 .md 文件且至少一个文件内容为 filled
- **THEN** 状态为 `filled`
- **AND** capabilities 列表包含所有子目录名

### 需求: ArtifactContentStatus 类型定义
shared 包 SHALL 提供 `ArtifactContentStatus` 类型，仅表达内容维度的状态。tasks 的完成进度通过 StatusResult.tasks 字段单独表达。

#### 场景: 类型覆盖基础状态
- **WHEN** 使用 ArtifactContentStatus 类型
- **THEN** 可取值为 `'empty' | 'filled' | 'missing' | 'no-content'`

#### 场景: tasks.md 有内容时状态为 filled
- **WHEN** tasks.md 有实质内容（无论 checkbox 完成度如何）
- **THEN** artifact 状态为 `filled`
- **AND** tasks 完成进度通过 `StatusResult.tasks.total` 和 `StatusResult.tasks.completed` 表达
