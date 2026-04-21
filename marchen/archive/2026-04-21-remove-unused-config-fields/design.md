## 背景

`Workspace.initialize()` 在创建 config.yaml 时写入了 `context: ''` 和 `perArtifactRules: {}`。经代码库全局搜索确认，这两个字段在写入后没有任何读取或消费逻辑。`update()` 方法通过读取整个 YAML 对象再写回的方式天然保留了所有字段，包括这两个。

## 目标与非目标

**目标：**
- 从 `initialize()` 中移除 `context` 和 `perArtifactRules` 的默认写入
- 更新测试以反映新的 config 结构

**非目标：**
- 不清理用户已有 config.yaml 中的这些字段（向后兼容，`update()` 透传不受影响）
- 不修改 `update()` 的逻辑（它读取整个对象再写回，天然兼容）

## 决策

**直接删除，不做迁移**：因为没有任何代码消费这些字段，删除初始化写入不会影响任何功能。已有用户的 config.yaml 中如果包含这些字段，`update()` 的透传逻辑会原样保留，无需主动清理。

**不添加 schema 校验**：当前 config.yaml 的读取使用 `readYaml<Record<string, unknown>>`，是宽松的。不需要为此变更引入严格校验。

## 风险与权衡

风险极低。唯一的边缘情况是未来如果要重新启用这些字段，需要在 `initialize()` 中重新添加——但这是几秒钟的事。
