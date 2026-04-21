### 需求: initialize() MUST 在 config.yaml 中写入 version 字段

#### 场景: 带版本号初始化

WHEN 调用 `workspace.initialize({ providers, version })` 且传入了 version
THEN config.yaml 中包含 `version` 字段，值为传入的版本号

#### 场景: 不传版本号时兼容

WHEN 调用 `workspace.initialize({ providers })` 未传入 version
THEN config.yaml 中不包含 `version` 字段（向后兼容）
