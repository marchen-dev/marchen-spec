## 1. SearchManager FTS 降级

- [x] 1.1 `packages/core/src/search-manager.ts` — 新增 `hasModels()` 私有方法，检查 `~/.marchen/models/qmd/` 下模型文件是否存在
- [x] 1.2 `packages/core/src/search-manager.ts` — 修改 `prepare()`，无模型且无 onModelProgress 回调时跳过 ensureModels，仅 initStore
- [x] 1.3 `packages/core/src/search-manager.ts` — 修改 `search()`，根据 `hasModels` 选择 `store.search()` 或 `store.searchLex()`，适配返回值差异
- [x] 1.4 `packages/core/src/search-manager.ts` — 修改 `index()` 和 `indexChange()`，无模型时跳过 `store.embed()`

## 2. CLI init 模型下载选项

- [x] 2.1 `apps/cli/src/commands/init.ts` — 在 provider 选择之后新增交互：是否下载搜索模型（模型已存在时跳过）
- [x] 2.2 `apps/cli/src/commands/init.ts` — 用户选择下载时调用 ModelManager.ensureModels 并通过 spinner 展示进度

## 3. 模板更新

- [x] 3.1 `packages/config/templates/commands/explore.md` — 补齐 `marchen search` 步骤，对齐 skill 版本
- [x] 3.2 `packages/config/templates/skills/apply.md` — 护栏加入搜索历史方案的指引
- [x] 3.3 `packages/config/templates/commands/apply.md` — 护栏加入搜索历史方案的指引

## 4. 验证

- [x] 4.1 `pnpm build` 全量构建通过
- [x] 4.2 `pnpm check` 完整检查通过（lint + typecheck + test）
- [x] 4.3 删除本地模型后执行 `marchen search "xxx" --json`，验证 FTS 降级正常返回结果
