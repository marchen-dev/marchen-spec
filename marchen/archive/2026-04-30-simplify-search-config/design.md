## 背景

搜索功能基于 qmd SDK，支持 Hybrid Search（BM25 + Vector + Reranking）。当前通过 `SearchMode` 类型（`'auto' | 'bm25' | 'semantic'`）控制搜索策略，持久化在 config.yaml 的 `search.mode` 字段。

涉及的代码路径：
- 类型定义：`packages/shared/src/types.ts` — `SearchMode` 类型 + `WorkspaceConfig.search.mode`
- 核心逻辑：`packages/core/src/search-manager.ts` — `prepare()` 按 mode 分三条路径
- 核心逻辑：`packages/core/src/workspace.ts` — `initialize()` 和 `update()` 写入 config
- CLI 命令：`apps/cli/src/commands/init.ts`、`search.ts`、`update.ts`

## 目标与非目标

**目标：**
- 将搜索配置从三模式简化为 `search.enabled: boolean`
- 删除 `SearchMode` 类型及所有引用
- `marchen update` 自动迁移旧版 `search.mode` 配置
- 保持 skill 模板无需修改（已有降级逻辑覆盖）

**非目标：**
- 不改变 Hybrid Search 的底层实现（qmd SDK 调用方式不变）
- 不改变 `ModelManager` 的下载逻辑
- 不修改 skill/command 模板内容

## 决策

### D1: config.yaml 结构

```yaml
# 之前
search:
  mode: auto | bm25 | semantic

# 之后
search:
  enabled: true | false
```

选择 `search.enabled` 而非顶层 `searchEnabled`，保持 search 命名空间，为未来可能的搜索配置项（如 limit、minScore 默认值）留空间。

### D2: 默认值为 false

新项目 init 时默认不启用搜索。理由：
- 搜索需要下载约 2GB 模型，不应默认触发
- 搜索对归档数量少的新项目价值有限
- 用户可以随时通过修改 config.yaml + `marchen update` 启用

### D3: 迁移策略（保守）

`marchen update` 检测到旧 `search.mode` 字段时的迁移规则：
- `semantic` → `enabled: true`（用户明确选择了模型搜索）
- `bm25` → `enabled: false`（用户明确不想用模型）
- `auto` → `enabled: false`（保守策略，不自动下载模型）

迁移后删除 `mode` 字段。这是单向迁移，不需要回退。

### D4: SearchManager.prepare() 简化

删除 `PrepareOptions.mode` 参数。`prepare()` 被调用时一律尝试加载模型：
- 成功 → `modelsReady = true`，后续使用 Hybrid Search
- 失败 → 抛出 `StateError`

调用方（CLI search 命令）负责在 `enabled: false` 时不调用 SearchManager，而非让 SearchManager 内部判断。这符合"关就是真关"的设计意图。

### D5: search 命令的拦截点

在 `apps/cli/src/commands/search.ts` 中，读取 config 后立即检查 `search.enabled`。为 false 时输出错误提示并退出，不初始化 SearchManager。

### D6: WorkspaceConfig 类型兼容

`WorkspaceConfig.search` 字段需要同时支持读取旧格式（含 `mode`）和新格式（含 `enabled`），以便 `update` 命令能读取旧配置并迁移。方案：类型定义只保留新格式 `{ enabled: boolean }`，迁移逻辑在 `workspace.ts` 的 `update()` 方法中用 `as any` 读取旧字段后转换。

## 风险与权衡

- **旧配置迁移**：auto → false 可能让之前"碰巧有模型"的用户失去搜索能力。但这些用户从未显式选择搜索，影响可控。
- **BM25 能力丢失**：完全关闭搜索意味着放弃零成本的 BM25 全文检索。但 skill 模板的降级逻辑（读 changelog.md + 手动读 archive）已覆盖这个场景，AI 仍能获取历史信息。
- **skill 模板不改**：依赖现有的 `"如果 marchen search 不可用，回退到 changelog.md"` 降级逻辑。如果未来 skill 模板重写时遗漏这个降级，搜索关闭的用户会受影响。
