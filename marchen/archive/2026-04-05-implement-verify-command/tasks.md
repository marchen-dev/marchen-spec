## 1. 类型定义

- [x] 1.1 在 `packages/shared/src/types.ts` 新增 `TaskItem`、`ArtifactStatus`、`VerifyResult` 接口
- [x] 1.2 在 `packages/shared/src/index.ts` 导出新增类型

## 2. Core 逻辑

- [x] 2.1 在 `packages/core/src/change-manager.ts` 新增 `verify(name)` 方法
- [x] 2.2 实现 artifact 存在性检查（proposal.md / design.md / tasks.md / specs/）
- [x] 2.3 实现 specs/ 子目录扫描，提取 capability 列表
- [x] 2.4 实现 tasks.md 解析，用正则提取 checkbox 状态和描述

## 3. CLI 命令

- [x] 3.1 新增 `apps/cli/src/commands/verify.ts`，注册 `marchen verify <name>` 命令
- [x] 3.2 实现终端 UI 展示（artifact 状态 + task 完成度 + 未完成列表）
- [x] 3.3 实现 `--json` 标志，输出 JSON 格式的 VerifyResult

## 4. 测试

- [x] 4.1 在 `packages/core/test/change-manager.test.ts` 新增 verify 方法的单元测试
- [x] 4.2 构建并运行全部测试
