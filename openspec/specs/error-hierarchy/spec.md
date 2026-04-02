## ADDED Requirements

### Requirement: 错误基类保持兼容
`MarchenSpecError` 作为所有业务错误的基类，所有子类 SHALL 继承自它。CLI 层使用 `instanceof MarchenSpecError` SHALL 能捕获所有业务错误。

#### Scenario: 子类实例通过基类检查
- **WHEN** 抛出 `ValidationError`、`StateError` 或 `FileSystemError`
- **THEN** `instanceof MarchenSpecError` 返回 `true`

### Requirement: ValidationError 处理用户输入错误
`ValidationError` SHALL 用于用户输入校验失败的场景，仅携带 `message` 字段。

#### Scenario: 变更名称不合法
- **WHEN** 用户提供的变更名称不符合 kebab-case 格式
- **THEN** 抛出 `ValidationError`，message 包含名称和格式要求

#### Scenario: 变更已存在
- **WHEN** 用户创建的变更名称已存在
- **THEN** 抛出 `ValidationError`，message 包含变更名称

#### Scenario: 变更不存在
- **WHEN** 用户操作的变更名称不存在
- **THEN** 抛出 `ValidationError`，message 包含变更名称

### Requirement: StateError 处理前置条件错误
`StateError` SHALL 用于系统状态不满足前置条件的场景，携带可选的 `hint` 字段提供操作建议。

#### Scenario: 工作区未初始化
- **WHEN** 用户在未初始化的目录执行命令
- **THEN** 抛出 `StateError`，message 说明未初始化，hint 提供初始化命令

#### Scenario: CLI 展示 hint
- **WHEN** CLI 捕获到带 `hint` 的 `StateError`
- **THEN** 先展示错误信息，再以 info 级别展示 hint

### Requirement: FileSystemError 处理 IO 异常
`FileSystemError` SHALL 用于文件系统操作失败的场景，携带 `path` 字段和可选的 `cause` 字段。

#### Scenario: 文件不存在
- **WHEN** 读取不存在的文件
- **THEN** 抛出 `FileSystemError`，message 为"文件不存在"，path 为文件路径

#### Scenario: 目录不存在
- **WHEN** 列举或移动不存在的目录
- **THEN** 抛出 `FileSystemError`，message 为"目录不存在"，path 为目录路径

#### Scenario: YAML 解析失败
- **WHEN** YAML 文件内容解析失败
- **THEN** 抛出 `FileSystemError`，message 为"YAML 解析失败"，path 为文件路径，cause 为原始解析错误

### Requirement: CLI 共享错误处理函数
CLI 层 SHALL 提供 `handleError()` 函数统一处理所有错误，按错误类型差异化展示。所有命令的 catch 块 SHALL 调用此函数。

#### Scenario: ValidationError 展示为 warn
- **WHEN** `handleError` 接收到 `ValidationError`
- **THEN** 使用 `p.log.warn` 展示 message

#### Scenario: StateError 展示为 error + hint
- **WHEN** `handleError` 接收到带 hint 的 `StateError`
- **THEN** 使用 `p.log.error` 展示 message，`p.log.info` 展示 hint

#### Scenario: FileSystemError 展示路径
- **WHEN** `handleError` 接收到 `FileSystemError`
- **THEN** 使用 `p.log.error` 展示 message 和 path

#### Scenario: 未知错误兜底
- **WHEN** `handleError` 接收到非 `MarchenSpecError` 的错误
- **THEN** 使用 `p.log.error` 展示"未知错误"
