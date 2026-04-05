# MarchenSpec 架构决策

> 日期: 2026-04-05
> 状态: 已决定

## 一、Specs 架构：archive 作为唯一真相来源

> 原决策日期: 2026-04-01

### 背景

OpenSpec 使用双层规范系统：
- `openspec/specs/` - 主规范，系统当前状态
- `openspec/changes/*/specs/` - Delta specs，变更增量

每次 archive 时，需要将 delta specs 合并到 main specs。

### 问题

1. **合并复杂度高** — ADDED/MODIFIED/REMOVED/RENAMED 需要非平凡的合并算法
2. **维护成本高** — main spec 和 delta spec 容易不一致
3. **内容重复** — main specs 和 archive delta specs 高度重复
4. **AI 按需加载** — specs/ 不是全部注入上下文，AI 按需搜索和读取

### 决策

**去掉 `marchenspec/specs/` 目录，archive 作为唯一真相来源。**

```
marchenspec/
└─ changes/
   ├─ my-feature/          (活跃变更)
   │  ├─ .metadata.yaml
   │  ├─ proposal.md
   │  ├─ design.md
   │  ├─ tasks.md
   │  └─ specs/
   │     └─ auth/spec.md
   │
   └─ archive/             (唯一真相来源)
      ├─ 2026-03-29-xxx/
      └─ 2026-03-30-xxx/
```

archive 命令只做文件移动，不做 spec 合并。

---

## 二、CLI 与 Skill 分层架构

> 决策日期: 2026-04-05

### 背景

OpenSpec 没有独立 CLI，所有命令都是 Claude Code skills，LLM 直接读写文件。MarchenSpec 已有独立 CLI（npm 包 `@marchen-spec/cli`），需要决定 CLI 和 AI Skill 的分工。

### 调研：OpenSpec 的 artifact-graph 模块

OpenSpec CLI 的核心是 `artifact-graph` 模块：
- `ArtifactGraph` 类：通用 DAG 拓扑排序（Kahn 算法）
- `detectCompleted`：通过文件存在性检测 artifact 完成状态
- `instruction-loader`：为每个 artifact 生成指令（模板 + 上下文 + 规则）
- `schema.yaml`：声明式定义 artifact 依赖关系，支持多 schema

Skill 通过两个 CLI 命令消费：
- `openspec status --change <name> --json` → 获取 artifact 状态（done/ready/blocked）
- `openspec instructions <artifact-id> --change <name> --json` → 获取创建指令

Skill 的工作流：调 CLI 获取状态 → 获取指令 → LLM 生成内容 → 写入文件。

### 决策

**MarchenSpec 采用 CLI-as-API 模式，但不复刻 artifact-graph 引擎。**

#### 分工

```
CLI（marchen 二进制）:                    Skill（Claude Code prompt）:
  ├── 文件结构管理                          ├── 调 CLI 获取状态和指令
  ├── 状态检测（内容感知）                    ├── 读依赖 artifacts 作为上下文
  ├── 工作流计算（固定规则）                  ├── LLM 生成内容
  ├── 指令生成（模板 + 指导）                 └── 写入文件
  └── JSON API 输出
```

CLI 是大脑（决策），Skill 是手（执行）。

#### 不做 artifact-graph 的理由

MarchenSpec 只有一个固定工作流（spec-driven: proposal → specs → design → tasks），为 4 节点 DAG 写通用图引擎是过度设计。依赖关系直接硬编码在 ChangeManager 中。

#### 与 OpenSpec 的关键差异：内容感知状态检测

OpenSpec 的完成检测是「文件存在 = 完成」。但 MarchenSpec 的 `new` 命令创建变更时就生成了所有 artifact 文件（带模板骨架），所以文件始终存在。

MarchenSpec 采用内容感知检测：

| 状态 | 含义 | 检测方式 |
|------|------|---------|
| `empty` | 文件存在，内容为模板骨架 | 去掉注释和标题后无实质内容 |
| `filled` | 文件存在，有实质内容 | 去掉注释和标题后有内容 |
| `missing` | 文件不存在 | 异常情况 |

specs/ 目录额外状态：
| 状态 | 含义 |
|------|------|
| `no-content` | 目录存在但为空 |
| `partial` | 有部分 spec 文件 |
| `filled` | 有 spec 文件且内容已填充 |

tasks.md 额外状态：
| 状态 | 含义 |
|------|------|
| `in-progress` | 部分 task 已完成 |
| `done` | 所有 task 已完成 |

### 工作流计算

