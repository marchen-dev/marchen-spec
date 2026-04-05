## 1. shared 包：类型定义

- [x] 1.1 新增 `ArtifactContentStatus` 类型（`'empty' | 'filled' | 'missing' | 'no-content'`）
- [x] 1.2 新增 `ArtifactStatusDetail` 接口（id, status, path, capabilities?）
- [x] 1.3 新增 `WorkflowStatus` 接口（next, ready, blocked）
- [x] 1.4 新增 `StatusResult` 接口（name, schema, artifacts, workflow, tasks）
- [x] 1.5 新增 `DependencyInfo` 接口（id, status, path, content?）
- [x] 1.6 新增 `InstructionsResult` 接口（changeName, artifactId, outputPath, template, instruction, dependencies, unlocks）
- [x] 1.7 移除 `VerifyResult` 和 `ArtifactStatus` 类型，更新 index.ts 导出

## 2. config 包：artifact 指导文本

- [x] 2.1 新建 `src/instructions.ts`，定义 `ARTIFACT_INSTRUCTIONS` 常量（proposal/specs/design/tasks 各自的 LLM 指导文本）
- [x] 2.2 更新 `src/index.ts` 导出 `ARTIFACT_INSTRUCTIONS`

## 3. core 包：ChangeManager 扩展

- [x] 3.1 实现 `detectContentStatus(filePath)` 私有方法 — 读取文件内容，去掉 HTML 注释/空行/标题行，判断 empty vs filled
- [x] 3.2 实现 `detectSpecsStatus(specsDir)` 私有方法 — 检测 specs 目录状态（no-content/filled）和 capabilities 列表
- [x] 3.3 实现 `detectTasksStatus(tasksPath)` 私有方法 — 检测 tasks 内容状态（empty/filled）并解析 checkbox 进度（tasks 进度通过 StatusResult.tasks 表达，不影响 artifact status）
- [x] 3.4 实现 `computeWorkflow(artifactStatuses)` 私有方法 — 根据固定依赖规则计算 ready/blocked/next
- [x] 3.5 实现 `status(name)` 公共方法 — 组合以上方法，返回 StatusResult
- [x] 3.6 实现 `getInstructions(name, artifactId)` 公共方法 — 返回 InstructionsResult（含依赖内容拼接）
- [x] 3.7 移除 `verify(name)` 方法

## 4. cli 包：命令注册

- [x] 4.1 新建 `src/commands/status.ts` — 注册 status 命令，支持 --json 标志，实现人类友好输出
- [x] 4.2 新建 `src/commands/instructions.ts` — 注册 instructions 命令，默认输出 JSON
- [x] 4.3 更新 `src/program.ts` — 注册 status 和 instructions，移除 verify 注册
- [x] 4.4 删除 `src/commands/verify.ts`

## 5. 测试

- [x] 5.1 core 包：测试 detectContentStatus（模板骨架 → empty，有内容 → filled，不存在 → missing）
- [x] 5.2 core 包：测试 detectSpecsStatus（空目录 → no-content，有文件 → filled）
- [x] 5.3 core 包：测试 detectTasksStatus（empty/filled + checkbox 进度解析）
- [x] 5.4 core 包：测试 computeWorkflow（各种 artifact 状态组合下的 ready/blocked/next）
- [x] 5.5 core 包：测试 status() 集成（完整 StatusResult 输出）
- [x] 5.6 core 包：测试 getInstructions()（模板、指导文本、依赖内容拼接）
- [x] 5.7 移除 verify 相关测试
