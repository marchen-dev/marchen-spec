## 1. 类型和常量

- [x] 1.1 `packages/shared/src/types.ts` — ArtifactDefinition 加 `template?: string` 和 `instruction: string` 字段
- [x] 1.2 `packages/shared/src/constants.ts` — SPEC_DIRECTORY_NAME 改为 `'marchen'`

## 2. Schema 定义重构

- [x] 2.1 `packages/config/src/schema.ts` — 重写为包含 template/instruction 的完整 schema 定义，导出 `SCHEMAS` map（spec-driven + rapid）
- [x] 2.2 `packages/config/src/schema.ts` — 导出 `getSchema(name)` 辅助函数，找不到时抛错并提示可用列表
- [x] 2.3 `packages/config/src/templates.ts` — 删除 `ARTIFACT_TEMPLATES` 导出（模板常量保留供 schema 引用）
- [x] 2.4 `packages/config/src/instructions.ts` — 删除 `ARTIFACT_INSTRUCTIONS` 导出（指导常量保留供 schema 引用）
- [x] 2.5 `packages/config/src/index.ts` — 更新导出：加 SCHEMAS、getSchema，移除废弃的 flat map

## 3. ChangeManager 适配

- [x] 3.1 `packages/core/src/change-manager.ts` — create() 接受可选 schema 参数，用 getSchema() 查找，从 artifact 定义取 template
- [x] 3.2 `packages/core/src/change-manager.ts` — status() 从 metadata 读 schema 名，用 getSchema() 查找，遍历该 schema 的 artifacts
- [x] 3.3 `packages/core/src/change-manager.ts` — getInstructions() 从 artifact 定义取 instruction，移除对 ARTIFACT_INSTRUCTIONS 的引用
- [x] 3.4 `packages/core/src/change-manager.ts` — getApplyInstructions() 同样适配 schema 查找

## 4. CLI 命令

- [x] 4.1 `apps/cli/src/commands/new.ts` — 加 `--schema <name>` 选项（choices 从 SCHEMAS 取，默认 spec-driven）
- [x] 4.2 `apps/cli/src/commands/init.ts` — 用户提示文案中 `marchenspec` 改为 `marchen`

## 5. 模板和文档路径更新

- [x] 5.1 `packages/config/templates/commands/*.md`（3 个文件）— marchenspec/ → marchen/
- [x] 5.2 `packages/config/templates/skills/*.md`（2 个文件）— marchenspec/ → marchen/
- [x] 5.3 运行 `pnpm generate` 更新 generated 文件
- [x] 5.4 `.gitignore` — marchenspec → marchen
- [x] 5.5 docs/ 和 CLAUDE.md 文件 — 路径引用更新

## 6. 测试

- [x] 6.1 `packages/core/test/workspace.test.ts` — 路径断言 marchenspec → marchen
- [x] 6.2 `packages/core/test/change-manager.test.ts` — 路径断言更新 + 新增 rapid schema 测试用例
- [x] 6.3 运行 `pnpm test` 确认全部通过