固定规则，不需要 schema.yaml 或拓扑排序：

```
proposal: 无依赖 → 总是 ready
specs:    依赖 proposal filled → proposal filled 后 ready
design:   依赖 proposal filled → proposal filled 后 ready
tasks:    依赖 specs filled + design filled → 两者都 filled 后 ready
```

---

## 三、status 命令替代 verify 命令

> 决策日期: 2026-04-05

### 决策

**废弃 verify 命令，用 status 命令完全替代。**

### 理由

1. status 是 verify 的超集 — verify 只检查文件存在性和 task 进度，status 包含这些信息且更丰富（内容状态、工作流建议）
2. 避免功能重叠 — 两个命令做类似的事情会让用户困惑
3. status 同时服务人类和 Skill — `--json` 输出给 Skill 消费，默认输出给人类阅读

### 迁移

- 移除 `marchen verify` 命令
- 移除 `ChangeManager.verify()` 方法和 `VerifyResult` 类型
- 新增 `marchen status` 命令和 `ChangeManager.status()` 方法

---

## 四、新增命令设计

### marchen status

```bash
marchen status <name>         # 人类友好输出
marchen status <name> --json  # Skill 消费的 JSON
```

返回结构（StatusResult）：

```typescript
interface StatusResult {
  name: string
  schema: string
  artifacts: ArtifactStatusDetail[]
  workflow: WorkflowStatus
  tasks: { total: number; completed: number; items: TaskItem[] } | null
}

interface ArtifactStatusDetail {
  id: string
  status: ArtifactContentStatus  // 'empty' | 'filled' | 'missing' | ...
  path: string
  capabilities?: string[]        // specs 类型时
}

interface WorkflowStatus {
  next: string | null    // 建议下一步
  ready: string[]        // 可以开始的 artifacts
  blocked: string[]      // 被阻塞的 artifacts
}
```

人类输出示例：

```
变更: add-dark-mode
Schema: spec-driven

  ✅ proposal      filled
  ⬜ specs         empty (0 capabilities)
  ⬜ design        empty
  🔒 tasks         blocked (等待 specs, design)

下一步: specs
```

### marchen instructions

```bash
marchen instructions <name> <artifact-id> --json
```

返回结构（InstructionsResult）：

```typescript
interface InstructionsResult {
  changeName: string
  artifactId: string
  outputPath: string
  template: string              // 模板内容
  instruction: string           // 给 LLM 的指导文本
  dependencies: DependencyInfo[]
  unlocks: string[]
}

interface DependencyInfo {
  id: string
  status: ArtifactContentStatus
  path: string
  content?: string              // 依赖 artifact 的实际内容
}
```

### artifact 依赖图与 unlocks

```
              ┌──────────┐
              │ proposal │  requires: []
              └────┬─────┘
                   │
          ┌────────┴────────┐
          ▼                 ▼
     ┌────────┐        ┌────────┐
     │ specs  │        │ design │
     │req: [p]│        │req: [p]│
     └────┬───┘        └────┬───┘
          │                 │
          └────────┬────────┘
                   ▼
              ┌────────┐
              │ tasks  │  requires: [specs, design]
              └────────┘
```

每个 artifact 的 `unlocks` 是静态关系（"谁把我列为依赖"），不是动态的"填完我之后什么变成 ready"：

| artifact | requires | unlocks |
|----------|----------|---------|
| proposal | [] | ["specs", "design"] |
| specs | ["proposal"] | ["tasks"] |
| design | ["proposal"] | ["tasks"] |
| tasks | ["specs", "design"] | [] |

Skill 不靠 `unlocks` 判断下一步——每次调 `status --json` 看 `workflow.ready` 即可。

---

## 四-B、完整流程示例

以 `add-dark-mode` 为例，展示从创建到就绪的完整 Skill 驱动流程。

### Step 1: 创建变更

```bash
$ marchen new add-dark-mode
```

### Step 2: 查状态 → 填 proposal

```bash
$ marchen status add-dark-mode --json
```

```json
{
  "name": "add-dark-mode",
  "schema": "spec-driven",
  "artifacts": [
    { "id": "proposal", "status": "empty",      "path": "proposal.md" },
    { "id": "specs",    "status": "no-content",  "path": "specs/", "capabilities": [] },
    { "id": "design",   "status": "empty",       "path": "design.md" },
    { "id": "tasks",    "status": "empty",       "path": "tasks.md" }
  ],
  "workflow": { "next": "proposal", "ready": ["proposal"], "blocked": ["specs", "design", "tasks"] },
  "tasks": null
}
```

