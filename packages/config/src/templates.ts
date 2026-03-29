/**
 * Artifact 模板内容
 *
 * 每个 artifact 的初始 markdown 骨架，创建变更时写入对应文件
 */

/** proposal.md 模板 */
export const PROPOSAL_TEMPLATE = `## Why

<!-- 说明这个变更的动机。解决什么问题？为什么现在做？ -->

## What Changes

<!-- 描述具体变更内容。列出新增的能力、修改或移除的部分。 -->

## Capabilities

### New Capabilities
<!-- 新增的能力。使用 kebab-case 命名，每个会生成 specs/<name>/spec.md -->

### Modified Capabilities
<!-- 需要修改的现有能力。仅当规范级别的行为发生变化时才列出。 -->

## Impact

<!-- 受影响的代码、API、依赖或系统 -->
`

/** design.md 模板 */
export const DESIGN_TEMPLATE = `## Context

<!-- 背景和当前状态 -->

## Goals / Non-Goals

**Goals:**
<!-- 这个设计要达成什么 -->

**Non-Goals:**
<!-- 明确排除在范围之外的内容 -->

## Decisions

<!-- 关键技术决策和理由 -->

## Risks / Trade-offs

<!-- 已知风险和权衡 -->
`

/** tasks.md 模板 */
export const TASKS_TEMPLATE = `## 1. <!-- 任务组名称 -->

- [ ] 1.1 <!-- 任务描述 -->
- [ ] 1.2 <!-- 任务描述 -->
`

/**
 * Artifact ID 到模板内容的映射
 *
 * specs 类型不需要模板（只创建空目录）
 */
export const ARTIFACT_TEMPLATES: Record<string, string> = {
  proposal: PROPOSAL_TEMPLATE,
  design: DESIGN_TEMPLATE,
  tasks: TASKS_TEMPLATE,
}
