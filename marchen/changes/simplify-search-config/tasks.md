## 1. 类型定义和导出清理

- [x] 1.1 `packages/shared/src/types.ts` — 删除 `SearchMode` 类型，将 `WorkspaceConfig.search` 从 `{ mode: SearchMode }` 改为 `{ enabled: boolean }`
- [x] 1.2 `packages/shared/src/index.ts` — 从 re-export 列表中删除 `SearchMode`
- [x] 1.3 `packages/core/src/index.ts` — 从 re-export 中删除 `SearchMode`

## 2. 核心逻辑适配

- [x] 2.1 `packages/core/src/workspace.ts` — `InitializeOptions.searchMode` 改为 `searchEnabled?: boolean`，`initialize()` 写入 `search.enabled` 而非 `search.mode`
- [x] 2.2 `packages/core/src/workspace.ts` — `update()` 方法：添加旧 `search.mode` → `search.enabled` 迁移逻辑，补全缺失配置时写入 `{ enabled: false }`
- [x] 2.3 `packages/core/src/search-manager.ts` — 删除 `SearchMode` import，删除 `PrepareOptions.mode` 字段，`prepare()` 简化为单一路径（加载模型，失败抛 StateError），更新 JSDoc 和错误提示文案

## 3. CLI 命令适配

- [x] 3.1 `apps/cli/src/commands/init.ts` — 搜索选项从 `p.select<SearchMode>` 三选一改为 `p.confirm`，传参改为 `searchEnabled`，模型下载逻辑简化为 `if (searchEnabled)`
- [x] 3.2 `apps/cli/src/commands/search.ts` — 删除 `SearchMode` import，读取 `config.search?.enabled`，为 false 时报错退出，删除 `mode` 传参
- [x] 3.3 `apps/cli/src/commands/update.ts` — 搜索模型同步逻辑从三分支简化为 `if (enabled)` 二分支

## 4. 验证和文档

- [x] 4.1 运行 `pnpm check`（lint + typecheck + test）确认无 `SearchMode` 残留引用，构建通过
- [x] 4.2 更新 `packages/core/CLAUDE.md` 和 `apps/cli/CLAUDE.md` 中的搜索相关文档
