## MODIFIED Requirements

### 需求: 归档变更

系统 SHALL 将已完成的变更移动到 archive 目录，更新元数据，并写入 changelog 条目。

#### 场景: 带 summary 归档

- **WHEN** 用户执行 `marchen archive <name> --summary "摘要文本"`
- **THEN** 移动变更到 `archive/YYYY-MM-DD-<name>/`，更新 metadata status 为 archived，追加带摘要的条目到 changelog.md

#### 场景: 不带 summary 归档

- **WHEN** 用户执行 `marchen archive <name>`
- **THEN** 移动变更到 `archive/YYYY-MM-DD-<name>/`，更新 metadata status 为 archived，追加仅含名称链接的条目到 changelog.md

#### 场景: JSON 输出

- **WHEN** 用户执行 `marchen archive <name> --json`
- **THEN** 输出 JSON 格式的 ArchiveResult
