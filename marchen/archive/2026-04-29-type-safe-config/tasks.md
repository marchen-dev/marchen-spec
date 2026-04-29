## 背景

config.yaml 的读取目前返回 `Record<string, unknown>`，调用方需要手动 `as` 断言提取字段。对比 .metadata.yaml 已有 `ChangeMetadata` 类型和 `METADATA_FILE_NAME` 常量的模式，config.yaml 缺少类型安全封装。将 `SearchMode` 和新增的 `WorkspaceConfig` 接口下沉到 shared 包，`readConfig()` 返回类型化结果，CLI 命令移除手动断言。

## 1. shared 包：新增类型和常量

- [x] 1.1 在 shared/src/types.ts 新增 `SearchMode` 类型和 `WorkspaceConfig` 接口
- [x] 1.2 在 shared/src/constants.ts 新增 `CONFIG_FILE_NAME` 常量
- [x] 1.3 在 shared/src/index.ts 导出新增项

## 2. core 包：迁移 SearchMode，改造 readConfig

- [x] 2.1 workspace.ts 中 `SearchMode` 改为从 shared 导入，移除本地定义
- [x] 2.2 workspace.ts 中 `readConfig()` 返回类型改为 `WorkspaceConfig`
- [x] 2.3 workspace.ts 中 configPath 使用 `CONFIG_FILE_NAME` 常量
- [x] 2.4 core/src/index.ts 中 `SearchMode` 改为 re-export from shared

## 3. CLI 命令：移除手动断言

- [x] 3.1 update.ts 中移除 `as Record<string, unknown>` 断言，直接用 `config.search?.mode`
- [x] 3.2 search.ts 中移除 `as Record<string, unknown>` 和 `as SearchMode` 断言
- [x] 3.3 init.ts 中 `SearchMode` 导入源确认正确

## 4. 验证

- [x] 4.1 运行 pnpm check 确保通过
