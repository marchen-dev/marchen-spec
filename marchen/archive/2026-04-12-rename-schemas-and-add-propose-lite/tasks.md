## 1. Schema 重命名（代码）

- [x] 1.1 `packages/config/src/schema.ts` — SCHEMAS key `'spec-driven'` → `'full'`，`'rapid'` → `'lite'`；两个 `name` 字段同步改；`DEFAULT_SCHEMA_NAME` → `'full'`；`RAPID_TASKS_TEMPLATE` → `LITE_TASKS_TEMPLATE`；注释更新
- [x] 1.2 `packages/config/src/index.ts` — 确认导出无硬编码 schema 名（应该只导出常量，无需改）
- [x] 1.3 `apps/cli/src/commands/new.ts` — `--schema` choices 和默认值中的 schema 名
- [x] 1.4 `apps/cli/src/commands/status.ts` — 如有 schema 名字符串引用则更新

## 2. Schema 重命名（测试）

- [x] 2.1 `packages/core/test/change-manager.test.ts` — schema 名字面量替换
- [x] 2.2 `packages/core/test/workspace.test.ts` — schema 名字面量替换
- [x] 2.3 `packages/fs/test/fs.test.ts` — schema 名字面量替换
- [x] 2.4 运行 `pnpm test` 确认全部通过

## 3. Schema 重命名（文档和模板）

- [x] 3.1 `packages/config/CLAUDE.md` — schema 名引用
- [x] 3.2 `packages/core/CLAUDE.md` — schema 名引用
- [x] 3.3 `docs/references/specs-architecture-decision.md` — schema 名引用
- [x] 3.4 `openspec/specs/workflow-computation/spec.md` — `spec-driven` 引用
- [x] 3.5 `openspec/specs/multi-schema-support/spec.md` — `spec-driven` 引用
- [x] 3.6 `openspec/specs/rapid-schema/spec.md` — `rapid` 引用（考虑重命名 spec 目录）
- [x] 3.7 `openspec/specs/change-creation/spec.md` — `spec-driven` / `rapid` 引用
- [x] 3.8 `.claude/skills/` 4 个文件 — schema 名引用（实际是 OpenSpec 自身的 skill，不属于 MarchenSpec 重命名范围）
- [x] 3.9 `.claude/commands/opsx/` 3 个文件 — schema 名引用（同上，OpenSpec 自身的 command）

## 4. 新增 propose-lite 模板

- [x] 4.1 `packages/config/templates/commands/propose-lite.md` — 新建 command 模板
- [x] 4.2 `packages/config/templates/skills/propose-lite.md` — 新建 skill 模板
- [x] 4.3 运行 `pnpm generate` 更新 generated 文件
- [x] 4.4 `packages/config/src/index.ts` — 确认新模板被导出

## 5. init 命令适配

- [x] 5.1 `apps/cli/src/commands/init.ts` — 确认无需改动（workspace.initialize 自动遍历模板 map）
- [x] 5.2 运行 `pnpm build && pnpm test` 确认全部通过
