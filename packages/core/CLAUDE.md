# @marchen-spec/core

## 包职责

核心业务逻辑层，使用 Class 架构组织领域逻辑。提供 `Workspace`（工作区上下文）、`ChangeManager`（变更管理）、`SearchManager`（搜索）和 `ModelManager`（模型管理）四个核心类。

## 依赖关系

```
@marchen-spec/shared
    ↑
    ├── @marchen-spec/config
    │       ↑
    │       └── @marchen-spec/core
    │
    └── @marchen-spec/fs
            ↑
            └── @marchen-spec/core
```

依赖 `shared`、`config`、`fs`，被 `cli` 依赖。

## 源码结构

```
src/
├── index.ts            # 统一导出
├── workspace.ts        # Workspace 类
├── change-manager.ts   # ChangeManager 类
├── search-manager.ts   # SearchManager 类（封装 qmd SDK）
└── model-manager.ts    # ModelManager 类（模型下载与管理）
```

## 核心导出

### Workspace 类

工作区上下文，路径在构造时一次性计算：

```typescript
const workspace = new Workspace()      // 默认 cwd
const workspace = new Workspace(root)  // 指定路径

workspace.root           // 工作区根目录
workspace.specDir        // marchen/ 路径
workspace.changeDir      // marchen/changes/ 路径
workspace.archiveDir     // marchen/archive/ 路径
workspace.changelogPath  // marchen/changelog.md 路径
workspace.searchDbPath   // marchen/.search/index.sqlite 路径

await workspace.isInitialized()  // 检查是否已初始化
await workspace.initialize({ providers, version, searchEnabled })  // 执行初始化
await workspace.readConfig()     // 读取 config.yaml 配置
await workspace.update({ version })  // 更新 skill/command 文件，补全缺失配置
```

`searchEnabled` 参数控制搜索开关，持久化到 config.yaml 的 `search.enabled` 字段。

### ChangeManager 类

变更管理，接收 Workspace 实例：

```typescript
const changes = new ChangeManager(workspace)

await changes.create('my-feature')               // 创建变更（默认 full）
await changes.create('my-feature', 'lite')       // 创建变更（lite schema）
await changes.archive('my-feature')              // 归档变更，返回 ArchiveResult
await changes.archive('my-feature', { summary: '一句话摘要' })  // 归档并写入 changelog 摘要
await changes.list()                     // 列出所有 open 变更
await changes.status('my-feature')       // 查询 artifact 内容状态和工作流建议
await changes.getInstructions('my-feature', 'proposal')  // 获取 artifact 创建指令
await changes.getApplyInstructions('my-feature')         // 获取 apply 实现指令（state + progress + context）

ChangeManager.isValidName('my-feature')  // 静态方法，校验名称
```

### SearchManager 类

搜索管理器，封装 qmd SDK，支持 Hybrid Search（BM25 + Vector + Reranking），通过 dynamic import 加载：

```typescript
const search = new SearchManager(workspace)

await search.isAvailable()               // 检测 qmd SDK 是否可用
await search.prepare({ onModelProgress })  // 加载模型，准备搜索引擎
await search.search(query, { limit, minScore })  // Hybrid Search
await search.index()                     // 全量索引
await search.indexChange()               // 增量索引（archive 后调用）
await search.close()                     // 释放资源
```

`prepare()` 加载模型并初始化 store，模型不存在时抛出 StateError。调用方（CLI search 命令）在 `config.search.enabled: false` 时不应调用此类。

### ModelManager 类

QMD 模型管理，从自定义 CDN 下载模型到 `~/.marchen/models/qmd/`：

```typescript
const modelManager = new ModelManager()

const paths = await modelManager.ensureModels({ onProgress })  // 确保模型就绪
modelManager.applyEnv(paths)  // 设置 QMD_*_MODEL 环境变量
```

## 开发命令

```bash
pnpm build      # 构建
pnpm dev        # 开发模式
pnpm test       # 运行测试
pnpm typecheck  # 类型检查
```

## 注意事项

1. **纯业务逻辑**: 不包含 UI 交互代码，UI 由 CLI 层处理
2. **可测试性**: 通过 mock `@marchen-spec/fs` 进行单元测试
3. **Class 架构**: 使用类封装相关操作，通过构造函数注入依赖
