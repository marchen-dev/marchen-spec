## 1. CLI 包发布配置

- [x] 1.1 修改 `apps/cli/package.json`：移除 `private: true`，添加 `publishConfig: { "access": "public" }`
- [x] 1.2 修改 `apps/cli/package.json`：将 `@marchen-spec/core` 和 `@marchen-spec/shared` 从 `dependencies` 移至 `devDependencies`
- [x] 1.3 修改 `apps/cli/package.json`：将 `js-yaml` 添加到 `dependencies`（从 `@marchen-spec/fs` 传递过来的外部依赖）

## 2. Bundle 配置

- [x] 2.1 修改 `apps/cli/tsdown.config.ts`：添加 `noExternal: [/^@marchen-spec\//]` 将内部包 bundle 进产物
- [x] 2.2 验证构建：执行 `pnpm build` 后运行 `node apps/cli/dist/index.mjs --help` 确认产物可正常运行

## 3. 版本管理与 Changelog

- [x] 3.1 修改 root `package.json`：将 `release:version` 脚本改为 `bumpp --all --execute 'pnpm build && pnpm test'`
- [x] 3.2 安装 `changelogithub` 到 root devDependencies
- [x] 3.3 在 root `package.json` 添加 `release:changelog` 脚本：`changelogithub`
