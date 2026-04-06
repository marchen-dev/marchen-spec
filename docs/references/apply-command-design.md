# apply 命令设计记录

## 背景

apply 是 MarchenSpec 的实现阶段命令，读取 tasks.md 中的 checkbox 任务列表，逐个实现并勾选。

## 核心设计决策

### 1. `dependencies` → `context` 重命名

`InstructionsResult` 中原来的 `dependencies` 字段改为 `context`，对应类型从 `DependencyInfo` 改为 `ContextInfo`。

原因：apply 阶段需要所有 artifact 的内容作为上下文，不仅仅是"依赖"关系。`context` 更准确地描述了这些数据的用途。

### 2. `InstructionsResult` 扩展为可空字段

`outputPath`、`template`、`unlocks` 改为 `T | null`，新增 `state: ApplyState | null` 和 `progress: ApplyProgress | null`。

原因：apply 不是一个 artifact（没有模板、没有输出路径、不解锁其他 artifact），但复用 `InstructionsResult` 可以让 CLI 路由保持统一（`instructions <name> apply`）。用 null 区分 artifact 指令和 apply 指令。

### 3. CLI 路由：`instructions <name> apply`

没有新建独立命令，而是在现有 `instructions` 命令中判断 `artifactId === 'apply'` 分发到 `getApplyInstructions`。

原因：保持 CLI 接口一致，skill 模板中调用方式统一。

### 4. `parseTaskItems` 提取为私有方法

原来 `status` 方法中内联的 checkbox 解析逻辑提取为 `parseTaskItems`，`parseTaskProgress` 基于它计算进度。

原因：status 和 apply 都需要解析 tasks.md，避免重复。

### 5. ApplyState 三态设计

- `blocked`：tasks.md 不存在或为空（需要先完成 artifacts）
- `ready`：有未完成任务
- `all_done`：所有任务已勾选

### 6. 与 OpenSpec 的差异

对比 OpenSpec 的 apply skill：
- OpenSpec 返回 `contextFiles`（文件路径列表），LLM 自己读文件；MarchenSpec 直接在 JSON 中返回 `content`，减少一步 IO
- OpenSpec 用 flag 风格 CLI（`--change "<name>"`）；MarchenSpec 用 positional（`<name> <artifact-id>`）
- OpenSpec 的 skill frontmatter 更丰富（license、version、compatibility）；MarchenSpec 目前只有 name + description

## 文件变更清单

- `packages/shared/src/types.ts` — 类型重构（ContextInfo、ApplyState、ApplyProgress、InstructionsResult 扩展）
- `packages/core/src/change-manager.ts` — getApplyInstructions、parseTaskItems、parseTaskProgress
- `packages/config/src/instructions.ts` — apply 指导文本
- `packages/config/templates/commands/apply.md` — command 模板
- `packages/config/templates/skills/apply.md` — skill 模板
- `packages/config/templates/commands/propose.md` — dependencies → context
- `packages/config/templates/skills/propose.md` — dependencies → context
- `apps/cli/src/commands/instructions.ts` — apply 路由
- `packages/core/test/change-manager.test.ts` — 测试更新 + 新增 apply 测试
- `packages/core/test/workspace.test.ts` — skill 数量断言更新
