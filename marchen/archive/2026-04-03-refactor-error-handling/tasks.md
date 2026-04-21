## 1. 定义错误子类

- [x] 1.1 在 `packages/shared/src/errors.ts` 新增 `ValidationError`、`StateError`、`FileSystemError` 三个子类
- [x] 1.2 在 `packages/shared/src/index.ts` 导出新增的三个子类

## 2. 迁移抛出侧

- [x] 2.1 `packages/fs/src/file.ts` — 改用 `FileSystemError`
- [x] 2.2 `packages/fs/src/directory.ts` — 改用 `FileSystemError`
- [x] 2.3 `packages/fs/src/yaml.ts` — 改用 `FileSystemError`，传入 `cause`
- [x] 2.4 `packages/core/src/change-manager.ts` — 改用 `ValidationError` 和 `StateError`

## 3. CLI 错误处理统一

- [x] 3.1 新增 `apps/cli/src/utils/error.ts`，实现 `handleError()` 函数
- [x] 3.2 `apps/cli/src/commands/new.ts` — 使用 `handleError()`
- [x] 3.3 `apps/cli/src/commands/list.ts` — 使用 `handleError()`
- [x] 3.4 `apps/cli/src/commands/archive.ts` — 使用 `handleError()`

## 4. 测试验证

- [x] 4.1 更新 `packages/core/test/change-manager.test.ts` 中的错误类型断言
- [x] 4.2 构建并运行全部测试
