## 1. 类型重构（shared）

- [x] 1.1 `DependencyInfo` 重命名为 `ContextInfo`
- [x] 1.2 `InstructionsResult` 中 `dependencies` 重命名为 `context`（类型 `ContextInfo[]`）
- [x] 1.3 `InstructionsResult` 中 `outputPath`、`template`、`unlocks` 改为 `T | null`
- [x] 1.4 新增 `ApplyState` 类型（`'ready' | 'blocked' | 'all_done'`）
- [x] 1.5 新增 `ApplyProgress` 类型（`{ total, completed, remaining }`）
- [x] 1.6 `InstructionsResult` 新增 `state: ApplyState | null` 和 `progress: ApplyProgress | null`

## 2. 核心逻辑（core）

- [x] 2.1 `getInstructions` 中 `dependencies` 变量名改为 `context`，返回值字段同步
- [x] 2.2 `getInstructions` 返回值中 `state: null`、`progress: null`
- [x] 2.3 新增 `parseTaskProgress(content)` 私有方法：正则统计 checkbox
- [x] 2.4 新增 `getApplyInstructions(name)` 方法：收集所有 artifact context + 计算 state/progress
- [x] 2.5 新增 `APPLY_INSTRUCTION` 常量到 config 包

## 3. CLI 路由（cli）

- [x] 3.1 `instructions.ts` 中 artifactId === 'apply' 时调用 `getApplyInstructions`

## 4. Skill 模板（config）

- [x] 4.1 新增 `templates/commands/apply.md`
- [x] 4.2 新增 `templates/skills/apply.md`
- [x] 4.3 `templates/commands/propose.md` 中 `dependencies` → `context`
- [x] 4.4 `templates/skills/propose.md` 中 `dependencies` → `context`

## 5. 测试

- [x] 5.1 现有 instructions 测试：`dependencies` 断言改为 `context`，新增 `state: null` / `progress: null` 断言
- [x] 5.2 新增 `getApplyInstructions` 测试：blocked / ready / all_done 三种状态
- [x] 5.3 新增 `parseTaskProgress` 测试
