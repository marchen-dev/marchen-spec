### Requirement: CLI 包可发布到 npm
CLI 包（`@marchen-spec/cli`）SHALL 移除 `private: true` 标记，并配置 `publishConfig.access` 为 `public`，使其可通过 `pnpm publish` 发布到 npm registry。

#### Scenario: 发布配置正确
- **WHEN** 查看 `apps/cli/package.json`
- **THEN** 不存在 `"private": true` 字段，且 `publishConfig.access` 为 `"public"`

#### Scenario: 用户安装 CLI
- **WHEN** 用户执行 `npm i -g @marchen-spec/cli`
- **THEN** 安装成功，`marchen` 命令可用

### Requirement: 内部包代码 bundle 进 CLI 产物
CLI 的构建产物 SHALL 包含所有内部包（`@marchen-spec/shared`、`@marchen-spec/fs`、`@marchen-spec/config`、`@marchen-spec/core`）的代码，使发布后的 CLI 不依赖这些未发布的内部包。

#### Scenario: tsdown 配置 noExternal
- **WHEN** 查看 `apps/cli/tsdown.config.ts`
- **THEN** 存在 `noExternal` 配置，匹配 `@marchen-spec/` 前缀的包

#### Scenario: 构建产物自包含
- **WHEN** 执行 `pnpm build` 后运行 `node apps/cli/dist/index.mjs --help`
- **THEN** 命令正常输出帮助信息，不报 module not found 错误

### Requirement: 内部包作为 devDependencies
CLI 的 `package.json` SHALL 将内部包依赖声明在 `devDependencies` 中，外部依赖（`@clack/prompts`、`commander`、`js-yaml`）声明在 `dependencies` 中。

#### Scenario: 依赖结构正确
- **WHEN** 查看 `apps/cli/package.json`
- **THEN** `@marchen-spec/core` 和 `@marchen-spec/shared` 在 `devDependencies` 中
- **THEN** `@clack/prompts`、`commander`、`js-yaml` 在 `dependencies` 中

### Requirement: 统一版本管理
root 的 `release:version` 脚本 SHALL 使用 `bumpp --all` 同步更新所有包的版本号，并在 commit 前通过 `--execute` 执行构建和测试。

#### Scenario: 版本号同步更新
- **WHEN** 执行 `pnpm release:version` 并选择新版本
- **THEN** root 和所有子包的 `package.json` version 字段均更新为选定版本
- **THEN** 自动创建 git commit 和 tag

#### Scenario: 构建或测试失败时中止
- **WHEN** 执行 `pnpm release:version` 且 `--execute` 中的构建或测试失败
- **THEN** bumpp 中止操作，不创建 commit 和 tag

### Requirement: Changelog 生成
项目 SHALL 安装 `changelogithub` 并提供 `release:changelog` 脚本，用于基于 Conventional Commits 生成 GitHub Release notes。

#### Scenario: 生成 changelog
- **WHEN** 执行 `pnpm release:changelog`
- **THEN** 基于上一个 tag 到当前 tag 之间的 conventional commits 生成 changelog 并发布到 GitHub Release

#### Scenario: 本地预览 changelog
- **WHEN** 执行 `npx changelogithub --dry`
- **THEN** 在终端输出 changelog 预览内容，不实际发布
