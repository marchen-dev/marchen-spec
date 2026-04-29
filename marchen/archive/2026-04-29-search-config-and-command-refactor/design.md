## 背景

config.yaml 当前只有 `schema`、`providers`、`version` 三个字段，搜索相关状态完全没有持久化。SearchManager 每次运行时通过 `hasLocalModels()` 扫描 `~/.marchen/models/qmd/` 目录判断搜索策略。init.ts 和 search.ts 各自维护一份完全相同的 `MODEL_LABELS` + `formatModelProgress` 代码。

## 目标与非目标

**目标：**
- config.yaml 成为搜索策略的单一真相源
- init 只负责首次设置和用户选择
- update 成为"按 config.yaml 同步项目状态"的命令
- 消除 init.ts 和 search.ts 之间的重复代码

**非目标：**
- 不改变 QMD SDK 的集成方式（仍然 dynamic import）
- 不改变模型存储位置（仍然 `~/.marchen/models/qmd/`）
- 不新增 CLI 参数（如 `--search`），配置通过 config.yaml 管理
- 不引入 config schema 类型定义（config.yaml 仍用 `Record<string, unknown>` 读写）

## 决策

### D1: config.yaml 结构

```yaml
schema: full
providers:
  - claude-code
version: 0.7.1
search:
  mode: auto    # auto | bm25 | semantic
```

用嵌套对象 `search.mode` 而非扁平的 `searchMode`，为将来扩展搜索配置留空间（如 `search.limit`、`search.minScore` 等）。

### D2: SearchManager 接收 mode 参数

SearchManager.prepare() 新增可选参数 `mode?: 'auto' | 'bm25' | 'semantic'`。调用方（CLI 命令）负责从 config.yaml 读取 mode 并传入。SearchManager 本身不读 config.yaml——保持 core 包不依赖具体配置文件格式。

这比让 SearchManager 直接读 config.yaml 更好：
- 保持 core 包的纯粹性（不耦合配置文件路径）
- 方便测试（直接传参，不用 mock 文件系统）
- 符合现有架构（CLI 层读配置，core 层执行逻辑）

### D3: Workspace 读写 search 配置

Workspace.initialize() 接收 `searchMode` 参数，写入 config.yaml。Workspace.update() 读取现有配置，缺失 `search` 时补全 `{ mode: 'auto' }`。新增 Workspace.readConfig() 方法供 CLI 命令读取配置。

### D4: 提取模型进度 utils

创建 `apps/cli/src/utils/model-progress.ts`，导出 `MODEL_LABELS` 和 `formatModelProgress`。init.ts、search.ts、update.ts 统一导入。放在 CLI 包而非 core 包，因为这是 UI 格式化逻辑。

### D5: init 流程简化

init 的搜索相关逻辑从"检测 QMD → 检测模型 → 询问下载"简化为"询问搜索模式 → 写入配置 → 按 mode 处理"。移除 `SearchManager.isAvailable()` 调用。如果用户选 semantic，当场下载模型；选 bm25 或 auto，跳过。

### D6: update 增强

update 在更新 skill/command 文件后，读取 config.yaml 的 search.mode：
- `semantic`：调用 ModelManager.ensureModels()，确保模型就绪
- `bm25`：跳过
- `auto`：检查模型状态，显示信息但不主动下载

## 风险与权衡

### R1: config.yaml 与文件系统状态不一致

用户可能手动删除 `~/.marchen/models/qmd/` 下的模型文件，但 config.yaml 仍然是 `semantic`。此时 search 会报错提示运行 `marchen update`。这是可接受的——config.yaml 记录的是用户意图，update 负责同步实际状态。

### R2: 旧版本兼容

旧项目的 config.yaml 没有 `search` 字段。update 会自动补全 `auto`，行为与升级前完全一致。如果用户不运行 update 直接用 search，SearchManager 收到 `undefined` mode 时 fallback 到 auto 行为。

### R3: Workspace.readConfig() 的引入

目前 Workspace 只在 update() 内部读 config.yaml。新增 readConfig() 会让 CLI 命令更方便地读取配置，但也意味着 config.yaml 的读取入口从 1 个变成 N 个。这是合理的——config.yaml 本来就是给多个命令共享的配置文件。
