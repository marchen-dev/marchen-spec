# verify 命令设计思路

> 日期: 2026-04-05
> 状态: 探索中

## 背景

OpenSpec 的 `/opsx:verify` 是纯 AI skill，让 AI 读 artifacts、搜代码、生成验证报告。MarchenSpec 选择 CLI + skill 混合方案，让 CLI 做确定性的结构化检查，AI 做语义级验证。

## 参考：OpenSpec verify 的三个维度

OpenSpec verify 从三个维度检查实现：

1. **Completeness（完整性）** — tasks 是否全部完成，requirements 是否都有实现
2. **Correctness（正确性）** — 实现是否匹配 spec 意图，场景是否有测试覆盖
3. **Coherence（一致性）** — 是否遵循 design 决策，代码风格是否一致

报告按严重程度分级：CRITICAL → WARNING → SUGGESTION

## 设计决策：CLI + Skill 混合

### CLI 层（确定性检查）

`marchen verify <name>` 做两件事：

1. **Artifact 存在性** — 检查 proposal.md / design.md / tasks.md / specs/ 是否存在，specs/ 下有几个 capability
2. **Task 完成度** — 解析 tasks.md 中的 `- [x]` / `- [ ]`，报告 X/N 完成，列出未完成项

输出示例：

```
Verification: refactor-error-handling

Artifacts
✓ proposal.md
✓ design.md
✓ tasks.md
✓ specs/  (2 个 capability)
  · error-hierarchy
  · cli-error-handling

Tasks: 5/7 完成
☐ 实现错误处理
☐ 添加单元测试
```

支持 `--json` 输出结构化数据，供 skill 层消费。

### Skill 层（AI 语义验证）

`/opsx:verify` 调用 `marchen verify <name> --json` 获取结构化数据，然后 AI 做：

- 从 specs/ 提取需求和场景，搜代码验证是否有对应实现
- 读 design.md 提取关键决策，检查代码是否遵循
- 检查新代码是否符合项目已有模式
- 生成带 CRITICAL / WARNING / SUGGESTION 分级的验证报告

### 为什么 CLI 不解析 requirements / scenarios

1. **格式不固定** — spec 标记可能是中文（`### 需求:`）或英文（`### Requirement:`），硬编码解析脆弱
2. **提取无意义** — 没有 AI 做语义匹配，requirement 列表对用户只是一堆文字
3. **职责清晰** — CLI 做确定性检查，AI 做语义判断，各司其职

### 方案选择：纯信息展示（方案 A）

CLI 的 verify 是信息展示，不做通过/失败判断。所有"是否 ready for archive"的判断留给 AI skill。

理由：verify 的核心价值在语义验证（需求有没有实现、设计有没有遵循），这只有 AI 能做。CLI 层做通过/失败判断意义不大。

## 架构分层

```
┌─────────────── CLI 层 ──────────────────┐
│  marchen verify <name> [--json]          │
│  · artifact 存在性检查                    │
│  · task checkbox 计数                    │
│  · 终端友好展示 / JSON 输出               │
└────────────────┬─────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │  core: ChangeManager    │
    │  · verify(name) 方法     │
    │  · 返回 VerifyResult     │
    └────────────┬────────────┘
                 │
    ┌────────────┴────────────┐
    │  fs 包: 文件读取         │
    └─────────────────────────┘

┌─────────────── Skill 层 ────────────────┐
│  /opsx:verify                            │
│  · 调用 marchen verify --json            │
│  · 读 specs/ 提取需求和场景               │
│  · 搜代码验证实现                         │
│  · 读 design.md 检查决策遵循              │
│  · 生成分级验证报告                       │
└──────────────────────────────────────────┘
```

## 实现范围

### 需要新增

- `packages/core`: ChangeManager 新增 `verify(name)` 方法
- `apps/cli`: 新增 `commands/verify.ts`
- `packages/shared`: 新增 `VerifyResult` 类型

### 不受影响

- 现有命令（init / new / list / archive）
- Skill 层（`/opsx:verify` 已存在，后续可适配调用 CLI）
