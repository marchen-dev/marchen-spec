## Context

MarchenSpec 已有 init / new / list / archive 四个命令，工作流中缺少 archive 前的验证环节。核心架构为 `ChangeManager` 类（core 包）+ CLI 命令文件（cli 包），所有文件操作通过 fs 包。

verify 采用 CLI + skill 混合方案：CLI 做确定性的结构化检查，AI skill（`/opsx:verify`）做语义级验证。CLI 层是纯信息展示，不做通过/失败判断。

## Goals / Non-Goals

**Goals:**
- 提供 `marchen verify <name>` 命令，展示变更的 artifact 完整度和 task 完成情况
- 支持 `--json` 输出结构化数据，供 AI skill 层消费
- 遵循现有的分层架构：shared（类型）→ core（逻辑）→ cli（展示）

**Non-Goals:**
- 不做通过/失败判断（留给 AI skill）
- 不解析 requirements / scenarios（格式不固定，中英文都可能出现，留给 AI）
- 不做语义级验证（代码是否匹配 spec 意图）

## Decisions

### 1. CLI 纯信息展示，不做判断

CLI 只展示事实数据（哪些 artifact 存在、task 完成度），不输出 CRITICAL / WARNING 等判断。

理由：verify 的核心价值在语义验证（需求有没有实现、设计有没有遵循），这只有 AI 能做。CLI 做通过/失败判断意义不大，反而增加维护成本。

### 2. tasks 返回全部 items，CLI 只展示未完成

`VerifyResult.tasks.items` 包含所有 task（含已完成），CLI 展示时只列未完成项。

理由：`--json` 输出的数据更完整，skill 层可以拿到全貌做更精确的分析。

### 3. 不解析 spec 中的 requirements / scenarios

CLI 只检查 specs/ 目录下有哪些 capability（子目录名），不解析 spec.md 内容。

理由：spec 标记可能是中文（`### 需求:`）或英文（`### Requirement:`），硬编码解析脆弱。提取出的 requirement 列表在没有 AI 语义匹配的情况下对用户无 actionable 信息。

### 4. 遵循现有命令模式

跟 archive / list 命令保持一致的代码组织：
- `ChangeManager.verify(name)` 返回 `VerifyResult`
- `commands/verify.ts` 注册 CLI 命令
- 使用 `@clack/prompts` 做终端 UI

## Risks / Trade-offs

- [tasks.md 格式变化] → 正则 `/^- \[([ x])\] (.+)$/gm` 足够健壮，checkbox 是 markdown 标准格式
- [specs/ 为空目录] → capabilities 列表为空数组，不报错
