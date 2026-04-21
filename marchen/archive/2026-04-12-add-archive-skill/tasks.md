## 1. 类型和核心逻辑

- [x] 1.1 `packages/shared/src/types.ts` — 新增 `ArchiveResult` 类型 `{ name: string, schema: string, archivedTo: string, archivedAt: string }`
- [x] 1.2 `packages/core/src/change-manager.ts` — `archive()` 返回 `ArchiveResult`，归档前检查目标目录是否已存在（已存在时抛 `ValidationError`）
- [x] 1.3 `packages/core/test/change-manager.test.ts` — 更新 archive 测试：验证返回值、新增目标已存在的测试用例

## 2. CLI 命令

- [x] 2.1 `apps/cli/src/commands/archive.ts` — 增加 `--json` 选项，JSON 模式输出 `ArchiveResult`，非 JSON 模式保持现有交互式输出

## 3. 模板

- [x] 3.1 `packages/config/templates/skills/archive.md` — 新建 archive skill 模板
- [x] 3.2 `packages/config/templates/commands/archive.md` — 新建 archive command 模板
- [x] 3.3 运行 `pnpm generate` 确认生成 5 skill + 5 command

## 4. 测试和文档

- [x] 4.1 `packages/core/test/workspace.test.ts` — skill/command 数量断言更新（4 → 5）
- [x] 4.2 运行 `pnpm build && pnpm test` 确认全部通过
- [x] 4.3 更新 CLAUDE.md 文件（根目录 + packages/config + apps/cli）
