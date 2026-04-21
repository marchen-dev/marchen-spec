## 1. Core 层 - listChanges 函数

- [x] 1.1 在 `packages/core/src/change.ts` 中新增 `listChanges()` 函数：扫描 `marchenspec/changes/`，过滤 `archive` 目录，读取各目录的 `.metadata.yaml`，跳过缺失元数据的目录，返回按 `createdAt` 降序排列的 `ChangeMetadata[]`
- [x] 1.2 在 `packages/core/src/index.ts` 中导出 `listChanges`
- [x] 1.3 在 `packages/core/test/` 中添加 `listChanges()` 的单元测试，覆盖：正常列出、无变更、元数据缺失跳过、archive 排除

## 2. CLI 层 - list 命令

- [x] 2.1 创建 `apps/cli/src/commands/list.ts`，实现 `registerListCommand()`：调用 `listChanges()` 并格式化输出为表格（名称/Schema/创建时间），处理空状态和错误
- [x] 2.2 添加 `timeAgo()` 辅助函数，实现相对时间格式化（放在 cli 工具目录或内联）
- [x] 2.3 在 `apps/cli/src/index.ts` 中注册 list 命令

## 3. 验证

- [x] 3.1 执行 `pnpm build` 确认所有包编译通过
- [x] 3.2 执行 `pnpm test` 确认所有测试通过
- [x] 3.3 执行 `pnpm check`（lint + typecheck + test）完整验证
