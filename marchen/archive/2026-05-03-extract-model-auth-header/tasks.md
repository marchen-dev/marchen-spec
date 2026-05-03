## 背景

`ModelManager` 中模型下载的认证 header（`X-Model-Token`）以字符串字面量硬编码在 `ensureModel` 方法内，且 `fetchManifest` 未携带该 header。将 token 提取为文件级常量，统一两个请求点的 header 使用。

## 1. 提取常量并统一引用

- [x] 1.1 在 `model-manager.ts` 文件顶部定义 `MODEL_AUTH_HEADERS` 常量
- [x] 1.2 `fetchManifest` 方法的 fetch 调用添加 `headers: MODEL_AUTH_HEADERS`
- [x] 1.3 `ensureModel` 方法中将 headers 字面量替换为 `MODEL_AUTH_HEADERS` 引用
- [x] 1.4 更新 `binary.test.ts` 中的测试以覆盖 headers 传递
