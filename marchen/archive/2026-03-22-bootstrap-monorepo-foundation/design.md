## Context

MarchenSpec 的目标是成为一个 OpenSpec-like 的 CLI 产品，但当前仓库还没有支撑后续开发所需的 package layout、shared tooling，以及 build/test/lint/release workflow。本次 change 先完成工程基础建设，让后续开发可以聚焦在 workflow 行为本身，而不是持续重构仓库结构。

当前确定的方向是采用由 Turborepo 管理的 pnpm monorepo。仓库对外先提供一个 end-user product，即 `apps/cli`，同时把可复用的内部能力拆分到 workspace packages 中。第一阶段的内部边界为 `core`、`fs`、`config`、`shared`，分别对应前面讨论过的职责：

- `apps/cli` 负责 command registration、argument parsing 与 terminal UI。
- `packages/core` 负责 workflow use case 与 domain rule。
- `packages/fs` 负责 repository 与 artifact 的 file access。
- `packages/config` 负责 configuration loading 与 validation。
- `packages/shared` 负责小范围复用的 types、constants 与 errors。

针对 Node CLI codebase，工具链选择现代但稳定可控的组合：

- ESM-first TypeScript
- `tsdown` 负责 builds
- `vitest` 负责 tests
- `@antfu/eslint-config` 负责 linting，并关闭 formatting responsibilities
- `@suemor/prettier-config` 负责 formatting
- `bumpp` 负责 version bump 与 release preparation

## Goals / Non-Goals

**Goals:**
- 建立一套稳定的 monorepo layout，使后续 CLI feature 开发不需要再次进行结构性重置。
- 定义清晰的 package 边界与依赖方向，避免 CLI app 与内部逻辑耦合。
- 提供统一的 local developer workflow，覆盖 build、dev、lint、format、test、typecheck。
- 统一整个 workspace 的 TypeScript、lint、format 与 package build 行为。
- 为未来 npm-style CLI release workflow 做好准备。

**Non-Goals:**
- 不在本次 change 中实现真正的 MarchenSpec workflow command，例如 proposal generation、validation logic 或 archive behavior。
- 不在当前阶段一次性确定所有未来 package 拆分，例如 templates、integrations、prompt abstractions。
- 不引入 AI provider integration 或 runtime prompt orchestration。
- 不解决超出初始 versioning workflow 范围的长期 release automation。

## Decisions

### 1. Use a Turborepo-based pnpm monorepo from the start

即使第一阶段对外主要只有一个 CLI app，仓库仍然从一开始就采用 workspace packages。这能把 app 层与可复用 workflow code 分离，并让 build/lint/test pipeline 从第一天开始就统一起来。

Why this over a single-package repo:
- 产品本身已经明确会朝多个职责域演进。
- 提前拆分可以降低 CLI concern、file-system logic 与 workflow logic 混在一起的风险。
- 一旦存在 package-level build、test、typecheck 任务，Turbo 就会有实际价值。

Alternative considered:
- Start as a single package and split later.
  Rejected，因为短期 roadmap 已经明确存在多个内部层次，延后拆分只是在推迟重构成本。

### 2. Separate product entrypoints from reusable workspace packages

root layout 使用 `apps/*` 存放 user-facing executable，使用 `packages/*` 存放可复用的 implementation module。

Why this over a flat `packages/*` only layout:
- 能清晰区分 CLI product package 与内部 libraries。
- 为未来可能出现的 docs、playground、dashboard 等入口预留空间，无需重命名 workspace 结构。

Alternative considered:
- Put the CLI itself under `packages/cli`.
  Rejected，因为这会模糊 product entrypoint 与 reusable module 的边界。

### 3. Use `commander` for command routing and `clack` for terminal interaction

CLI app 使用 `commander` 负责 commands/options/help，使用 `clack` 负责 prompts、spinners 与 terminal presentation。

Why this split:
- `commander` 很适合 command-heavy 的 Node CLI。
- `clack` 能改善 UX，但不能替代 command parser。
- 把两者拆开能避免 UI 选择泄漏到 workflow logic。

Alternative considered:
- Use `clack` alone as the CLI foundation.
  Rejected，因为它本质是 prompt/UI toolkit，而不是 routing framework。

### 4. Use `tsdown` for builds and ESM-first TypeScript across the workspace

每个 package 保持自己的 focused build config，同时把 shared compiler behavior 放在 root `tsconfig.base.json` 中。

Why this over plain `tsc`-only builds:
- `tsdown` 能为 package build 与 CLI bundling 提供更现代、更少手写脚本的流程。
- 它能让各 package 的本地构建保持一致，比 ad hoc scripts 更适合未来扩展。

Alternative considered:
- Use `tsup`.
  Rejected，因为当前项目更希望直接采用 `tsdown` 作为现代化方向。

### 5. Use Prettier for formatting and ESLint only for linting

Formatting ownership 统一交给 Prettier，通过 `@suemor/prettier-config` 管理。ESLint 使用 `@antfu/eslint-config`，但关闭 stylistic 与 formatter 行为，确保规则归属清晰。

Why this over ESLint-as-formatter:
- 避免重复修复与 editor 冲突。
- 保持简单心智模型：Prettier 负责格式化，ESLint 负责代码质量。
- 让仓库规范与选定的 Prettier preset 保持一致。

Alternative considered:
- Let `@antfu/eslint-config` handle formatting.
  Rejected，因为项目已经明确偏向独立的 Prettier 配置，并希望将 formatting 与 linting 解耦。

### 6. Keep dependency flow one-way between workspace layers

预期依赖方向为：

`apps/cli` -> `core` -> (`fs`, `config`) -> `shared`

Why this matters:
- 降低循环依赖风险。
- 让 workflow rules 可以脱离 CLI shell 单独测试。
- 让 CLI package 保持轻量，只关注 input/output。

Alternative considered:
- Allow packages to reference each other more freely.
  Rejected，因为这样会削弱拆包价值，也会让后续重构更困难。

## Risks / Trade-offs

- [Monorepo overhead for an early project] -> 初始 package 集合保持克制，不提前拆出 `templates`、`integrations` 之类的 speculative packages。
- [Turbo adds configuration complexity before many packages exist] -> 只保留最小 pipeline，聚焦 build、lint、test、typecheck。
- [Opinionated ESLint preset may drift over time] -> 谨慎 pin 版本，并让 repository-level overrides 保持小而明确。
- [Too much early abstraction can slow feature work] -> v0 阶段只保留 `cli`、`core`、`fs`、`config`、`shared` 这几个 packages。
- [Build and config fragmentation across packages] -> 共享默认值放在 root，package-specific config 保持轻量。

## Migration Plan

1. 将仓库 root 改造成带有 Turbo orchestration 与 shared config 的 pnpm workspace。
2. 创建初始 app/package 目录与最小 package manifest。
3. 添加 TypeScript base config 以及 package-level build/test wiring。
4. 添加 lint、format、versioning 配置。
5. 让 CLI package 能通过一个最小 entrypoint 完成 build 与 run，证明整套基础设施可用。

当前阶段 rollback 很直接，因为仓库几乎还没有现存实现。如果后续证明拆分过重，可以在真正的 workflow feature 落地前重新收敛 packages。

## Open Questions

- test utilities 是继续保留在各 package 内部，还是后续提升成 shared test helper package。
- 未来 template/profile logic 是先继续放在 `fs` 内部，还是在 artifact generation 扩大后拆成单独 package。
- CLI 最终是否只从 `apps/cli` 发布，还是也对外暴露部分 reusable internal packages。
