## 动机

每次新对话开始，AI 对项目历史一无所知。archive 里有完整的设计决策、动机、规格，但 AI 无法高效检索。changelog.md 只有 30 行摘要，grep 只能做关键词匹配——用中文"异常处理"搜不到英文命名的 `error-handling` 变更。

需要语义搜索能力，让 AI 在 explore/propose/apply 阶段能自动关联历史决策。

## 变更内容

集成 [qmd](https://github.com/tobi/qmd) 作为内置依赖，提供本地语义搜索能力：

- 新增 `SearchManager` 类封装 qmd SDK，提供搜索和索引接口
- `marchen archive` 时自动更新搜索索引
- 新增 `marchen search` CLI 命令
- 更新 explore skill 模板，在检查上下文阶段自动调用搜索
- qmd 加载失败时优雅降级，不影响现有功能

qmd 使用 BM25 + 向量搜索 + LLM rerank 三级流水线，模型首次使用时自动下载并缓存到 `~/.cache/qmd/models/`。

## 能力

### 新增能力

- `search-manager`: SearchManager 类——封装 qmd SDK，提供 isAvailable/search/index/indexChange 接口，dynamic import + 优雅降级
- `search-command`: marchen search CLI 命令——支持 --json/--limit/--min-score/--rebuild 选项
- `archive-indexing`: archive 时自动索引——archive() 末尾调用 SearchManager 增量更新索引
- `skill-search-integration`: skill 模板搜索集成——explore skill 在检查上下文阶段自动调用 marchen search

### 修改能力

（无）

## 影响范围

- `packages/core` — 新增 SearchManager 类，Workspace 加 searchDbPath，ChangeManager.archive() 加索引 hook
- `apps/cli` — 新增 search 命令，tsdown external 配置
- `packages/config` — explore skill 模板更新
- 根目录 `.gitignore` — 加 `marchen/.search/`
- 依赖 — core 和 cli 加 `@tobilu/qmd`
