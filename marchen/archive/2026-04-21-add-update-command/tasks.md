## 1. 类型和基础设施

- [x] 1.1 在 `packages/shared/src/types.ts` 新增 `UpdateResult` 接口（previousVersion、currentVersion、providersUpdated、skillCount、commandCount）
- [x] 1.2 在 `packages/shared/src/index.ts` 导出 `UpdateResult`

## 2. Core 层 — Workspace 改造

- [x] 2.1 修改 `InitializeOptions` 接口，新增可选 `version?: string` 字段
- [x] 2.2 修改 `initialize()` 方法，传入 version 时在 config.yaml 中写入 version 字段
- [x] 2.3 新增 `update(options: { version: string }): Promise<UpdateResult>` 方法：读取 config.yaml → 版本一致时提前返回 → 遍历 providers 调用 generateSkills/generateCommands → 更新 config.yaml version → 返回 UpdateResult
- [x] 2.4 在 `packages/core/src/index.ts` 确认 UpdateResult 类型可通过 shared 包访问

## 3. CLI 层 — update 命令

- [x] 3.1 新建 `apps/cli/src/commands/update.ts`，注册 `marchen update` 命令：检查初始化 → 调用 workspace.update → 展示结果
- [x] 3.2 在 `apps/cli/src/program.ts` 注册 `registerUpdateCommand`
- [x] 3.3 修改 `apps/cli/src/commands/init.ts`，将 CLI 版本号传入 `workspace.initialize({ providers, version })`

## 4. 测试

- [x] 4.1 为 `workspace.update()` 编写单测（正常更新、版本一致跳过、旧项目无 version）
- [x] 4.2 为 `workspace.initialize()` 的 version 写入行为补充测试

## 5. 文档更新

- [x] 5.1 更新 `README.md`：CLI 命令表加 update，新增"更新"章节
- [x] 5.2 更新 `README.en.md`：同步英文版
- [x] 5.3 更新根 `CLAUDE.md`：CLI 命令列表加 update
- [x] 5.4 更新 `apps/cli/CLAUDE.md`：已实现命令加 update
- [x] 5.5 更新 `packages/core/CLAUDE.md`：Workspace 类文档加 update() 方法
