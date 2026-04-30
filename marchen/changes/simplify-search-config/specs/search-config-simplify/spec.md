# search-config-simplify

搜索配置从三模式（auto / bm25 / semantic）简化为布尔开关（enabled: true / false）。

### 需求: 配置结构 SHALL 使用 `search.enabled: boolean` 替代 `search.mode: SearchMode`

config.yaml 的搜索配置从枚举模式改为布尔开关。

#### 场景: 新项目初始化时选择启用搜索

WHEN 用户运行 `marchen init` 并在搜索确认中选择 Yes
THEN config.yaml 写入 `search.enabled: true`
AND 触发模型下载流程

#### 场景: 新项目初始化时选择不启用搜索

WHEN 用户运行 `marchen init` 并在搜索确认中选择 No
THEN config.yaml 写入 `search.enabled: false`
AND 不触发模型下载

### 需求: `SearchMode` 类型 SHALL 被删除

`'auto' | 'bm25' | 'semantic'` 类型定义及所有引用 SHALL 从代码中移除。

#### 场景: 编译时无 SearchMode 引用

WHEN 项目完成构建
THEN 不存在任何对 `SearchMode` 类型的导入或引用

### 需求: `marchen search` 在搜索未启用时 SHALL 报错退出

#### 场景: 搜索未启用时执行搜索命令

WHEN config.yaml 中 `search.enabled` 为 `false` 或不存在
AND 用户运行 `marchen search <query>`
THEN 命令输出错误提示并以非零状态码退出
AND 错误提示 SHALL 包含启用搜索的操作指引

#### 场景: 搜索已启用时正常执行

WHEN config.yaml 中 `search.enabled` 为 `true`
AND 用户运行 `marchen search <query>`
THEN 使用 Hybrid Search 执行搜索并返回结果

### 需求: `marchen update` SHALL 按 `search.enabled` 同步模型状态

#### 场景: 搜索已启用时确保模型就绪

WHEN config.yaml 中 `search.enabled` 为 `true`
AND 用户运行 `marchen update`
THEN 检查模型是否已下载，未下载则触发下载

#### 场景: 搜索未启用时跳过模型同步

WHEN config.yaml 中 `search.enabled` 为 `false`
AND 用户运行 `marchen update`
THEN 不检查也不下载模型

### 需求: `marchen update` SHALL 迁移旧版 `search.mode` 配置

已有项目的 config.yaml 可能包含旧的 `search.mode` 字段，update 时 SHALL 自动迁移。

#### 场景: 迁移 semantic 模式

WHEN config.yaml 包含 `search.mode: semantic`
AND 用户运行 `marchen update`
THEN 将配置迁移为 `search.enabled: true`
AND 删除 `search.mode` 字段

#### 场景: 迁移 bm25 模式

WHEN config.yaml 包含 `search.mode: bm25`
AND 用户运行 `marchen update`
THEN 将配置迁移为 `search.enabled: false`
AND 删除 `search.mode` 字段

#### 场景: 迁移 auto 模式

WHEN config.yaml 包含 `search.mode: auto`
AND 用户运行 `marchen update`
THEN 将配置迁移为 `search.enabled: false`
AND 删除 `search.mode` 字段

### 需求: `SearchManager.prepare()` SHALL 简化为单一路径

删除 mode 参数，prepare() 被调用时一律加载模型。

#### 场景: prepare 成功加载模型

WHEN `prepare()` 被调用
AND 模型已下载
THEN 加载模型并标记 `modelsReady = true`

#### 场景: prepare 模型不存在时抛错

WHEN `prepare()` 被调用
AND 模型未下载
THEN 抛出 `StateError`，提示运行 `marchen update` 下载模型
