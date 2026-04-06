## 动机

当前 `marchen instructions` 命令只支持创建 artifact 阶段（proposal/specs/design/tasks），不支持实现阶段。AI 在实现代码时需要手动拼接多次 CLI 调用（status + 读文件）来获取上下文，效率低且容易遗漏。

需要让 `instructions` 命令支持 `apply` 作为特殊的 artifactId，一次调用返回实现代码所需的全部上下文、进度和状态。同时统一 `InstructionsResult` 类型，将 `dependencies` 重命名为 `context`，使其同时服务于创建和实现两个阶段。

## 变更内容

- 新增 `getApplyInstructions(name)` 方法，返回实现阶段的指令（state、progress、所有 filled artifact 内容）
- 重构 `InstructionsResult` 类型：`dependencies` → `context`，新增可选的 `state` 和 `progress` 字段
- CLI `instructions` 命令路由：`artifactId === 'apply'` 走新方法，其他走现有逻辑
- 新增 apply skill 模板（commands/apply.md + skills/apply.md）

## 能力

### 新增能力

- `apply-instructions`: 通过 `marchen instructions <name> apply --json` 获取实现阶段的完整上下文和进度
- `apply-skill`: apply skill 模板，指导 AI 按 tasks.md 逐个实现任务

### 修改能力

- `instructions-api`: `InstructionsResult` 类型重构，`dependencies` → `context`，新增可选字段

## 影响范围

- `packages/shared/src/types.ts` — 类型定义
- `packages/core/src/change-manager.ts` — 核心逻辑
- `apps/cli/src/commands/instructions.ts` — CLI 路由
- `packages/config/` — 指令文本 + skill 模板
- `packages/core/test/` — 测试
- `packages/config/templates/commands/propose.md` + `skills/propose.md` — 字段引用更新
