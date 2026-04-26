## 背景

MarchenSpec 通过 `@tobilu/qmd` 提供语义搜索能力。qmd 依赖三个 GGUF 模型（embedding、query expansion、reranker），默认从 HuggingFace 自动下载。在国内网络环境下 HuggingFace 访问不稳定，导致 `marchen search` 命令卡住无响应。

当前 `SearchManager` 直接调用 `createStore()` 创建 qmd store，模型下载由 qmd 内部的 `node-llama-cpp` 的 `resolveModelFile()` 处理。该函数期望 HuggingFace URI（`hf:org/repo/file.gguf`），传入本地绝对路径会导致挂起。qmd 支持通过环境变量 `QMD_EMBED_MODEL`、`QMD_GENERATE_MODEL`、`QMD_RERANK_MODEL` 指定本地模型路径。

## 目标与非目标

**目标：**

- 从自定义 CDN（`https://models.suemor.com/qmd/`）下载模型，绕过 HuggingFace
- 在 CLI 中实时展示每个模型的下载进度
- 分离模型准备和搜索逻辑，保持 `search()`/`index()` 签名干净
- 遵循项目分层约束：文件操作走 fs 包，业务逻辑在 core 包

**非目标：**

- 不支持用户自定义 manifest URL（硬编码即可，后续需要时再抽配置）
- 不替换 qmd 的模型加载机制，仅通过环境变量引导 qmd 使用本地模型
- 不实现模型版本升级/回退逻辑

## 决策

**D1: 通过环境变量而非 config.models 传递模型路径**

qmd 的 `createStore()` 接受 `config.models.embed` 等参数，但内部仍通过 `resolveModelFile()` 解析，该函数对本地绝对路径处理不当会挂起。环境变量 `QMD_EMBED_MODEL` 等在 `LlamaCpp` 构造函数中被优先读取，直接赋值给 `embedModelUri`，跳过 `resolveModelFile()`。

**D2: manifest.json 驱动模型元数据**

模型文件名、下载 URL、SHA-256、文件大小全部由远程 `manifest.json` 定义。本地不硬编码文件名，`ModelManager` 从 manifest 获取一切。这样更换模型版本只需更新 CDN 上的 manifest，无需发版。

**D3: SearchManager.prepare() 作为显式准备入口**

`prepare(options?)` 是唯一接受 `onModelProgress` 回调的方法。CLI 显式调用 `prepare()` 控制 spinner 时机。如果未调用 `prepare()`，`search()`/`index()` 内部自动触发（无进度回调），保证 API 不会误用。

**D4: binary.ts 放在 fs 包**

下载、SHA-256、文件大小等是纯文件操作，不含业务语义。放在 fs 包符合项目"文件操作走 fs 包"的约束，且 `ModelManager` 通过 `@marchen-spec/fs` 调用，依赖方向正确。

**D5: 模型存储在 `~/.marchen/models/qmd/`**

与 qmd 默认的 `~/.cache/qmd/models/` 分开，避免和 qmd 自身缓存冲突。用户级目录，跨项目共享。

## 风险与权衡

**R1: manifest CDN 不可达**

如果 `models.suemor.com` 不可达，`ensureModels()` 会抛出 `ValidationError`。CLI 层 catch 后给出明确提示。不做自动 fallback 到 HuggingFace — 如果用户网络能访问 HuggingFace，就不需要这个功能。

**R2: 模型文件损坏**

下载后通过 SHA-256 校验。校验失败删除临时文件并抛错，下次执行会重新下载。使用 `.part` 后缀的临时文件，避免校验失败的文件被误认为有效。

**R3: addContext 每次进程启动都执行**

qmd 的 `addContext` 是 upsert 语义（同 key 覆盖），不会产生重复数据。开销是一次 SQLite SELECT + UPDATE，可忽略。
