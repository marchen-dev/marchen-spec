## 1. 基础设施

- [x] 1.1 `packages/core/package.json` — 添加 `@tobilu/qmd` 到 dependencies
- [x] 1.2 `apps/cli/tsdown.config.ts` — 将 `@tobilu/qmd`、`node-llama-cpp` 及其相关 native 依赖加入 external
- [x] 1.3 `.gitignore` — 添加 `marchen/.search/` 和 `**/.search/`

## 2. Workspace 扩展

- [x] 2.1 `packages/core/src/workspace.ts` — 添加 `searchDbPath` 只读属性，值为 `join(specDir, '.search', 'index.sqlite')`
- [x] 2.2 `packages/core/src/workspace.ts` — `initialize()` 方法中创建 `.search/` 目录

## 3. SearchManager 实现

- [x] 3.1 `packages/core/src/search-manager.ts` — 创建 SearchManager 类，实现 `isAvailable()` 方法（dynamic import + 结果缓存）
- [x] 3.2 `packages/core/src/search-manager.ts` — 实现 `getStore()` 私有方法（懒初始化 qmd store，配置 collection 和 context）
- [x] 3.3 `packages/core/src/search-manager.ts` — 实现 `search(query, options)` 方法，返回结构化结果数组
- [x] 3.4 `packages/core/src/search-manager.ts` — 实现 `index()` 全量索引方法（update + embed）
- [x] 3.5 `packages/core/src/search-manager.ts` — 实现 `indexChange()` 增量索引方法
- [x] 3.6 `packages/core/src/search-manager.ts` — 实现 `close()` 资源释放方法
- [x] 3.7 `packages/core/src/index.ts` — 导出 SearchManager

## 4. Archive 索引集成

- [x] 4.1 `packages/core/src/change-manager.ts` — `archive()` 方法末尾添加搜索索引更新 hook（try/catch 包裹，失败静默）

## 5. CLI search 命令

- [x] 5.1 `apps/cli/src/commands/search.ts` — 创建 search 命令，注册 query 参数和 --json/--limit/--min-score/--rebuild 选项
- [x] 5.2 `apps/cli/src/commands/search.ts` — 实现 qmd 不可用时的错误提示
- [x] 5.3 `apps/cli/src/commands/search.ts` — 实现 --rebuild 逻辑（先调用 index() 再搜索）
- [x] 5.4 `apps/cli/src/commands/search.ts` — 实现终端格式化输出（路径、分数百分比、摘要片段）
- [x] 5.5 `apps/cli/src/index.ts` — 注册 search 命令

## 6. Skill 模板更新

- [x] 6.1 `packages/config/src/skill-templates/` — 更新 explore skill 模板，在"检查上下文"阶段添加 `marchen search` 调用指引

## 7. 验证

- [x] 7.1 `pnpm build` 构建通过，确认 external 配置正确
- [x] 7.2 手动测试：`marchen search "异常处理" --json` 返回相关结果
- [x] 7.3 手动测试：`marchen archive` 后索引自动更新
- [x] 7.4 手动测试：qmd 不可用时 `marchen search` 优雅降级，其他命令正常
