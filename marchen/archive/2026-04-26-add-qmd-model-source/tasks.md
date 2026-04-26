## 1. fs 包：新增 binary.ts

- [x] 1.1 `packages/fs/src/binary.ts` — 实现 `downloadFile(url, outputPath, options?)`，stream 写入 + 进度回调 + 自动创建父目录
- [x] 1.2 `packages/fs/src/binary.ts` — 实现 `sha256File(path)`，stream 计算 SHA-256
- [x] 1.3 `packages/fs/src/binary.ts` — 实现 `getFileSize(path)`、`removeFile(path)`、`renameFile(src, dest)`
- [x] 1.4 `packages/fs/src/index.ts` — re-export binary.ts 的所有函数和类型
- [x] 1.5 编写 `packages/fs/test/binary.test.ts` 单元测试

## 2. core 包：新增 ModelManager

- [x] 2.1 `packages/core/src/model-manager.ts` — 定义类型（QmdModelKind、ModelDownloadStage、QmdModelManifest、QmdModelPaths、ModelDownloadProgress）
- [x] 2.2 `packages/core/src/model-manager.ts` — 实现 `fetchManifest()`，从 `https://models.suemor.com/qmd/manifest.json` 获取模型元数据
- [x] 2.3 `packages/core/src/model-manager.ts` — 实现 `ensureModels(options?)`，按 embed → generate → rerank 顺序确保模型就绪，支持 onProgress 回调
- [x] 2.4 `packages/core/src/model-manager.ts` — 实现 `applyEnv(paths)`，设置 QMD_EMBED_MODEL / QMD_GENERATE_MODEL / QMD_RERANK_MODEL 环境变量
- [x] 2.5 `packages/core/src/index.ts` — 导出 ModelManager 类和相关类型

## 3. core 包：改造 SearchManager

- [x] 3.1 `packages/core/src/search-manager.ts` — 新增 `prepare(options?)` 方法，内部调用 ModelManager.ensureModels + applyEnv + initStore
- [x] 3.2 `packages/core/src/search-manager.ts` — 将 `getStore()` 改为在未 prepare 时自动触发 prepare()
- [x] 3.3 `packages/core/src/search-manager.ts` — 保留 `isAvailable()` 不变
- [x] 3.4 `packages/core/src/index.ts` — 导出 PrepareOptions 类型

## 4. CLI：适配 prepare + 进度展示

- [x] 4.1 `apps/cli/package.json` — 将 `@marchen-spec/core` 和 `@marchen-spec/shared` 从 devDependencies 移至 dependencies
- [x] 4.2 `apps/cli/src/commands/search.ts` — 新增 `formatModelProgress()` 函数，将 ModelDownloadProgress 格式化为用户友好文本
- [x] 4.3 `apps/cli/src/commands/search.ts` — 在搜索前调用 `search.prepare({ onModelProgress })` 并通过 spinner 展示进度

## 5. 验证

- [x] 5.1 `pnpm build` 全量构建通过
- [x] 5.2 `pnpm test` 测试通过
- [x] 5.3 删除本地模型后执行 `marchen search "xxx" --rebuild`，验证自动下载 + 进度展示 + 搜索正常
