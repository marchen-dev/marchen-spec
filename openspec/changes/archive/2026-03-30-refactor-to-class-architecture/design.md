## 背景

项目有 5 个包，core 包是业务逻辑核心。当前 core 用纯函数堆叠，每个函数各自计算路径、检查初始化状态，随功能增长越来越散乱。fs 和 shared 包各自单文件，也需要拆分。本次重构引入 Class 架构，不改变包间依赖关系。

## 目标 / 非目标

**目标：**
- core 包从散落函数重构为 `Workspace` + `ChangeManager` 两个类
- fs 包拆分为 4 个模块文件（paths / directory / file / yaml）
- shared 包拆分为 3 个模块文件（types / constants / errors）
- CLI 命令适配新 API
- 所有测试更新

**非目标：**
- ArtifactGraph 类（留给下一个变更）
- 新增功能（纯重构，行为不变）
- 修改包间依赖关系

## 技术决策

### 决策 1：Workspace 类设计

**选择**：Workspace 作为轻量上下文容器，构造时一次性计算路径

```typescript
class Workspace {
  readonly root: string
  readonly specDir: string
  readonly changeDir: string
  readonly packageBoundaries: readonly PackageBoundary[]

  constructor(root?: string)

  async isInitialized(): Promise<boolean>
  async initialize(): Promise<void>
}
```

**理由**：路径计算是同步的，放在构造函数中最自然。初始化检查和执行是异步的，作为方法提供。

**备选方案**：
- 工厂函数 `createWorkspace()` → 没有状态需要管理，Class 更直观
- 单例模式 → 不适合，测试时需要多实例

### 决策 2：ChangeManager 依赖 Workspace

**选择**：通过构造函数注入 Workspace 实例

```typescript
class ChangeManager {
  constructor(private workspace: Workspace)

  async create(name: string): Promise<void>
  async list(): Promise<ChangeMetadata[]>

  static isValidName(name: string): boolean
}
```

**理由**：
- ChangeManager 需要路径上下文，通过构造函数注入而非自己计算
- `isValidName` 是纯校验，不依赖实例状态，作为静态方法
- 初始化检查在各方法内部进行（`this.workspace.isInitialized()`）

**备选方案**：
- 传 workspace 到每个方法 → 啰嗦
- ChangeManager 继承 Workspace → 不是 is-a 关系

### 决策 3：fs 包拆分策略

**选择**：按职责拆为 4 个文件，index.ts 统一 re-export

```
paths.ts     → resolveWorkspaceRoot, getSpecDirectory, getChangeDirectory, getPackageRoot
directory.ts → ensureDir, exists, listDir
file.ts      → readFile, writeFile
yaml.ts      → readYaml, writeYaml
```

**理由**：对外 API 完全不变（都从 index.ts 导出），内部组织更清晰。yaml.ts 依赖 file.ts，可以内部导入。

### 决策 4：shared 包拆分策略

**选择**：按类别拆为 3 个文件

```
types.ts     → PackageBoundary, ChangeMetadata, ArtifactDefinition, SchemaDefinition, ChangeStatus
constants.ts → SPEC_DIRECTORY_NAME, CHANGE_DIRECTORY_NAME, METADATA_FILE_NAME
errors.ts    → MarchenSpecError
```

### 决策 5：CLI 适配方式

**选择**：每个命令内部创建 Workspace 和 ChangeManager 实例

```typescript
// 命令内部
const workspace = new Workspace()
const changes = new ChangeManager(workspace)
await changes.list()
```

**理由**：CLI 命令是独立执行的，每次执行创建实例是最简单的方式。不需要全局共享，因为 CLI 每次只跑一个命令。

**备选方案**：
- CLI 入口创建全局实例传给所有命令 → 过度设计，命令之间不共享状态

## 风险 / 权衡

**[风险]** BREAKING API 变更影响所有使用 core 包的代码
→ **应对**：core 包目前只有 cli 一个消费者，影响范围可控

**[风险]** 测试重写工作量较大
→ **应对**：测试逻辑不变，只是调用方式从函数改为方法

**[权衡]** Class 比纯函数引入更多概念
→ **可接受**：项目正在增长，领域模型的内聚性比函数的简洁性更重要
