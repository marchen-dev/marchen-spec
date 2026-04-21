## 1. shared 包拆分

- [x] 1.1 将 `packages/shared/src/index.ts` 拆分为 `types.ts`（接口和类型）、`constants.ts`（常量）、`errors.ts`（MarchenSpecError），index.ts 统一 re-export
- [x] 1.2 运行 `pnpm build && pnpm test` 确认拆分不影响功能

## 2. fs 包拆分

- [x] 2.1 将 `packages/fs/src/index.ts` 拆分为 `paths.ts`（路径解析）、`directory.ts`（目录操作）、`file.ts`（文件读写）、`yaml.ts`（YAML 操作），index.ts 统一 re-export
- [x] 2.2 运行 `pnpm build && pnpm test` 确认拆分不影响功能

## 3. core 包重构 — Workspace 类

- [x] 3.1 创建 `packages/core/src/workspace.ts`，实现 `Workspace` 类：构造函数计算 root/specDir/changeDir 路径，提供 packageBoundaries 只读属性，实现 `isInitialized()` 和 `initialize()` 方法
- [x] 3.2 更新 `packages/core/src/index.ts`，导出 `Workspace` 类，移除旧的 `inspectFoundation`、`getFoundationStatus`、`checkIfInitialized`、`initializeMarchenSpec` 导出
- [x] 3.3 更新 `packages/core/test/` 中 init 和 foundation 的测试，改为通过 Workspace 实例调用

## 4. core 包重构 — ChangeManager 类

- [x] 4.1 创建 `packages/core/src/change-manager.ts`，实现 `ChangeManager` 类：构造函数接收 Workspace，实现 `create(name)` 和 `list()` 方法，提供 `static isValidName(name)` 静态方法
- [x] 4.2 删除旧的 `packages/core/src/change.ts` 和 `packages/core/src/init.ts`
- [x] 4.3 更新 `packages/core/src/index.ts`，导出 `ChangeManager` 类，移除旧的函数导出
- [x] 4.4 更新 `packages/core/test/change.test.ts`，改为通过 ChangeManager 实例调用

## 5. CLI 适配

- [x] 5.1 更新 `apps/cli/src/commands/init.ts`，使用 `new Workspace()` 替代直接调用函数
- [x] 5.2 更新 `apps/cli/src/commands/new.ts`，使用 `new Workspace()` + `new ChangeManager(workspace)` 替代直接调用函数
- [x] 5.3 更新 `apps/cli/src/commands/list.ts`，使用 `new Workspace()` + `new ChangeManager(workspace)` 替代直接调用函数

## 6. 验证

- [x] 6.1 运行 `pnpm build` 确认所有包编译通过
- [x] 6.2 运行 `pnpm test` 确认所有测试通过
- [x] 6.3 运行 `pnpm check`（lint + typecheck + test）完整验证
