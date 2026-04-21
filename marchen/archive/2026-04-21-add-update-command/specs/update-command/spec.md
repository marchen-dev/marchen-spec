### 需求: update 命令 SHALL 读取 config.yaml 中的 providers 列表并为每个 provider 覆盖写入最新的 skill/command 文件

#### 场景: 正常更新

WHEN 用户在已初始化的项目中运行 `marchen update`
THEN 系统读取 `marchen/config.yaml` 中的 `providers` 列表
AND 为每个 provider 覆盖写入对应的 skill 文件（SKILL.md）
AND 为支持 command 的 provider 覆盖写入 command 文件
AND 更新 config.yaml 的 `version` 字段为当前 CLI 版本

#### 场景: 已是最新版本

WHEN 用户运行 `marchen update` 且 config.yaml 的 version 与当前 CLI 版本一致
THEN 系统提示已是最新版本，不执行写入操作

### 需求: update 命令 SHALL 在未初始化的项目中报错

#### 场景: 未初始化

WHEN 用户在未初始化的项目中运行 `marchen update`
THEN 系统报错提示需要先运行 `marchen init`

### 需求: update 命令 SHALL 展示更新结果

#### 场景: 展示版本变化和更新详情

WHEN 更新成功完成
THEN 系统展示旧版本号到新版本号的变化（旧项目无版本号时显示 "unknown"）
AND 展示每个 provider 更新的文件数量
