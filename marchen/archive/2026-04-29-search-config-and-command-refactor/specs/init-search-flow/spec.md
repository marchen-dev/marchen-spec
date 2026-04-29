## init-search-flow

init 命令的搜索设置流程简化为 mode 选择 + 写入配置。

### 需求: init SHALL 询问用户搜索模式并写入 config.yaml

init 命令 SHALL 在选择 AI 工具后，询问用户搜索模式偏好，将选择写入 config.yaml 的 `search.mode`。

#### 场景: 用户选择语义搜索

WHEN 用户在 init 中选择语义搜索模式
THEN config.yaml SHALL 写入 `search.mode: semantic`
AND init SHALL 下载模型并显示进度

#### 场景: 用户选择关键词搜索

WHEN 用户在 init 中选择关键词搜索模式
THEN config.yaml SHALL 写入 `search.mode: bm25`
AND init SHALL 不下载模型

#### 场景: 用户选择自动检测

WHEN 用户在 init 中选择自动检测模式
THEN config.yaml SHALL 写入 `search.mode: auto`
AND init SHALL 不下载模型

### 需求: init SHALL 移除 QMD 可用性检测逻辑

init 命令 SHALL 不再调用 `SearchManager.isAvailable()` 检测 QMD SDK。搜索模式由用户选择决定，不由运行时环境决定。

#### 场景: QMD SDK 不可用时

WHEN QMD SDK 无法导入
THEN init SHALL 仍然允许用户选择任意搜索模式（模型下载在 update 或首次 search 时处理）
