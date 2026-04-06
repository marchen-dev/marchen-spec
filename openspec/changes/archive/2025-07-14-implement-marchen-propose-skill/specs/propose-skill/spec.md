## ADDED Requirements

### Requirement: propose skill 调用 marchen CLI 创建变更
skill SHALL 通过 `marchen new <name>` 创建变更目录。

#### Scenario: 创建新变更
- **WHEN** 用户调用 `/marchen:propose add-user-auth`
- **THEN** skill 执行 `marchen new add-user-auth` 创建变更目录

### Requirement: propose skill 循环创建所有 artifact
skill SHALL 通过 `marchen status` 和 `marchen instructions` 的 JSON API 驱动 artifact 创建循环，直到 `workflow.next` 为 `null`。

#### Scenario: 按依赖顺序创建 artifact
- **WHEN** skill 开始创建 artifact
- **THEN** 按 proposal → specs → design → tasks 的依赖顺序逐个创建

#### Scenario: 循环终止
- **WHEN** `marchen status <name> --json` 返回 `workflow.next` 为 `null`
- **THEN** skill 停止循环，显示完成摘要

### Requirement: propose skill 处理 specs 目录型 artifact
skill SHALL 从 proposal 的能力章节提取能力列表，为每个能力创建 `specs/<capability>/spec.md`。

#### Scenario: 创建多个 spec 文件
- **WHEN** proposal 列出了 `user-auth` 和 `data-export` 两个能力
- **THEN** skill 创建 `specs/user-auth/spec.md` 和 `specs/data-export/spec.md`

### Requirement: propose skill 使用 instructions 返回的 dependencies 内容
skill SHALL 直接使用 `marchen instructions` 返回的 `dependencies[].content` 字段获取依赖内容，不额外读取文件。

#### Scenario: 读取依赖内容
- **WHEN** skill 创建 design artifact
- **THEN** 从 instructions JSON 的 dependencies 中获取 proposal 和 specs 的内容，不执行额外的文件读取

### Requirement: propose skill 使用中文
skill 的所有提示文本和输出 SHALL 使用中文。

#### Scenario: 中文输出
- **WHEN** skill 执行过程中显示进度
- **THEN** 使用中文提示（如"已创建 proposal"、"所有 artifact 已就绪"）