```bash
$ marchen instructions add-dark-mode proposal --json
```

```json
{
  "changeName": "add-dark-mode",
  "artifactId": "proposal",
  "outputPath": "proposal.md",
  "template": "## 动机\n\n<!-- ... -->\n\n## 变更内容\n\n<!-- ... -->\n\n## 能力\n\n### 新增能力\n<!-- ... -->\n\n### 修改能力\n<!-- ... -->\n\n## 影响范围\n\n<!-- ... -->",
  "instruction": "根据用户的描述，填写 proposal 的各个部分...",
  "dependencies": [],
  "unlocks": ["specs", "design"]
}
```

LLM 生成 proposal 内容，写入 `proposal.md`。

### Step 3: 查状态 → 填 specs

```bash
$ marchen status add-dark-mode --json
```

```json
{
  "artifacts": [
    { "id": "proposal", "status": "filled",     "path": "proposal.md" },
    { "id": "specs",    "status": "no-content",  "path": "specs/", "capabilities": [] },
    { "id": "design",   "status": "empty",       "path": "design.md" },
    { "id": "tasks",    "status": "empty",       "path": "tasks.md" }
  ],
  "workflow": { "next": "specs", "ready": ["specs", "design"], "blocked": ["tasks"] }
}
```

proposal → `filled`。specs 和 design 都 ready，`workflow.next` 建议先做 specs。

```bash
$ marchen instructions add-dark-mode specs --json
```

```json
{
  "artifactId": "specs",
  "outputPath": "specs/",
  "template": "## ADDED Requirements\n\n### 需求: <名称>\n...\n\n#### 场景: <场景名>\n- **WHEN** ...\n- **THEN** ...",
  "instruction": "根据 proposal 中列出的能力，为每个能力创建 specs/<name>/spec.md...",
  "dependencies": [
    { "id": "proposal", "status": "filled", "path": "proposal.md", "content": "## 动机\n\n当前应用只有亮色主题..." }
  ],
  "unlocks": ["tasks"]
}
```

LLM 从 proposal 读到两个能力（theme-switching、dark-color-scheme），创建两个 spec 文件。

### Step 4: 查状态 → 填 design

```bash
$ marchen status add-dark-mode --json
```

```json
{
  "artifacts": [
    { "id": "proposal", "status": "filled",  "path": "proposal.md" },
    { "id": "specs",    "status": "filled",  "path": "specs/", "capabilities": ["theme-switching", "dark-color-scheme"] },
    { "id": "design",   "status": "empty",   "path": "design.md" },
    { "id": "tasks",    "status": "empty",   "path": "tasks.md" }
  ],
  "workflow": { "next": "design", "ready": ["design"], "blocked": ["tasks"] }
}
```

specs → `filled`。design 是唯一 ready 的。tasks 仍 blocked（等 design）。

```bash
$ marchen instructions add-dark-mode design --json
```

```json
{
  "artifactId": "design",
  "outputPath": "design.md",
  "template": "## 背景\n\n<!-- ... -->\n\n## 目标与非目标\n\n...\n\n## 决策\n\n<!-- ... -->\n\n## 风险与权衡\n\n<!-- ... -->",
  "instruction": "根据 proposal 的动机和 specs 的需求，设计技术实现方案...",
  "dependencies": [
    { "id": "proposal", "status": "filled", "path": "proposal.md", "content": "..." },
    { "id": "specs", "status": "filled", "path": "specs/", "content": null }
  ],
  "unlocks": ["tasks"]
}
```

注意：specs 的 `content` 为 `null`（因为是目录），Skill 需要自行读取 `specs/*/spec.md` 文件。

LLM 读 proposal + specs，生成 design 内容，写入 `design.md`。

### Step 5: 查状态 → 填 tasks

```bash
$ marchen status add-dark-mode --json
```

```json
{
  "artifacts": [
    { "id": "proposal", "status": "filled",  "path": "proposal.md" },
    { "id": "specs",    "status": "filled",  "path": "specs/", "capabilities": ["theme-switching", "dark-color-scheme"] },
    { "id": "design",   "status": "filled",  "path": "design.md" },
    { "id": "tasks",    "status": "empty",   "path": "tasks.md" }
  ],
  "workflow": { "next": "tasks", "ready": ["tasks"], "blocked": [] }
}
```

specs + design 都 filled，tasks 终于从 blocked 变成 ready。

```bash
$ marchen instructions add-dark-mode tasks --json
```

