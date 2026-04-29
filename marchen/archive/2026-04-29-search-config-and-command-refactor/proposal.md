## 动机

当前搜索模式（BM25 vs 语义搜索）完全依赖运行时检测：每次执行 `marchen search` 时扫描 `~/.marchen/models/qmd/` 目录判断模型是否存在。这带来三个问题：

1. **用户意图丢失**：init 时用户选择"不下载模型"，但这个决定没有持久化。下次搜索时又重新检测，行为取决于文件系统状态而非用户选择。
2. **重复检测浪费**：每次搜索都扫描文件系统，而这是一个可以一次确定的事。
3. **配置不透明**：用户打开 config.yaml 看不到搜索相关配置，不知道当前是什么模式，也无法手动切换。

同时，init 命令承担了过多职责（目录初始化 + AI 工具选择 + 搜索环境检测 + 模型下载），update 命令过于单薄（只更新模板文件）。init 和 search 之间还有重复的模型进度格式化代码。

## 变更内容

- config.yaml 新增 `search.mode` 字段（`auto` | `bm25` | `semantic`），持久化搜索策略
- init 命令简化：搜索检测逻辑改为询问 mode 并写入 config.yaml
- update 命令增强：读取 config.yaml，按 search.mode 同步模型状态（semantic 模式确保模型已下载）
- SearchManager 改为读取 config.yaml 的 mode 决定搜索策略，替代文件系统检测
- 提取 init.ts 和 search.ts 中重复的 `MODEL_LABELS` + `formatModelProgress` 到共享 utils
- 旧项目升级时 update 自动补全缺失的 `search` 配置项（默认 `auto`）

## 能力

### 新增能力

- **search-config-persistence**：config.yaml 搜索配置持久化，SearchManager 按配置决策
- **update-search-sync**：update 命令按 config.yaml 同步搜索模型状态

### 修改能力

- **init-search-flow**：init 命令的搜索设置流程简化为 mode 选择 + 写入配置
- **extract-model-progress-utils**：提取重复的模型进度格式化代码到共享 utils

## 影响范围

- `packages/core/src/workspace.ts`：initialize() 和 update() 写入/补全 search 配置
- `packages/core/src/search-manager.ts`：prepare() 读取 config.yaml mode 替代文件系统检测
- `apps/cli/src/commands/init.ts`：搜索检测逻辑改为 mode 选择
- `apps/cli/src/commands/update.ts`：新增按 mode 同步模型的逻辑
- `apps/cli/src/commands/search.ts`：简化，不再自行判断模型状态
- `apps/cli/src/utils/model-progress.ts`：新文件，提取共享的进度格式化代码
