## 1. 修改源码

- [x] 1.1 从 `packages/core/src/workspace.ts` 的 `initialize()` 方法中移除 `context: ''` 和 `perArtifactRules: {}` 两行

## 2. 更新测试

- [x] 2.1 更新 `packages/core/test/workspace.test.ts` 中 init 相关测试，移除对 `context` 和 `perArtifactRules` 的断言
- [x] 2.2 更新 `packages/core/test/workspace.test.ts` 中 update 的"保留其他字段"测试，确认 `update()` 仍能透传这些字段（保留该测试用例，验证向后兼容）
- [x] 2.3 更新 `packages/fs/test/fs.test.ts` 中的测试数据，移除 `context` 和 `perArtifactRules`（如果存在）

## 3. 验证

- [x] 3.1 运行 `pnpm test` 确认所有测试通过
- [x] 3.2 运行 `pnpm check` 确认 lint + typecheck + test 全部通过
