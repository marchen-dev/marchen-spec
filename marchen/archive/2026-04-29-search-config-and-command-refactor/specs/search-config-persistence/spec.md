## search-config-persistence

config.yaml 搜索配置持久化，SearchManager 按配置决策搜索策略。

### 需求: config.yaml SHALL 支持 search.mode 字段

config.yaml 的 `search` 对象 SHALL 包含 `mode` 字段，取值为 `auto`、`bm25` 或 `semantic`。

#### 场景: 新项目初始化时写入 search.mode

WHEN 用户执行 `marchen init` 并选择搜索模式
THEN config.yaml 中 SHALL 包含 `search.mode` 字段，值为用户选择的模式

#### 场景: 旧项目升级时补全 search 配置

WHEN 用户执行 `marchen update` 且 config.yaml 中不存在 `search` 字段
THEN update SHALL 自动补全 `search.mode: auto`

### 需求: SearchManager SHALL 按 config.yaml 的 mode 决定搜索策略

SearchManager.prepare() SHALL 读取 config.yaml 的 `search.mode` 字段，按以下规则决定搜索策略：

- `semantic`：加载模型，使用混合搜索（BM25 + 向量 + 重排）。模型未安装时 SHALL 抛出错误提示用户运行 `marchen update`
- `bm25`：直接使用 BM25 关键词搜索，不加载模型
- `auto`：检测本地模型是否存在，有则语义搜索，无则 BM25（当前行为）

#### 场景: mode 为 semantic 且模型已安装

WHEN search.mode 为 `semantic` 且本地模型已下载
THEN SearchManager SHALL 使用 hybridSearch

#### 场景: mode 为 semantic 且模型未安装

WHEN search.mode 为 `semantic` 且本地模型未下载
THEN SearchManager SHALL 抛出错误，提示运行 `marchen update`

#### 场景: mode 为 bm25

WHEN search.mode 为 `bm25`
THEN SearchManager SHALL 使用 ftsSearch，不尝试加载模型

#### 场景: mode 为 auto

WHEN search.mode 为 `auto`
THEN SearchManager SHALL 检测本地模型，行为与当前一致
