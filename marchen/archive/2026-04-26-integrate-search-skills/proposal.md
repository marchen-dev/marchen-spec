## 动机

`marchen search` 依赖 ~2GB 的 GGUF 模型（embedding + query expansion + reranker），首次使用需要下载。当前问题：

1. Skill/command 模板中 AI 调用 `marchen search` 时会触发模型下载，导致长时间卡住
2. `marchen init` 没有提供下载模型的入口，用户不知道何时该下载
3. explore 的 command 版本缺少 `marchen search` 集成（skill 版本已有）
4. 模型不存在时搜索直接失败，没有降级方案

## 变更内容

- `SearchManager` 支持 FTS 降级：模型不存在时自动使用 `searchLex`（BM25 关键词搜索），无需下载模型
- `marchen init` 新增交互选项，询问用户是否下载搜索模型（带进度展示）
- 更新 explore 的 command 模板，补齐 `marchen search` 步骤（对齐 skill 版本）
- 更新 apply 的 skill/command 模板，在护栏中加入搜索历史方案的指引

## 能力

### 新增能力

- `search-fts-fallback`: SearchManager 在模型不存在时自动降级为 BM25 关键词搜索
- `init-model-download`: marchen init 交互式询问并下载搜索模型

### 修改能力

- `explore-command-search`: explore command 模板补齐 marchen search 集成
- `apply-search-hint`: apply skill/command 模板加入搜索历史的护栏指引

## 影响范围

- `packages/core/src/search-manager.ts` — 加 FTS 降级逻辑
- `apps/cli/src/commands/init.ts` — 加模型下载选项
- `apps/cli/src/commands/search.ts` — 展示搜索模式（语义/关键词）
- `packages/config/templates/commands/explore.md` — 补齐 search 步骤
- `packages/config/templates/skills/apply.md` — 加搜索护栏
- `packages/config/templates/commands/apply.md` — 加搜索护栏
