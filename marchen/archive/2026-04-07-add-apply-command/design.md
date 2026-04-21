## 背景

`marchen instructions` 当前只服务于 propose 阶段——传入 artifactId（proposal/specs/design/tasks），返回模板、指导文本和依赖内容。apply 阶段没有对应的 CLI 端点，AI 需要多次调用 status + 手动读文件来拼凑上下文。

现有 `InstructionsResult` 类型中 `dependencies` 字段名暗示"依赖关系"，但对 apply 阶段来说这些是"上下文"而非"依赖"。

## 目标与非目标

**目标：**
- `instructions` 命令成为所有 skill 的统一上下文入口（propose + apply）
- 一次 CLI 调用返回 apply 所需的全部信息
- 类型统一，创建和实现阶段共享 `InstructionsResult`

**非目标：**
- 不新增独立的 CLI 命令（不加 `marchen apply`）
- 不支持多 schema（当前只有 spec-driven）
- 不做任务解析（progress 只统计 checkbox，不解析任务内容）

## 决策

### 复用 instructions 命令而非新增命令

`apply` 作为特殊的 artifactId 传入 `marchen instructions <name> apply`。CLI 层路由：apply 走 `getApplyInstructions()`，其他走现有 `getInstructions()`。

理由：instructions 的本质是"给 AI 返回执行某个动作所需的上下文和指引"，apply 符合这个语义。不需要新命令。

### 统一返回类型，可选字段区分阶段

不用联合类型或泛型，而是让创建阶段专属字段（`outputPath`、`template`、`unlocks`）和 apply 专属字段（`state`、`progress`）都为可选（`T | null`）。

理由：JSON 输出天然支持 null，AI 消费时不需要类型判断，直接看字段有没有值。

### dependencies 重命名为 context

`DependencyInfo` → `ContextInfo`，`dependencies` → `context`。字段结构不变（id, status, path, content?）。

理由：对 apply 阶段，所有 artifact 都是上下文而非依赖。对创建阶段，"上下文"也比"依赖"更准确。

### specs 内容保持拼接方案

多个 spec 文件拼接为一个 content 字符串，用 `--- specs/<name>/spec.md ---` 分隔。不展开为多个 context 条目。

理由：AI 消费时不需要按 spec 分别处理，拼接后的字符串已经足够清晰。展开会打破 id 和 schema artifact 定义的对应关系。

### progress 通过 checkbox 正则统计

复用现有的 `parseTaskProgress` 逻辑（如果有）或新增：正则匹配 `- [ ]` 和 `- [x]`，统计 total/completed/remaining。

理由：tasks.md 的格式是固定的 markdown checkbox，正则足够可靠。

## 风险与权衡

- **Breaking change**：`dependencies` → `context` 会影响 propose skill 模板和测试。但 CLI 还没有外部用户，可以接受。
- **可选字段多**：`InstructionsResult` 有多个 `T | null` 字段，类型不如两个独立接口精确。但 JSON 消费场景下这不是问题，AI 不做类型检查。
- **apply 绕过 schema 校验**：现有 `getInstructions` 会校验 artifactId 是否在 schema.artifacts 中，apply 不在。需要在校验前路由。
