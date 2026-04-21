## 1. Workspace Foundation

- [x] 1.1 将仓库 root 改造成 pnpm workspace，包含 `apps/*`、`packages/*` 以及最小可用的 `turbo.json` pipeline。
- [x] 1.2 添加 root-level shared configuration，覆盖 TypeScript、ESLint、Prettier、Vitest 与常用 workspace scripts。
- [x] 1.3 更新 root package metadata 与 development dependencies，使其支持 Turbo、tsdown、Vitest、ESLint、Prettier、bumpp 与 shared Node/ESM workflow。

## 2. Initial Package Structure

- [x] 2.1 创建 `apps/cli`，补齐 package manifest、build config、TypeScript config，以及面向未来 command registration 的最小 CLI entrypoint。
- [x] 2.2 创建 `packages/core`、`packages/fs`、`packages/config`、`packages/shared`，补齐 package manifest、TypeScript config 与最小 public export。
- [x] 2.3 建立 package dependency boundary，确保 CLI 依赖内部 packages，且内部 packages 遵守预期的单向依赖流。

## 3. Tooling Integration

- [x] 3.1 为 CLI app 与内部 packages 配置 `tsdown` build，使 workspace build task 产出一致的 package output。
- [x] 3.2 为 workspace testing 配置 `vitest`，并添加至少一条最小 smoke test 路径，用来证明 tooling wiring 正常。
- [x] 3.3 配置 `@antfu/eslint-config` 仅负责 linting，配置 `@suemor/prettier-config` 负责 formatting，确保两者职责不重叠。

## 4. Developer Workflow Validation

- [x] 4.1 添加 build、dev、lint、format、test、typecheck 等 repository scripts，并确保它们通过 workspace/task pipeline 运行。
- [x] 4.2 验证最小 CLI package 能在新的 workspace setup 下完成 build 与执行。
- [x] 4.3 补充基础开发与 release workflow 文档，使后续实现工作能够基于当前 foundation 一致推进。
