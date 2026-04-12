# lite-schema

## 目的

只有 tasks 一个 artifact 的轻量工作流，适合 explore 之后的快速执行。

## 需求

### 需求: lite schema SHALL 只包含 tasks 一个 artifact

lite schema 的 artifacts 数组 MUST 只有一个元素：tasks，且 requires 为空数组。

#### 场景: 创建 lite 变更

WHEN 执行 `marchen new my-fix --schema lite`
THEN 变更目录下只生成 tasks.md 一个文件（加 .metadata.yaml）
AND 不生成 proposal.md、design.md、specs/

### 需求: lite 的 tasks 模板 SHALL 包含背景章节

tasks.md 模板 MUST 在任务列表之前包含 `## 背景` 章节，供用户填写变更目的和方案。

#### 场景: 查看 lite 变更的 tasks 模板

WHEN 创建 lite 变更后查看 tasks.md
THEN 文件包含 `## 背景` 章节（带注释提示）和任务 checkbox 骨架

### 需求: lite 的 tasks instruction SHALL 不引用 specs 和 design

instruction 文本 MUST 不提及 specs、design、capability 等 full 特有概念。

#### 场景: 获取 lite tasks 的 instruction

WHEN 执行 `marchen instructions my-fix tasks --json`
THEN 返回的 instruction 引导 AI 根据背景描述拆分任务
AND 不包含 "specs"、"design" 等词
