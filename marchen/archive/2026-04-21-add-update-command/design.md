## 背景

当前 `workspace.initialize()` 全量写入 skill/command 文件和 config.yaml，但没有版本追踪机制。config.yaml 结构为：

```yaml
schema: full
context: ''
providers:
  - claude-code
perArtifactRules: {}
```

`Workspace` 类已有 `generateSkills()` 和 `generateCommands()` 两个私有方法，update 可以直接复用。

CLI 版本号在 `apps/cli/src/program.ts` 中通过 `createRequire` 从 `package.json` 读取。core 包不知道 CLI 版本。

## 目标与非目标

**目标：**
- `marchen update` 命令覆盖写入 skill/command 文件到最新版本
- config.yaml 引入 version 字段，init 和 update 时写入
- 版本一致时跳过更新

**非目标：**
- 不做 diff 提示或选择性更新（直接覆盖）
- 不做自动检测提醒（不在其他命令里检查版本）
- 不更新 marchen/ 目录结构或迁移 config schema

## 决策

### 版本号由 CLI 层传入 core

core 包的 `Workspace` 不应该知道 CLI 的 package.json。版本号作为参数传入：

- `initialize({ providers, version })` — version 可选，传入时写入 config.yaml
- `update({ version })` — version 必填

理由：保持 core 包纯净，不引入对 CLI 包的隐式依赖。可测试性好，测试时可以传任意版本号。

### update() 读取-修改-写回 config.yaml

不能全量覆盖 config.yaml，因为用户可能修改了 `context` 或 `perArtifactRules`。流程：

1. `readYaml(configPath)` 读取现有 config
2. 从 config 中取 `providers` 列表和旧 `version`
3. 为每个 provider 调用已有的 `generateSkills()` / `generateCommands()`
4. 修改 config 的 `version` 字段
5. `writeYaml(configPath, updatedConfig)` 写回

### UpdateResult 类型放 shared 包

CLI 层需要用 `UpdateResult` 类型来展示结果，所以放在 shared 包导出。`InitializeOptions` 保持在 workspace.ts 内部，只加 `version?: string` 字段。

### 版本一致时提前返回

`update()` 方法在旧版本与新版本一致时提前返回，不执行文件写入。返回的 `UpdateResult` 中通过 `providersUpdated` 为空数组来表达"无更新"。

## 风险与权衡

- config.yaml 中 providers 引用了不存在的 provider ID 时，`AGENT_PROVIDERS[id]` 返回 undefined，需要 filter 掉。这与 `initialize()` 中的处理一致。
- 旧项目 config.yaml 无 version 字段，`readYaml` 返回的对象中 version 为 undefined，视为 null 处理，正常执行更新。
