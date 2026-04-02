## Context

MarchenSpec 是一个 pnpm + Turborepo monorepo，包含 5 个包（shared、fs、config、core、cli）。当前所有包均为 `private: true`，版本 0.1.0。Root 已安装 `bumpp ^10.2.3`，配有 `release:version: "bumpp --all"` 脚本但尚未实际使用。CLI 包通过 tsdown 构建为单入口 ESM，已配置 shebang。内部包之间通过 `workspace:*` 协议引用。

用户明确表示 npm publish 和 GitHub Release 创建由手动完成，CI 自动化不在本次范围内。

## Goals / Non-Goals

**Goals:**
- CLI 包可发布到 npm（`@marchen-spec/cli`），用户可通过 `npm i -g @marchen-spec/cli` 安装
- 内部包代码 bundle 进 CLI 产物，发布后无需安装内部包
- 使用 bumpp 统一管理所有包版本号
- 使用 changelogithub 基于 Conventional Commits 生成 changelog

**Non-Goals:**
- 不发布内部包（shared、fs、config、core 保持 private）
- 不搭建 CI/CD 自动发布流程（GitHub Actions workflow 不在本次范围）
- 不引入独立版本管理（所有包统一版本号）

## Decisions

### 1. Bundle 策略：tsdown noExternal 打包内部包

内部包标记为 `private: true` 不发布到 npm，因此 CLI 产物必须包含所有内部包代码。

方案：在 CLI 的 tsdown 配置中添加 `noExternal: [/^@marchen-spec\//]`，将内部包代码 bundle 进 `dist/index.mjs`。

替代方案：
- 发布所有内部包 → 增加维护负担，当前阶段不需要
- 使用 esbuild 单独打包 → 引入额外构建工具，tsdown 已能满足

### 2. 依赖结构调整

将 CLI 的内部包依赖从 `dependencies` 移至 `devDependencies`，避免 pnpm publish 时将 `workspace:*` 转为具体版本号写入发布的 package.json（因为内部包在 npm 上不存在）。

同时需要将 `js-yaml`（`@marchen-spec/fs` 的依赖）提升到 CLI 的 `dependencies`，因为 bundle 后 js-yaml 仍作为外部依赖被 require。

### 3. 版本管理：bumpp --all + --execute

使用 `bumpp --all --execute 'pnpm build && pnpm test'`：
- `--all` 同步更新 root 和所有子包的 version
- `--execute` 在 commit 前执行构建和测试，失败则中止

### 4. Changelog：changelogithub

安装 `changelogithub` 到 root devDependencies，添加 `release:changelog` 脚本。发布后手动运行 `npx changelogithub` 生成 GitHub Release notes（需要 `GITHUB_TOKEN` 环境变量）。

也可以通过 `npx changelogithub --dry` 本地预览。

## Risks / Trade-offs

- [Bundle 体积增大] CLI 产物将包含所有内部包代码 → 对 CLI 工具来说可接受，不影响用户体验
- [js-yaml 依赖遗漏] bundle 内部包后，其外部依赖需要手动提升到 CLI → 当前只有 js-yaml 一个，后续新增外部依赖时需注意
- [Conventional Commits 规范] changelogithub 依赖规范的 commit message → 需要团队遵循，否则 changelog 为空或不准确
