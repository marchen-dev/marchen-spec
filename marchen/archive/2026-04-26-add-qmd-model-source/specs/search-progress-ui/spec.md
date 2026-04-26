### 需求: CLI search 命令 SHALL 在准备阶段展示模型下载进度

#### 场景: 模型已存在时快速通过

- GIVEN 所有模型已下载且校验通过
- WHEN 执行 `marchen search "query"`
- THEN spinner 显示"准备搜索引擎..."后快速切换到"搜索中..."
- AND 不显示下载进度

#### 场景: 模型需要下载时展示进度

- GIVEN 某个模型不存在
- WHEN 执行 `marchen search "query"`
- THEN spinner 依次显示：
  - "检查模型 Embedding..."
  - "下载模型 Query Expansion... 234/1100 MB (21%)"（持续更新）
  - "校验模型 Query Expansion..."
  - "模型 Reranker 就绪"
- AND 准备完成后切换到搜索阶段

#### 场景: JSON 模式不显示进度

- GIVEN 使用 `--json` 选项
- WHEN 执行 `marchen search "query" --json`
- THEN 不显示 spinner 和进度信息
- AND 只输出 JSON 结果

### 需求: 模型类型 SHALL 映射为中文友好名称

#### 场景: 三种模型类型的显示名称

- WHEN 格式化模型进度
- THEN embed 显示为 "Embedding"
- AND generate 显示为 "Query Expansion"
- AND rerank 显示为 "Reranker"
