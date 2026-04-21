## 动机

当前所有业务错误都使用单一的 `MarchenSpecError` 类，CLI 层无法区分用户输入错误、状态前置条件错误和文件系统异常，导致错误处理粗糙且每个命令重复相同的 catch 模式。

## 变更内容

- 将 `MarchenSpecError` 拆分为三个语义化子类：`ValidationError`、`StateError`、`FileSystemError`
- 每个子类携带不同的结构化数据（`hint`、`path`、`cause`）
- CLI 层抽取共享的 `handleError()` 函数，按错误类型差异化展示
- 现有 `instanceof MarchenSpecError` 检查保持兼容

## 能力

### 新增能力
- `error-hierarchy`: 错误类继承体系设计，包含基类和三个子类的定义、字段、使用场景

### 修改能力

## 影响范围

- `packages/shared/src/errors.ts` — 新增子类定义
- `packages/shared/src/index.ts` — 导出新类
- `packages/fs/src/file.ts`、`directory.ts`、`yaml.ts` — 改用 `FileSystemError`
- `packages/core/src/change-manager.ts` — 改用 `ValidationError`、`StateError`
- `apps/cli/src/commands/*` — 统一使用 `handleError()`
- `apps/cli/src/utils/error.ts` — 新增共享错误处理函数
