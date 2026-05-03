## 背景

`workspace.update()` 在 config.yaml 缺少 `providers` 字段时（老项目升级场景），`providerIds` 为空数组，导致 skill/command 文件不会生成，且版本号被写入后下次 update 直接跳过。

修复：`providers` 缺失时 fallback 到 `DEFAULT_PROVIDER_IDS`，与 `initialize` 行为一致。同时将补全后的 providers 写回 config.yaml。

## 1. 修复 update providers fallback

- [x] 1.1 `workspace.update()` 中 `providerIds` 为空时 fallback 到 `DEFAULT_PROVIDER_IDS`，并将补全的 providers 写回 config
- [x] 1.2 类型检查 + 测试通过
