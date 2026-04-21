### 需求: `Workspace.initialize()` 生成的 config.yaml SHALL NOT 包含 `context` 和 `perArtifactRules` 字段

初始化时写入的 config.yaml 只包含有实际消费逻辑的字段：`schema`、`providers`、`version`（可选）。

#### 场景: 新项目初始化后的 config.yaml 内容

WHEN 用户执行 `marchen init`
THEN 生成的 `marchen/config.yaml` 包含 `schema` 和 `providers` 字段
AND 不包含 `context` 字段
AND 不包含 `perArtifactRules` 字段

#### 场景: 带 version 参数初始化

WHEN 用户执行 `marchen init` 并指定 version
THEN 生成的 `marchen/config.yaml` 包含 `schema`、`providers`、`version` 字段
AND 不包含 `context` 字段
AND 不包含 `perArtifactRules` 字段

### 需求: `Workspace.update()` MUST 保留用户 config.yaml 中已有的未知字段

已存在的项目可能在 config.yaml 中包含 `context` 或 `perArtifactRules`（由旧版本写入）。update 操作读取整个 config 再写回，不应丢失这些字段。

#### 场景: 更新包含旧字段的 config.yaml

WHEN 用户的 config.yaml 中包含 `context: 'some value'` 和 `perArtifactRules: { proposal: 'rule' }`
AND 用户执行 `marchen update`
THEN 更新后的 config.yaml 仍保留 `context` 和 `perArtifactRules` 字段及其值
