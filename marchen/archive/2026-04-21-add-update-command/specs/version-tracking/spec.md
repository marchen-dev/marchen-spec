### 需求: config.yaml MUST 包含 version 字段记录模板对应的 CLI 版本

#### 场景: init 写入 version

WHEN 用户运行 `marchen init` 初始化项目
THEN 生成的 config.yaml 中包含 `version` 字段，值为当前 CLI 版本号

#### 场景: update 更新 version

WHEN 用户运行 `marchen update`
THEN config.yaml 的 `version` 字段被更新为当前 CLI 版本号
AND config.yaml 的其他字段（schema、context、providers、perArtifactRules）保持不变

### 需求: 旧项目（无 version 字段）MUST 被视为需要更新

#### 场景: 旧项目兼容

WHEN 用户在 config.yaml 没有 version 字段的项目中运行 `marchen update`
THEN 系统视为需要更新，正常执行更新流程
AND 写入 version 字段
