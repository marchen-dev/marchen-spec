## update-search-sync

update 命令按 config.yaml 同步搜索模型状态。

### 需求: update SHALL 按 search.mode 同步模型状态

`marchen update` 在更新 skill/command 文件后，SHALL 读取 config.yaml 的 `search.mode`，按以下规则处理：

- `semantic`：检查模型是否已下载，未下载则自动下载
- `bm25`：不做任何模型操作
- `auto`：检查模型是否已下载，未下载则跳过（不主动下载）

#### 场景: mode 为 semantic 且模型缺失

WHEN search.mode 为 `semantic` 且本地模型未下载
THEN update SHALL 自动下载模型并显示进度

#### 场景: mode 为 semantic 且模型已存在

WHEN search.mode 为 `semantic` 且本地模型已下载
THEN update SHALL 跳过模型下载，显示"语义搜索已就绪"

#### 场景: mode 为 bm25

WHEN search.mode 为 `bm25`
THEN update SHALL 不执行任何模型相关操作

#### 场景: mode 为 auto

WHEN search.mode 为 `auto`
THEN update SHALL 检查模型状态并显示当前搜索模式信息，但不主动下载

### 需求: update SHALL 补全缺失的 search 配置

WHEN config.yaml 中不存在 `search` 字段
THEN update SHALL 写入 `search.mode: auto` 并继续执行

#### 场景: 从旧版本升级

WHEN 用户从不含 search 配置的旧版本升级
THEN update SHALL 补全 `search.mode: auto`，行为与升级前一致（不破坏现有体验）
