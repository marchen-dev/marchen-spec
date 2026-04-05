## Why

MarchenSpec CLI 目前缺少让 AI Skill 驱动工作流的 JSON API。`marchen new` 创建变更后，Skill 无法知道哪些 artifact 已填充、下一步该做什么、以及如何填充某个 artifact。需要 `status` 和 `instructions` 两个命令作为 Skill 层的"眼睛"和"大脑"。

同时，现有的 `verify` 命令功能被 `status` 完全覆盖，应直接移除。

## What Changes

- 新增 `marchen status <name> [--json]` 命令 — 内容感知的 artifact 状态检测 + 工作流建议
- 新增 `marchen instructions <name> <artifact-id> [--json]` 命令 — 返回模板、指导文本、依赖内容
- 新增 `ARTIFACT_INSTRUCTIONS` 常量 — 每个 artifact 的 LLM 指导文本
- **BREAKING**: 移除 `marchen verify` 命令、`ChangeManager.verify()` 方法、`VerifyResult` 和 `ArtifactStatus` 类型

## Capabilities

### New Capabilities
- `status-command`: status 命令的 CLI 注册、人类友好输出和 JSON 输出
- `instructions-command`: instructions 命令的 CLI 注册和 JSON 输出
- `content-detection`: 内容感知状态检测逻辑（区分 empty/filled/missing）
- `workflow-computation`: 固定工作流规则计算（ready/blocked/next）

### Modified Capabilities
（无）

## Impact

- `packages/shared` — 新增类型定义，移除 VerifyResult 和 ArtifactStatus
- `packages/config` — 新增 ARTIFACT_INSTRUCTIONS 常量
- `packages/core` — ChangeManager 新增 status()、getInstructions()，移除 verify()
- `apps/cli` — 新增 status、instructions 命令，移除 verify 命令
- `openspec/specs/verify-command/` — 该 spec 作废（verify 被移除）
