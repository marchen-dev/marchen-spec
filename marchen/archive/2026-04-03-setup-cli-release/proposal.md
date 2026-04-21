## Why

项目已具备基本功能（init、new、list 命令），需要建立发布流程以便将 `@marchen-spec/cli` 发布到 npm，让用户可以通过 `npm i -g @marchen-spec/cli` 安装使用。当前所有包都标记为 `private: true`，没有构建产物的 bundle 策略，也没有版本管理和 changelog 生成的配置。

## What Changes

- 移除 CLI 包的 `private: true`，添加 `publishConfig` 配置
- 将内部包（`@marchen-spec/core`、`@marchen-spec/shared`）从 CLI 的 `dependencies` 移至 `devDependencies`
- 配置 tsdown `noExternal` 将内部包代码 bundle 进 CLI 单文件产物
- 补充 CLI 缺失的外部依赖（`js-yaml`，来自 `@marchen-spec/fs` 的传递依赖）
- 调整 root `release:version` 脚本，添加 `--execute` 在 commit 前执行构建和测试
- 添加 `changelogithub` 依赖和配置，用于基于 Conventional Commits 生成 changelog
- 新建 `.github/workflows/release.yml`，tag 触发自动发布到 npm 和生成 GitHub Release

## Capabilities

### New Capabilities
- `cli-release`: CLI 包的发布配置、bundle 策略、版本管理和 CI 发布流程

### Modified Capabilities

（无现有 spec 级别的行为变更）

## Impact

- `apps/cli/package.json` — 移除 private、调整依赖结构、添加 publishConfig
- `apps/cli/tsdown.config.ts` — 添加 noExternal 配置
- `package.json`（root）— 调整 release 脚本、添加 changelogithub 依赖
- `.github/workflows/release.yml` — 新建 CI 发布工作流
- 构建产物变化：CLI 的 dist/index.mjs 将包含所有内部包代码（体积增大）
