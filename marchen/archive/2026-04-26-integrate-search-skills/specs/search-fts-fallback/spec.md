### 需求: SearchManager SHALL 在模型不存在时自动降级为 BM25 搜索

#### 场景: 模型已下载时使用完整语义搜索

- GIVEN 本地模型文件存在（~/.marchen/models/qmd/ 下三个 .gguf 文件）
- WHEN 调用 `search(query)`
- THEN 使用 qmd 的 `store.search()`（hybrid：BM25 + vector + reranking）
- AND 返回 SearchResult 数组

#### 场景: 模型不存在时降级为 FTS 搜索

- GIVEN 本地模型文件不存在
- WHEN 调用 `search(query)`
- THEN 使用 qmd 的 `store.searchLex()`（纯 BM25 关键词搜索）
- AND 不触发模型下载
- AND 返回 SearchResult 数组（snippet 从 body 截取）

#### 场景: prepare 在无模型时跳过模型下载

- GIVEN 本地模型文件不存在
- WHEN 调用 `prepare()`（无 onModelProgress 回调）
- THEN 跳过 ModelManager.ensureModels
- AND 仅初始化 qmd store
- AND 后续 search 使用 FTS 降级

#### 场景: prepare 在有模型时正常加载

- GIVEN 本地模型文件存在
- WHEN 调用 `prepare({ onModelProgress })`
- THEN 通过 ModelManager 校验模型
- AND 设置环境变量
- AND 初始化 qmd store
- AND 后续 search 使用完整语义搜索

### 需求: index 和 indexChange SHALL 在无模型时仅执行 update 跳过 embed

#### 场景: 无模型时 index 只扫描不生成向量

- GIVEN 本地模型文件不存在
- WHEN 调用 `index()`
- THEN 执行 `store.update()`（扫描文件写入 FTS 索引）
- AND 跳过 `store.embed()`
- AND 不报错