```json
{
  "artifactId": "tasks",
  "outputPath": "tasks.md",
  "template": "## 1. <!-- 任务组名称 -->\n\n- [ ] 1.1 <!-- 任务描述 -->",
  "instruction": "根据 specs 的需求和 design 的技术方案，拆分实现任务...",
  "dependencies": [
    { "id": "specs", "status": "filled", "path": "specs/", "content": null },
    { "id": "design", "status": "filled", "path": "design.md", "content": "## 背景\n\n..." }
  ],
  "unlocks": []
}
```

`unlocks` 为空——tasks 是最后一个 artifact。

LLM 读 specs + design，生成 tasks 内容，写入 `tasks.md`。

### Step 6: 最终状态

```bash
$ marchen status add-dark-mode --json
```

```json
{
  "artifacts": [
    { "id": "proposal", "status": "filled", "path": "proposal.md" },
    { "id": "specs",    "status": "filled", "path": "specs/", "capabilities": ["theme-switching", "dark-color-scheme"] },
    { "id": "design",   "status": "filled", "path": "design.md" },
    { "id": "tasks",    "status": "filled", "path": "tasks.md" }
  ],
  "workflow": { "next": null, "ready": [], "blocked": [] },
  "tasks": { "total": 11, "completed": 0, "items": [...] }
}
```

`workflow.next` 为 `null`，所有 artifact filled。可以开始 `/marchen:apply` 实现任务。

### 流程总结

```
每一步都是同一个模式:

  status --json → 看 workflow.next → instructions --json → LLM 生成 → 写入文件

Skill 不需要知道工作流顺序，CLI 的 workflow.next 已经算好了。
```

---

## 四-C、与 OpenSpec 的对比

### 相同点

Skill 的消费方式完全一样：`status → instructions → 生成 → 写入`。

### 不同点

| 维度 | OpenSpec | MarchenSpec |
|------|---------|-------------|
| 工作流定义 | `schema.yaml` 声明式 | 硬编码在 ChangeManager |
| 多 schema | 支持（spec-driven, task-only, 自定义） | 不支持，只有 spec-driven |
| 依赖计算 | ArtifactGraph 类，Kahn 拓扑排序 | 简单 if/else 规则 |
| 完成检测 | 文件存在 = 完成 | 内容感知（empty vs filled） |
| new 命令 | 只创建目录 + metadata | 创建目录 + 所有 artifact 模板文件 |
| instructions 来源 | schema.yaml 的 instruction 字段 | config 包的常量 |
| template 来源 | schemas/\*/templates/\*.md 文件 | config 包的常量 |
| 代码量 | artifact-graph ~400 行 | ChangeManager 扩展 ~100 行 |

### 核心差异：文件存在 vs 内容感知

```
OpenSpec:
  new 不创建 artifact 文件 → 文件出现 = 有人写了内容 → 文件存在即完成

MarchenSpec:
  new 创建所有 artifact 文件（模板骨架）→ 文件始终存在 → 必须检查内容才知道填没填
```

MarchenSpec 的 `new` 设计让用户创建变更后就能看到完整文件结构和模板提示，体验更好。代价是需要内容感知检测，但这反而提供了更精确的状态信息。

---

## 五、改动范围

### 需要修改的包

| 包 | 改动 |
|----|------|
| `packages/shared` | 新增 StatusResult、InstructionsResult 等类型；移除 VerifyResult、ArtifactStatus |
| `packages/config` | 新增 ARTIFACT_INSTRUCTIONS 常量（每个 artifact 的 LLM 指导文本） |
| `packages/core` | ChangeManager 新增 status()、getInstructions()；移除 verify()；新增内容检测逻辑 |
| `apps/cli` | 新增 status、instructions 命令；移除 verify 命令 |

### 不受影响

- `marchen init` / `marchen new` / `marchen list` / `marchen archive`
- 文件结构和 metadata 格式
- 包依赖关系

---

## 六、未来扩展

### 如果需要多 schema

从固定规则重构到 schema 驱动。当前硬编码的依赖规则可以迁移到 schema.yaml，但现在不做。

### Skill 层

CLI 提供 JSON API 后，可以开发 Claude Code skills：
- `skill:continue` — 调 status → 找 ready artifact → 调 instructions → LLM 生成 → 写入
- `skill:propose` — 调 new → 循环 continue 直到所有 artifact filled
- `skill:explore` — 纯对话模式，不写文件

### 可选的 specs 生成

如果项目规模增长，可以考虑 `marchen specs build` 生成持久化的 specs/ 目录（加入 .gitignore）。
