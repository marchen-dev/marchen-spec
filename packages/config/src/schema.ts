import type { SchemaDefinition } from '@marchen-spec/shared'
import { ValidationError } from '@marchen-spec/shared'
import {
  DESIGN_TEMPLATE,
  PROPOSAL_TEMPLATE,
  TASKS_TEMPLATE,
} from './templates.js'

/**
 * lite schema 的 tasks 模板（带背景章节）
 */
const LITE_TASKS_TEMPLATE = `## 背景

<!-- 简要说明这个变更的目的和方案 -->

## 1. <!-- 任务组名称 -->

- [ ] 1.1 <!-- 任务描述 -->
- [ ] 1.2 <!-- 任务描述 -->
`

/**
 * apply 阶段的指导文本（所有 schema 共用）
 */
export const APPLY_INSTRUCTION = `按 tasks.md 逐个实现任务，完成后勾选 checkbox。
- 每完成一个任务立即将 - [ ] 改为 - [x]
- 改动最小化，只做任务要求的事
- 不确定就暂停问，不要猜
- 如果发现设计问题，暂停并建议更新 artifact`

/**
 * 内置 schema 定义
 *
 * full: 完整工作流 proposal → specs → design → tasks
 * lite: 轻量工作流，只有 tasks（适合 explore 之后快速执行）
 */
export const SCHEMAS: Record<string, SchemaDefinition> = {
  full: {
    name: 'full',
    artifacts: [
      {
        id: 'proposal',
        generates: 'proposal.md',
        requires: [],
        template: PROPOSAL_TEMPLATE,
        instruction: `根据用户的描述，填写 proposal 的各个部分。
- 动机：说明为什么要做这个变更，解决什么问题
- 变更内容：列出具体改动
- 能力：列出需要创建 spec 的 capability（kebab-case 命名），每个会生成 specs/<name>/spec.md
- 影响范围：说明涉及的代码和系统
保持简洁，1-2 页。聚焦"为什么"和"做什么"，不要写实现细节。`,
      },
      {
        id: 'specs',
        generates: 'specs/',
        requires: ['proposal'],
        instruction: `根据 proposal 中列出的能力，为每个能力创建 specs/<name>/spec.md。
- 每个需求用 '### 需求:' 开头，使用 SHALL/MUST 表述
- 每个场景用 '#### 场景:' 开头，使用 WHEN/THEN 格式
- 每个需求至少一个场景
- 场景应该是可测试的`,
      },
      {
        id: 'design',
        generates: 'design.md',
        requires: ['proposal'],
        template: DESIGN_TEMPLATE,
        instruction: `根据 proposal 的动机和 specs 的需求，设计技术实现方案。
- 背景：当前状态和约束
- 目标与非目标：明确范围
- 决策：关键技术选择和理由（为什么选 X 而不是 Y）
- 风险与权衡：已知限制和可能出错的地方
聚焦架构和方案，不要写逐行实现细节。`,
      },
      {
        id: 'tasks',
        generates: 'tasks.md',
        requires: ['specs', 'design'],
        template: TASKS_TEMPLATE,
        instruction: `根据 specs 的需求和 design 的技术方案，拆分实现任务。
- 按任务组分组，每组用 ## 标题
- 每个任务用 checkbox 格式：- [ ] X.Y 描述
- 任务粒度要小到一个会话内能完成
- 按依赖顺序排列（先做的在前）`,
      },
    ],
  },
  lite: {
    name: 'lite',
    artifacts: [
      {
        id: 'tasks',
        generates: 'tasks.md',
        requires: [],
        template: LITE_TASKS_TEMPLATE,
        instruction: `根据背景描述，拆分实现任务。
- 按任务组分组，每组用 ## 标题
- 每个任务用 checkbox 格式：- [ ] X.Y 描述
- 任务粒度要小到一个会话内能完成
- 按依赖顺序排列（先做的在前）`,
      },
    ],
  },
}

/** 默认 schema 名称 */
export const DEFAULT_SCHEMA_NAME = 'full'

/**
 * 按名称查找 schema
 *
 * @param name - schema 名称
 * @returns SchemaDefinition
 * @throws {ValidationError} schema 不存在时抛出，附带可用列表
 */
export function getSchema(name: string): SchemaDefinition {
  const schema = SCHEMAS[name]
  if (!schema) {
    const available = Object.keys(SCHEMAS).join(', ')
    throw new ValidationError(
      `Schema "${name}" 不存在，可用的 schema: ${available}`,
    )
  }
  return schema
}
