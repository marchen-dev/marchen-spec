## 动机

用户通过 `marchen init` 初始化项目后，skill/command 模板文件被写入本地。当 marchen-spec 发布新版本（模板内容更新、新增 skill 等），用户升级 CLI 后本地文件仍是旧版，没有办法同步更新。

需要一个 `marchen update` 命令，让用户升级 CLI 后能一键将 skill/command 文件更新到最新版本。同时在 config.yaml 中引入 version 字段，记录当前模板对应的 CLI 版本。

## 变更内容

- 新增 `marchen update` CLI 命令，覆盖写入所有 provider 的 skill/command 文件并更新 config.yaml 的 version 字段
- config.yaml 新增 `version` 字段，`init` 和 `update` 时写入当前 CLI 版本号
- `Workspace` 类新增 `update()` 方法，`initialize()` 方法同步写入 version
- 更新 README 新增"更新"章节，CLI 命令表加 update
- 同步更新各包 CLAUDE.md 文档

## 能力

### 新增能力

- update-command — `marchen update` 命令的完整行为（读取 config、覆盖模板、更新版本号）
- version-tracking — config.yaml 的 version 字段管理（init 写入、update 更新）

### 修改能力

- init-command — `initialize()` 写入 config.yaml 时新增 version 字段

## 影响范围

- `packages/shared` — 新增 UpdateResult 类型
- `packages/core/src/workspace.ts` — 新增 update() 方法，修改 initialize()
- `apps/cli/src/commands/update.ts` — 新文件
- `apps/cli/src/program.ts` — 注册新命令
- `README.md` / `README.en.md` — 文档更新
- `CLAUDE.md` / `apps/cli/CLAUDE.md` / `packages/core/CLAUDE.md` — 文档同步
