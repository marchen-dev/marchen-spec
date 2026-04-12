# change-creation

## MODIFIED Requirements

### 需求: ChangeManager.archive() SHALL 返回归档结果

archive 方法 MUST 返回 `ArchiveResult` 对象，包含归档后的路径和元数据信息。

#### 场景: 归档成功返回结果

- **WHEN** 调用 `archive('my-feature')` 成功
- **THEN** 返回 `{ name, schema, archivedTo, archivedAt }` 对象
- **AND** `archivedTo` 为归档目录的完整路径

#### 场景: 目标目录已存在时抛出错误

- **WHEN** 调用 `archive('my-feature')` 但 `archive/YYYY-MM-DD-my-feature` 已存在
- **THEN** 抛出 `ValidationError`，提示目标目录已存在

### 需求: `marchen archive` SHALL 支持 `--json` 输出

命令 MUST 支持 `--json` 可选参数，输出归档结果的 JSON 格式。

#### 场景: 使用 --json 输出

- **WHEN** 执行 `marchen archive my-feature --json`
- **THEN** 输出 JSON 格式的 `ArchiveResult`
- **AND** 不显示交互式 UI 文本
