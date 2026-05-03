## 背景

`resolveLocalModels` 在本地 manifest 不存在时直接抛出 `StateError`，导致已有用户升级后首次 search 失败（update 的 `hasModels: true` 分支不调用 `ensureModels`，不会写本地 manifest）。

修复：`resolveLocalModels` 在本地 manifest 不存在时 fallback 到 `ensureModels`，自动生成 manifest 并返回路径，仅首次慢一次。

## 1. 修复 resolveLocalModels fallback

- [x] 1.1 修改 `resolveLocalModels`：本地 manifest 不存在时调用 `ensureModels` 而非抛错
- [x] 1.2 构建 + 类型检查通过
- [x] 1.3 手动验证：删除本地 manifest 后 search 能自动恢复
