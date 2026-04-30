## 动机

当前搜索配置提供三种模式（auto / bm25 / semantic），增加了用户的认知负担。auto 模式的"检测本地模型，有则 Hybrid，无则 BM25"逻辑让行为不可预测；bm25 作为独立选项暴露了实现细节，用户不需要知道底层检索算法。

简化为开/关二选一：开启 = Hybrid Search（需下载模型），关闭 = 搜索功能不可用。用户只需要做一个决定："我要不要搜索？"

## 变更内容

- 删除 `SearchMode` 类型（`'auto' | 'bm25' | 'semantic'`）
- config.yaml 的 `search.mode` 字段改为 `search.enabled: boolean`
- `marchen init` 的搜索选项从三选一改为 confirm 开关
- `marchen search` 在 `enabled: false` 时直接报错退出
- `marchen update` 按 `enabled` 决定是否同步模型
- `SearchManager.prepare()` 简化为只处理"加载模型"一种情况
- 已有 config.yaml 的迁移：`update` 时将旧 `mode` 字段转换为 `enabled`

## 能力

### 修改能力

- **search-config-simplify**: 搜索配置从三模式简化为开关，涉及类型定义、CLI 交互、核心逻辑和配置迁移

## 影响范围

- `packages/shared` — 删除 `SearchMode` 类型，修改 `WorkspaceConfig` 接口
- `packages/core` — `Workspace` 初始化/更新逻辑，`SearchManager.prepare()` 简化
- `apps/cli` — `init`、`search`、`update` 三个命令的搜索相关逻辑
- `config.yaml` — 字段结构变更（`search.mode` → `search.enabled`），需向后兼容迁移
