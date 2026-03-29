import type { SchemaDefinition } from '@marchen-spec/shared'

/**
 * 默认 schema 定义（spec-driven）
 *
 * 定义标准的 proposal → specs → design → tasks 工作流
 */
export const DEFAULT_SCHEMA: SchemaDefinition = {
  name: 'spec-driven',
  artifacts: [
    { id: 'proposal', generates: 'proposal.md', requires: [] },
    { id: 'specs', generates: 'specs/', requires: ['proposal'] },
    { id: 'design', generates: 'design.md', requires: ['proposal'] },
    { id: 'tasks', generates: 'tasks.md', requires: ['specs', 'design'] },
  ],
}
