## 动机

`marchen/config.yaml` 中的 `context` 和 `perArtifactRules` 字段在 `workspace.ts` 的 `initialize()` 方法中被写入默认空值，但整个代码库中没有任何逻辑读取或消费它们。这些死字段增加了用户对配置文件的困惑（"这个字段是干什么的？"），也让代码中存在无意义的初始化逻辑。

## 变更内容

- 从 `Workspace.initialize()` 中移除 `context: ''` 和 `perArtifactRules: {}` 的写入
- 更新相关测试用例，移除对这两个字段的断言
- 已存在的用户 config.yaml 中如果包含这些字段不受影响（`update()` 的透传逻辑自然忽略未知字段）

## 能力

### 新增能力

无新增能力。

### 修改能力

- `config-cleanup`：清理 config 初始化逻辑中的未使用字段

## 影响范围

- `packages/core/src/workspace.ts` — `initialize()` 方法中的 configData 构建
- `packages/core/test/workspace.test.ts` — 涉及 config.yaml 内容断言的测试
- `packages/fs/test/fs.test.ts` — 如果测试数据中包含这些字段
