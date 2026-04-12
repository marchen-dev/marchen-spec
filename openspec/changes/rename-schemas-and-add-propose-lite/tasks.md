## 1. Schema 重命名（代码）

- [ ] 1.1 `packages/config/src/schema.ts` — SCHEMAS key `'spec-driven'` → `'full'`，`'rapid'` → `'lite'`；两个 `name` 字段同步改；`DEFAULT_SCHEMA_NAME` → `'full'`；`RAPID_TASKS_TEMPLATE` → `LITE_TASKS_TEMPLATE`；注释更新
- [ ] 1.2 `packages/config/src/index.ts` — 确认导出无硬编码 schema 名（应该只导出常量，无需改）
- [ ] 1.3 `apps/cli/src/commands/new.ts` — `--schema` choices 和默认值中的 schema 名
- [ ] 1.4 `apps/cli/src/commands/status.ts` — 如有 schema 名字符串引用则更新

## 2. Schema 重命名（测试）

- [ ] 2.1 `packages/core/test/change-manager.test.ts` — schema 名字面量替换
- [ ] 2.2 `packages/core/test/workspace.test.ts` — schema 名字面量替换
- [ ] 2.3 `packages/fs/test/fs.test.ts` — schema 名字面量替换
- [ ] 2.4 运行 `pnpm test` 确认全部通过

## 3. Schema 重命名（文档和模板）

- [ ] 3.1 `packages/config/CLAUDE.md` — schema 名引用
- [ ] 3.2 `packages/core/CLAUDE.md` — schema 名引用
- [ ] 3.3 `docs/references/specs-architecture-decision.md` — schema 名引用
- [ ] 3.4 `openspec/specs/workflow-computation/spec.md` — `spec-driven` 引用
- [ ] 3.5 `openspec/specs/multi-schema-support/spec.md` — `spec-driven` 引用
- [ ] 3.6 `openspec/specs/rapid-schema/spec.md` — `rapid` 引用（考虑重命名 spec 目录）
- [ ] 3.7 `openspec/specs/change-creation/spec.md` — `spec-driven` / `rapid` 引用
- [ ] 3.8 `.claude/skills/` 4 个文件 — schema 名引用
- [ ] 3.9 `.claude/commands/opsx/` 3 个文件 — schema 名引用

## 4. 新增 propose-lite 模板

- [ ] 4.1 `packages/config/templates/commands/propose-lite.md` — 新建 command 模板
- [ ] 4.2 `packages/config/templates/skills/propose-lite.md` — 新建 skill 模板
- [ ] 4.3 运行 `pnpm generate` 更新 generated 文件
- [ ] 4.4 `packages/config/src/index.ts` — 确认新模板被导出

## 5. init 命令适配

- [ ] 5.1 `apps/cli/src/commands/init.ts` — 注册 propose-lite 模板到 skill/command 生成列表
- [ ] 5.2 运行 `pnpm build && pnpm test` 确认全部通过
