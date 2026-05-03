## 背景

每次 `marchen search` 都会调用 `ensureModels`，触发一次 manifest 网络请求和 3 个模型文件的 sha256 校验（2.1GB），耗时 3-5 秒。search 场景只需确认模型文件存在，不需要完整性校验。

方案：`ensureModels` 成功后将 manifest 缓存到本地文件；新增 `resolveLocalModels` 方法读取本地 manifest，仅检查文件存在性；`SearchManager.prepare` 改为调用轻量方法。

## 1. ModelManager 本地 manifest 缓存

- [x] 1.1 新增 `saveLocalManifest` 私有方法，将 manifest 写入 `~/.marchen/models/qmd/manifest.json`
- [x] 1.2 在 `ensureModels` 成功后调用 `saveLocalManifest`
- [x] 1.3 新增 `resolveLocalModels` 公开方法：读取本地 manifest，检查 3 个模型文件存在性，返回 `QmdModelPaths`；本地 manifest 不存在或文件缺失时抛出 `StateError`

## 2. SearchManager 使用轻量路径

- [x] 2.1 `SearchManager.prepare` 改为调用 `modelManager.resolveLocalModels()` 替代 `ensureModels`，移除 `onModelProgress` 相关逻辑
- [x] 2.2 更新 `PrepareOptions` 接口，移除不再需要的 `onModelProgress`
- [x] 2.3 更新 CLI search 命令中 `prepare` 的调用，移除进度回调

## 3. 验证

- [x] 3.1 类型检查通过
- [x] 3.2 现有测试通过
