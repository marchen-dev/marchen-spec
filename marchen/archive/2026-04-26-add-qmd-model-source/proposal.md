## 动机

qmd 默认从 HuggingFace 下载 GGUF 模型，在国内网络环境下速度极慢甚至无法连接。需要支持从自定义源（`https://models.suemor.com/qmd/`）下载模型，并在 CLI 中展示每个模型的下载进度。

当前 `SearchManager.getStore()` 直接调用 `createStore()` 创建 qmd store，没有模型管理逻辑。qmd 内部会自动从 HuggingFace 下载模型，过程中无进度反馈，用户只能看到命令卡住。

## 变更内容

- 在 `@marchen-spec/fs` 新增 `binary.ts` 模块，提供文件下载（带进度回调）、SHA-256 校验等底层操作
- 在 `@marchen-spec/core` 新增 `ModelManager` 类，负责从自定义 manifest 源获取模型元数据、下载缺失模型、校验完整性、设置 qmd 环境变量
- 改造 `SearchManager`，新增 `prepare()` 方法分离模型准备和 store 初始化，支持进度回调；`search()`/`index()` 保持签名干净
- 改造 CLI `search` 命令，在准备阶段通过 spinner 展示模型下载进度（模型名称、已下载/总大小、百分比）
- 将 CLI 的 `@marchen-spec/core` 和 `@marchen-spec/shared` 从 `devDependencies` 移至 `dependencies`

## 能力

### 新增能力

- `binary-file-ops`: fs 包二进制文件操作（下载、SHA-256、文件大小、删除、重命名）
- `model-manager`: 模型 manifest 获取、下载、校验、环境变量管理
- `search-prepare`: SearchManager 显式准备阶段，分离模型准备与 store 初始化
- `search-progress-ui`: CLI 搜索命令的模型下载进度展示

### 修改能力

（无）

## 影响范围

- `packages/fs/src/binary.ts` — 新建
- `packages/fs/src/index.ts` — 新增 re-export
- `packages/core/src/model-manager.ts` — 新建
- `packages/core/src/search-manager.ts` — 重构 getStore，新增 prepare()
- `packages/core/src/index.ts` — 新增导出
- `apps/cli/src/commands/search.ts` — 适配 prepare() + 进度展示
- `apps/cli/package.json` — 依赖调整
