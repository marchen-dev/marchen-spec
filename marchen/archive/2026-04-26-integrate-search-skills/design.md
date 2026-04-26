## 背景

`marchen search` 通过 qmd SDK 提供语义搜索，依赖三个 GGUF 模型（~2GB）。当前问题：模型未下载时搜索直接失败，skill 模板中 AI 调用 `marchen search` 会触发模型下载导致长时间卡住。explore 的 command 版本也缺少搜索集成。

qmd 提供两层搜索 API：`store.search()`（hybrid，需要模型）和 `store.searchLex()`（BM25，纯 SQLite FTS5，不需要模型）。两者返回类型不同但核心字段（displayPath、title、score、context）兼容。

## 目标与非目标

**目标：**

- 模型不存在时自动降级为 BM25 搜索，不卡住、不报错
- `marchen init` 提供模型下载入口，让用户在初始化时决定
- explore command 模板补齐搜索步骤，apply 模板加搜索护栏

**非目标：**

- 不做搜索质量对比或评分校准
- 不在 CLI 输出中区分"语义模式"和"关键词模式"（对用户透明）

## 决策

**D1: 通过检查本地模型文件决定搜索模式，不读配置**

直接检查 `~/.marchen/models/qmd/` 下模型文件是否存在。不在 config.yaml 里存 `search: semantic | basic`。原因：模型可能被手动删除或从其他项目共享过来，文件存在性是唯一可靠的真相源。

**D2: prepare() 行为根据模型存在性分叉**

- 模型存在 → `ensureModels()` + `applyEnv()` + `initStore()`（完整语义搜索）
- 模型不存在且无 onModelProgress 回调 → 跳过模型，仅 `initStore()`（FTS 降级）
- 模型不存在但有 onModelProgress 回调 → 正常下载（用户显式触发，如 CLI `marchen search`）

这样 skill 里 AI 调 `marchen search --json` 不会触发下载（走 FTS），而用户手动 `marchen search --rebuild` 会触发下载（有 spinner 进度）。

**D3: searchLex 返回值适配**

`searchLex` 返回 `SearchResult`（qmd 类型），没有 `bestChunk` 字段。用 `body` 截取前 200 字符作为 snippet。`context` 字段两者都有。

**D4: index/indexChange 在无模型时跳过 embed**

`store.update()` 扫描文件写入 FTS 索引，不需要模型。`store.embed()` 生成向量，需要 embed 模型。无模型时只跑 update，跳过 embed。

**D5: init 交互放在 provider 选择之后**

模型下载是可选步骤，放在 `marchen init` 的最后。模型已存在时跳过询问。

## 风险与权衡

**R1: FTS 搜索质量明显低于语义搜索**

BM25 只做关键词匹配，不理解语义。"认证流程"搜不到"登录系统"。对于 skill 的上下文检索来说够用（archive 的 summary 包含关键语义词），但不如语义搜索精准。

**R2: prepare() 的分叉逻辑增加了复杂度**

通过 `hasModels` 布尔值控制分支，逻辑清晰。search/index 方法根据 `hasModels` 选择调用路径。
