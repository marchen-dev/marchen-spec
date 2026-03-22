# Repository Guidelines

## Project Structure & Module Organization

本仓库是一个由 Turbo 管理的 pnpm workspace。面向用户的代码位于 `apps/cli`，CLI 入口在 `apps/cli/src/index.ts`，测试放在 `apps/cli/test`。共享能力包位于 `packages/`：

- `packages/core`: workflow and domain logic
- `packages/fs`: repository and artifact file access
- `packages/config`: config loading and defaults
- `packages/shared`: shared types, constants, and errors

OpenSpec 相关元数据位于 `openspec/`。当前生效的规范放在 `openspec/specs/`，已归档的变更放在 `openspec/changes/archive/`。

## Build, Test, and Development Commands

以下命令统一在仓库根目录执行：

- `pnpm dev`: 通过 Turbo 启动所有 workspace 的 `dev` watcher
- `pnpm build`: 使用 `tsdown` 构建所有 workspace package
- `pnpm lint`: 对所有包执行 ESLint
- `pnpm lint:fix`: 对所有包执行 ESLint 自动修复
- `pnpm format`: 使用 Prettier 格式化整个仓库
- `pnpm test`: 在整个 workspace 中运行 Vitest
- `pnpm typecheck`: 执行 TypeScript 类型检查
- `pnpm check`: 串行执行 lint、typecheck 和 test

## Coding Style & Naming Conventions

使用 TypeScript，并遵循 ESM + NodeNext 语义。相对路径导入在需要时保留 `.js` 后缀，保证源码与 Node 运行时行为一致。命名约定如下：package 名和 change 名使用 kebab-case，变量与函数使用 camelCase，类型和类使用 PascalCase。

格式化由 Prettier 负责，配置源为 `@suemor/prettier-config`。Lint 由 ESLint 负责，配置源为 `@antfu/eslint-config`。不要把 ESLint 当作格式化工具使用。

## Testing Guidelines

测试框架使用 Vitest。测试文件放在各 app 或 package 的 `test/**/*.test.ts` 下。测试应尽量靠近对应模块，并保持小而明确。提交 PR 前至少执行一次 `pnpm check`。

## Commit & Pull Request Guidelines

当前仓库还没有现成的提交历史，因此没有可直接继承的 commit 规范。建议使用简洁的 Conventional Commit 风格，例如 `feat(cli): add init command` 或 `chore(repo): tighten turbo config`。

Pull Request 建议至少包含：

- 变更摘要
- 相关 issue 或对应的 spec/change 名称
- 验证记录，例如 `pnpm lint`、`pnpm test`
- 仅在 CLI/UI 行为明显变化时附上截图或终端输出
