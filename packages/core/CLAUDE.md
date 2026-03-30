# @marchen-spec/core

## 包职责

核心业务逻辑层，使用 Class 架构组织领域逻辑。提供 `Workspace`（工作区上下文）和 `ChangeManager`（变更管理）两个核心类。

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
├── index.ts            # 统一导出 Workspace + ChangeManager
├── workspace.ts        # Workspace 类
└── change-manager.ts   # ChangeManager 类
```

## 核心导出

### Workspace 类

工作区上下文，路径在构造时一次性计算：

```typescript
const workspace = new Workspace()      // 默认 cwd
const workspace = new Workspace(root)  // 指定路径

workspace.root          // 工作区根目录
workspace.specDir       // marchenspec/ 路径
workspace.changeDir     // marchenspec/changes/ 路径
workspace.packageBoundaries  // PackageBoundary[]

await workspace.isInitialized()  // 检查是否已初始化
await workspace.initialize()     // 执行初始化
```

### ChangeManager 类

变更管理，接收 Workspace 实例：

```typescript
const changes = new ChangeManager(workspace)

await changes.create('my-feature')  // 创建变更
await changes.list()                // 列出所有 open 变更

ChangeManager.isValidName('my-feature')  // 静态方法，校验名称
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
