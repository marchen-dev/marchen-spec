### 需求: ModelManager SHALL 从自定义 manifest 源获取模型元数据

`fetchManifest()` 从 `https://models.suemor.com/qmd/manifest.json` 获取模型列表，包含文件名、下载地址、SHA-256 和文件大小。

#### 场景: 成功获取 manifest

- GIVEN manifest URL 可访问
- WHEN 调用 `ensureModels()`
- THEN 内部成功解析 manifest，获得 embed/generate/rerank 三个模型的元数据

#### 场景: manifest 不可达时抛出 ValidationError

- GIVEN manifest URL 返回非 200 状态码
- WHEN 调用 `ensureModels()`
- THEN 抛出 `ValidationError`

### 需求: ModelManager SHALL 按 embed → generate → rerank 顺序确保模型就绪

每个模型独立经历 checking → downloading → verifying → ready 阶段。

#### 场景: 模型已存在且校验通过

- GIVEN 本地模型文件存在，size 和 sha256 与 manifest 匹配
- WHEN 调用 `ensureModels()`
- THEN 跳过下载，直接标记为 ready
- AND onProgress 依次收到 checking → ready

#### 场景: 模型不存在时自动下载

- GIVEN 本地模型文件不存在
- WHEN 调用 `ensureModels({ onProgress })`
- THEN 从 manifest 中的 url 下载模型到 `~/.marchen/models/qmd/`
- AND onProgress 依次收到 checking → downloading（多次，含 downloadedBytes/totalBytes）→ verifying → ready

#### 场景: 下载后校验失败

- GIVEN 下载的文件 sha256 与 manifest 不匹配
- WHEN 校验阶段执行
- THEN 删除临时文件
- AND 抛出 `ValidationError`

### 需求: ModelManager.applyEnv SHALL 设置 QMD 环境变量

将本地模型路径写入 `process.env.QMD_EMBED_MODEL`、`QMD_GENERATE_MODEL`、`QMD_RERANK_MODEL`，使 qmd 使用本地模型而非从 HuggingFace 下载。

#### 场景: 设置三个环境变量

- GIVEN ensureModels() 返回的 QmdModelPaths
- WHEN 调用 `applyEnv(paths)`
- THEN `process.env.QMD_EMBED_MODEL` 等于 paths.embed
- AND `process.env.QMD_GENERATE_MODEL` 等于 paths.generate
- AND `process.env.QMD_RERANK_MODEL` 等于 paths.rerank

### 需求: 模型下载进度 SHALL 包含模型类型和阶段信息

`ModelDownloadProgress` 携带 `model`（QmdModelKind）、`file`、`stage`（ModelDownloadStage），downloading 阶段额外携带 `downloadedBytes` 和 `totalBytes`。

#### 场景: 进度回调包含完整信息

- GIVEN 模型需要下载
- WHEN onProgress 在 downloading 阶段被调用
- THEN progress.model 为 'embed' | 'generate' | 'rerank'
- AND progress.file 为模型文件名
- AND progress.stage 为 'downloading'
- AND progress.downloadedBytes 和 progress.totalBytes 均为数字
