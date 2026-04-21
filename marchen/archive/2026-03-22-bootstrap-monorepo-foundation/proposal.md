## Why

MarchenSpec 当前还只是一个最小化仓库，缺少一套稳定的工程基础来支撑后续 OpenSpec-like CLI 产品的开发与演进。在正式实现 spec workflow 之前，需要先完成 monorepo、build、test、lint、format 和 release 相关的基础建设。

## What Changes

- 为 MarchenSpec 建立基于 Turborepo 的 pnpm monorepo。
- 创建 CLI app 与内部可复用 packages 的初始拆分结构。
- 建立基于 ESM 的现代 TypeScript 工具链，并统一 shared TypeScript base config 与 package-local build config。
- 采用 `tsdown` 作为 package build 与 CLI bundling 工具。
- 采用 `vitest` 作为 workspace 级测试方案。
- 采用 `@antfu/eslint-config` 作为 lint 方案，并关闭其格式化职责。
- 采用 `@suemor/prettier-config` 作为仓库统一格式化方案。
- 采用 `bumpp` 作为版本号提升与 release preparation 工具。
- 明确 CLI 与内部 runtime/package 的职责边界，为后续 workflow command 实现提供稳定基础。

## Capabilities

### New Capabilities
- `project-foundation`: 提供构建和维护 MarchenSpec CLI 所需的 monorepo 结构、package 边界、shared tooling 与 developer workflow。

### Modified Capabilities
- None.

## Impact

- 影响仓库目录结构、package management、TypeScript 配置、lint、format、test 与 release scripts。
- 引入 Turbo、tsdown、Vitest、ESLint、Prettier、bumpp 等 workspace 级依赖。
- 确立 `apps/cli` 以及 `core`、`fs`、`config`、`shared` 等内部 packages 的初始边界。
- 为后续所有 CLI workflow 功能提供统一工程基线。
